// Bhashini (Dhruva/ULCA) client — NMT translation, TTS, ASR.
// Auth (verified live 2026-09-27):
//   Config call : POST {CONFIG_URL} headers {userID, ulcaApiKey}  (userID = grey project id,
//                 ulcaApiKey = UDYAT KEY)  -> serviceIds + inference endpoint
//   Compute call: POST {COMPUTE_URL} header {Authorization: INFERENCE key}
// Env:
//   BHASHINI_USER_ID, BHASHINI_ULCA_API_KEY, BHASHINI_INFERENCE_API_KEY
//   optional: BHASHINI_PIPELINE_ID, BHASHINI_CONFIG_URL, BHASHINI_COMPUTE_URL
const axios = require('axios');
const { detectSpokenLang, familyMarkerWinner, DEVANAGARI_FAMILY } = require('./langDetect');

const CONFIG_URL = process.env.BHASHINI_CONFIG_URL || 'https://meity-auth.ulcacontrib.org/ulca/apis/v0/model/getModelsPipeline';
const COMPUTE_URL = process.env.BHASHINI_COMPUTE_URL || 'https://dhruva-api.bhashini.gov.in/services/inference/pipeline';
const PIPELINE_ID = process.env.BHASHINI_PIPELINE_ID || '64392f96daac500b55c543cd';

// Bhashini uses 'or' for Odia; accept 'od' alias from our app
function normLang(l) {
    if (!l) return 'en';
    const c = String(l).toLowerCase().split('-')[0];
    if (c === 'od') return 'or';
    return c;
}

const SUPPORTED = new Set(['en', 'hi', 'ta', 'ml', 'te', 'gu', 'mr', 'bn', 'kn', 'or', 'pa']);

function creds() {
    return {
        userID: process.env.BHASHINI_USER_ID || '',
        ulcaApiKey: process.env.BHASHINI_ULCA_API_KEY || '',
        inferenceKey: process.env.BHASHINI_INFERENCE_API_KEY || '',
    };
}

function isConfigured() {
    const c = creds();
    return !!(c.userID && c.ulcaApiKey && c.inferenceKey);
}

// ---- pipeline config discovery (cached 12h) ----
let configCache = null; // {at, nmt:Map, asr:Map, tts:Map, endpoint, authValue}
const CONFIG_TTL_MS = 12 * 60 * 60 * 1000;

async function getPipelineConfig(force = false) {
    if (configCache && !force && Date.now() - configCache.at < CONFIG_TTL_MS) return configCache;
    const { userID, ulcaApiKey, inferenceKey } = creds();
    if (!userID || !ulcaApiKey) throw new Error('Bhashini config credentials missing (BHASHINI_USER_ID / BHASHINI_ULCA_API_KEY)');
    const body = {
        pipelineTasks: [{ taskType: 'asr' }, { taskType: 'translation' }, { taskType: 'tts' }],
        pipelineRequestConfig: { pipelineId: PIPELINE_ID },
    };
    const r = await axios.post(CONFIG_URL, body, {
        headers: { userID, ulcaApiKey, 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout: 25000,
    });
    const entries = r.data?.pipelineResponseConfig || [];
    const nmt = new Map(); const asr = new Map(); const tts = new Map();
    for (const e of entries) {
        const task = e.taskType;
        for (const c of e.config || []) {
            const src = normLang(c.language?.sourceLanguage);
            const tgt = normLang(c.language?.targetLanguage);
            if (task === 'translation' && src && tgt && c.serviceId) nmt.set(`${src}>${tgt}`, c.serviceId);
            else if (task === 'asr' && src && c.serviceId && !asr.has(src)) asr.set(src, c.serviceId);
            else if (task === 'tts' && src && c.serviceId && !tts.has(src)) tts.set(src, c.serviceId);
        }
    }
    const ep = r.data?.pipelineInferenceAPIEndPoint || {};
    configCache = {
        at: Date.now(),
        nmt, asr, tts,
        endpoint: ep.callbackUrl || COMPUTE_URL,
        authValue: ep.inferenceApiKey?.value || inferenceKey,
    };
    return configCache;
}

async function compute(payload, timeout = 30000) {
    const { inferenceKey } = creds();
    if (!inferenceKey) throw new Error('BHASHINI_INFERENCE_API_KEY missing');
    let endpoint = COMPUTE_URL;
    try {
        const cfg = await getPipelineConfig();
        endpoint = cfg.endpoint || COMPUTE_URL;
    } catch {
        // config discovery failed — fall back to default endpoint (direct compute often still works for NMT)
    }
    const r = await axios.post(endpoint, payload, {
        headers: { Authorization: inferenceKey, 'Content-Type': 'application/json', Accept: 'application/json' },
        timeout,
    });
    return r.data;
}

function firstOutput(data) {
    const pr = data?.pipelineResponse?.[0];
    return pr?.output?.[0] || null;
}

// ---- public API ----
async function translateText(text, sourceLang = 'en', targetLang = 'hi') {
    const src = normLang(sourceLang), tgt = normLang(targetLang);
    if (!text || !text.trim()) return text;
    if (src === tgt) return text;
    if (!SUPPORTED.has(src) || !SUPPORTED.has(tgt)) throw new Error(`Unsupported pair ${src}>${tgt}`);
    let serviceId;
    try {
        const cfg = await getPipelineConfig();
        serviceId = cfg.nmt.get(`${src}>${tgt}`);
    } catch { /* direct compute without serviceId */ }
    // chunk long inputs (~400 chars on sentence boundaries)
    const chunks = [];
    let cur = '';
    for (const sent of String(text).split(/(?<=[.!?।\n])\s+/)) {
        if ((cur + ' ' + sent).length > 400 && cur) { chunks.push(cur.trim()); cur = sent; }
        else cur = (cur ? cur + ' ' : '') + sent;
    }
    if (cur.trim()) chunks.push(cur.trim());
    const out = [];
    for (const ch of chunks.slice(0, 12)) {
        const task = { taskType: 'translation', config: { language: { sourceLanguage: src, targetLanguage: tgt } } };
        if (serviceId) task.config.serviceId = serviceId;
        const data = await compute({ pipelineTasks: [task], inputData: { input: [{ source: ch }] } });
        const o = firstOutput(data);
        if (!o?.target) throw new Error('Empty Bhashini NMT response');
        out.push(o.target);
    }
    return out.join(' ');
}

async function textToSpeech(text, lang = 'hi') {
    const l = normLang(lang);
    if (!text || !text.trim()) throw new Error('Empty text for TTS');
    if (!SUPPORTED.has(l)) throw new Error(`TTS unsupported lang ${l}`);
    const clean = String(text).slice(0, 800);
    let serviceId;
    try {
        const cfg = await getPipelineConfig();
        serviceId = cfg.tts.get(l);
    } catch { /* direct compute */ }
    const task = { taskType: 'tts', config: { language: { sourceLanguage: l }, gender: 'female', samplingRate: 8000 } };
    if (serviceId) task.config.serviceId = serviceId;
    const data = await compute({ pipelineTasks: [task], inputData: { input: [{ source: clean }] } }, 45000);
    const audio = data?.pipelineResponse?.[0]?.audio?.[0]?.audioContent;
    if (!audio) throw new Error('Empty Bhashini TTS response');
    return { audioContent: audio, format: 'wav', engine: 'bhashini' };
}

async function speechToText(audioBase64, lang = 'auto', opts = {}) {
    if (!audioBase64) throw new Error('Empty audio for ASR');
    const audioFormat = opts.audioFormat || 'wav';
    const samplingRate = opts.samplingRate || 16000;

    // Resolve the spoken language first when caller passes 'auto' (default):
    // UI may be English while the fisherman speaks Hindi/Tamil/etc.
    // NOTE: audio language detection is not enabled on this endpoint, so
    // 'auto' tries hi/mr/en with per-candidate script validation (a wrong-
    // language model on Malayalam audio must not return 'hi'). Callers that
    // know better (script or txt-lang-detection) pass an explicit lang.
    let target = normLang(lang || 'auto');
    if (target === 'auto') target = '';
    const candidates = target && SUPPORTED.has(target)
        ? [target]
        : ['hi', 'mr', 'en']; // most likely fisherman languages first
    // Strong (3): distinctive script match, or Devanagari WITH hi/mr marker
    // evidence. Weak (1): Devanagari tie with no markers, or English output.
    // Wrong-script output is rejected outright — confident garbage from a
    // wrong-language model must never be mislabelled (e.g. Malayalam audio
    // must not come back as 'hi').
    const scoreTranscript = (text, requested) => {
        const t = text && String(text).trim();
        if (!t) return null;
        const script = detectSpokenLang(t);
        if (script === 'en') {
            return requested === 'en' ? { transcript: t, detectedLang: 'en', score: 1 } : null;
        }
        if (script === requested) {
            if (DEVANAGARI_FAMILY.has(requested)) {
                const winner = familyMarkerWinner(t);
                return { transcript: t, detectedLang: requested, score: winner ? 3 : 1 };
            }
            return { transcript: t, detectedLang: script, score: 3 };
        }
        if (DEVANAGARI_FAMILY.has(script) && DEVANAGARI_FAMILY.has(requested)) {
            const winner = familyMarkerWinner(t);
            return { transcript: t, detectedLang: script, score: winner ? 3 : 1 };
        }
        return null;
    };
    let lastErr = null;
    let bestWeak = null;
    for (const l of candidates) {
        try {
            let serviceId;
            try {
                const cfg = await getPipelineConfig();
                serviceId = cfg.asr.get(l);
            } catch { /* direct compute */ }
            const task = { taskType: 'asr', config: { language: { sourceLanguage: l }, audioFormat, samplingRate } };
            if (serviceId) task.config.serviceId = serviceId;
            const data = await compute(
                { pipelineTasks: [task], inputData: { audio: [{ audioContent: audioBase64 }] } },
                60000
            );
            const o = firstOutput(data);
            const scored = scoreTranscript(o?.source, l);
            if (scored && scored.score >= 3) {
                return { transcript: scored.transcript, detectedLang: scored.detectedLang, engine: 'bhashini' };
            }
            if (scored && !bestWeak) bestWeak = scored;
            lastErr = new Error(`ASR ${l} rejected (weak/wrong script)`);
        } catch (e) {
            lastErr = e;
        }
    }
    if (bestWeak) {
        return { transcript: bestWeak.transcript, detectedLang: bestWeak.detectedLang, engine: 'bhashini' };
    }
    throw lastErr || new Error('Empty Bhashini ASR response');
}

// Detect the language of TEXT (incl. romanized/transliterated Indic text).
// Task type on this endpoint is `txt-lang-detection` (no serviceId needed).
// Returns {lang, score}. Throws when undetectable.
async function detectTextLanguage(text) {
    if (!text || !String(text).trim()) throw new Error('Empty text for language detection');
    const data = await compute(
        {
            pipelineTasks: [{ taskType: 'txt-lang-detection', config: {} }],
            inputData: { input: [{ source: String(text).slice(0, 1000) }] },
        },
        30000
    );
    const preds = data?.pipelineResponse?.[0]?.output?.[0]?.langPrediction || [];
    const top = preds[0];
    if (!top?.langCode) throw new Error('No language prediction returned');
    return { lang: normLang(top.langCode), score: top.langScore ?? null };
}

async function healthCheck() {
    if (!isConfigured()) return { configured: false, reachable: false };
    try {
        await getPipelineConfig();
        return { configured: true, reachable: true };
    } catch (e) {
        return { configured: true, reachable: false, error: e.message };
    }
}

module.exports = {
    isConfigured, getPipelineConfig, translateText, textToSpeech, speechToText,
    detectTextLanguage, healthCheck, SUPPORTED,
};
