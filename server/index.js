const path = require('path');
// Canonical key location: saagarsathi/server/.env (loaded first, wins).
// Falls back to saagarsathi/.env and CWD .env when present; missing files are skipped.
require('dotenv').config({ path: path.join(__dirname, '.env') });
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
require('dotenv').config();
const express = require('express');
const cors = require('cors');

const { orchestrate, getOffshoreOffsets } = require('./agents/index');
const { buildLocalizedAdvisory, detectLanguageFromText, supportedLanguages, LANG_NAMES } = require('./agents/bhashini');
const nvidia = require('./agents/nvidiaExplainer');
const bhashini = require('./agents/bhashiniClient');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const PORT = process.env.PORT || 3000;
// API contract version (must match API_VERSION in src/lib/api.ts).
// Bump both together whenever a response shape changes incompatibly.
const API_VERSION = 3;
// LLM Explainer backend: NVIDIA NIM (OpenAI-compatible). Deterministic
// rule-engine template is the automatic fallback when no key / on failure.
function hasLlmKey() { return nvidia.isConfigured(); }

function normLatLon(req) {
    let lat = parseFloat(req.query.lat ?? req.body?.lat ?? 9.9312);
    let lon = parseFloat(req.query.lon ?? req.body?.lon ?? 76.2673);
    if (Number.isNaN(lat)) lat = 9.9312;
    if (Number.isNaN(lon)) lon = 76.2673;
    return { lat, lon };
}

// GET /api/weather — backward compatible + enriched
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon } = normLatLon(req);
        const lang = req.query.lang || 'en';
        const o = await orchestrate(lat, lon, lang);
        res.json({
            status: o.risk.status,
            alertLevel: o.risk.legacyLevel,
            alertLevel5: o.risk.alertLevel,
            riskScore: o.risk.riskScore,
            message: o.risk.reasons.join('. ') || 'Safe conditions.',
            reasons: o.risk.reasons,
            advice: o.risk.advice,
            waveHeight: o.weather.waveHeight,
            swellHeight: o.weather.swellWaveHeight,
            windSpeed: o.weather.windSpeed,
            windDirection: o.weather.windDirection,
            precipitation: o.weather.precipitation,
            temperature: o.weather.temperature,
            sst: o.ocean.seaSurfaceTemperature,
            chlorophyll: o.ocean.chlorophyll,
            confidence: o.validation.confidence,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error fetching weather' });
    }
});

// GET /api/zones
app.get('/api/zones', async (req, res) => {
    try {
        const { lat, lon } = normLatLon(req);
        const lang = req.query.lang || 'en';
        const o = await orchestrate(lat, lon, lang);
        const dangerZones = [];
        // Buffer is drawn around the NEAREST IMBL segment (not a fixed one).
        const seg = (o.geofence.imblSegments[o.geofence.nearestSegIndex] || o.geofence.imblSegments[0]);
        if (o.geofence.distToIMBL < 60) {
            const w = 0.35;
            dangerZones.push({
                coordinates: [[seg.line[0][0] - w, seg.line[0][1] - w], [seg.line[0][0] + w, seg.line[0][1] - w], [seg.line[1][0] + w, seg.line[1][1] + w], [seg.line[1][0] - w, seg.line[1][1] + w]],
                title: 'IMBL Buffer Zone',
                desc: `${o.geofence.nearestBoundary} — ${o.geofence.distToIMBL} km away. ${o.geofence.warnings[0] || ''}`,
                wave: o.weather.waveHeight,
                dist: `${o.geofence.distToIMBL} km`,
                type: 'boundary',
            });
        }
        if (o.geofence.isInsideMPA) {
            const m = o.geofence.mpas[0];
            dangerZones.push({ coordinates: m.polygon, title: m.name, desc: 'Fishing is restricted here (MPA).', wave: 0, dist: '0 km', type: 'mpa' });
        }
        // hazard swell overlay near user if rough
        const wave = Math.max(o.weather.waveHeight || 0, o.weather.swellWaveHeight || 0);
        if (wave > 2.5) {
            const offsets = getOffshoreOffsets(lat, lon);
            const c = offsets.pfz1;
            const w = 0.15;
            dangerZones.push({
                coordinates: [[c.lat - w, c.lon - w], [c.lat - w, c.lon + w], [c.lat + w, c.lon + w], [c.lat + w, c.lon - w]],
                title: 'High-swell area', desc: `Wave height ${wave.toFixed(1)} m — avoid deep-sea transit.`, wave, dist: 'Offshore', type: 'hazard',
            });
        }
        res.json({
            dangerZones,
            // pfz already carries canonical shape from orchestrate()
            // (array center + lat/lon); re-assert defensively.
            pfz: o.pfz.map(z => ({
                ...z,
                center: z.centerArr || z.center,
                lat: z.lat, lon: z.lon,
            })),
            mpas: o.geofence.mpas,
            imbl: o.geofence.imblSegments,
            vessel: { lat, lon },
            geofence: { distToIMBL: o.geofence.distToIMBL, nearestBoundary: o.geofence.nearestBoundary, warnings: o.geofence.warnings },
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error fetching zones' });
    }
});

const CHIPS_BY_LANG = {
    hi: ['क्या आज मछली पकड़ना सुरक्षित है?', 'निकटतम PFZ कहाँ है?', 'IMBL सीमा की दूरी?', 'आपातकालीन सहायता'],
    ta: ['இன்று மீன்பிடிக்க பாதுகாப்பானதா?', 'அருகிலுள்ள PFZ எங்கே?', 'IMBL எல்லை தூரம்?', 'அவசர உதவி'],
    ml: ['ഇന്ന് കടലിൽ പോകുന്നത് സുരക്ഷിതമാണോ?', 'ഏറ്റവും അടുത്തുള്ള PFZ എവിടെ?', 'IMBL ദൂരം എത്ര?', 'അടിയന്തിര സഹായം'],
    te: ['ఈరోజు చేపల వేటకు వెళ్లడం సురక్షితమేనా?', 'సమీపంలోని PFZ ఎక్కడ ఉంది?', 'IMBL సరిహద్దు ఎంత దూరంలో ఉంది?', 'అత్యవసర సహాయం'],
    gu: ['શું આજે માછીમારી કરવી સુરક્ષિત છે?', 'નજીકનું PFZ ક્યાં છે?', 'IMBL સરહદ કેટલી દૂર છે?', 'કટોકટી સહાય'],
    mr: ['आज मासेमारी करणे सुरक्षित आहे का?', 'जवळचे PFZ कुठे आहे?', 'IMBL आंतरराष्ट्रीय सीमा किती दूर आहे?', 'आणीबाणी मदत'],
    bn: ['আজ মাছ ধরা কি নিরাপদ?', 'নিকটতম PFZ কোথায়?', 'IMBL সীমানা কত দূরে?', 'জরুরী সহায়তা'],
    kn: ['ಇಂದು ಮೀನುಗಾರಿಕೆಗೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತವೇ?', 'ಹತ್ತಿರದ PFZ ಎಲ್ಲಿದೆ?', 'IMBL ಗಡಿ ಎಷ್ಟು ದೂರದಲ್ಲಿದೆ?', 'ತುರ್ತು ಸಹಾಯ'],
    en: ['Is it safe to fish today?', 'Nearest PFZ?', 'IMBL distance?', 'Emergency help'],
};

// POST /api/chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, lang = 'en', context = {} } = req.body || {};
        if (!message || !String(message).trim()) return res.status(400).json({ error: 'message required' });
        
        // Auto-detect language of the question or use selected UI / voice language
        const detectedScriptLang = detectLanguageFromText(message);
        let targetLang = 'en';
        if (detectedScriptLang !== 'en') {
            targetLang = detectedScriptLang;
        } else if (context.voiceLang && context.voiceLang !== 'en') {
            targetLang = context.voiceLang.split('-')[0];
        } else if (lang && lang !== 'en') {
            targetLang = lang;
        }

        if (!supportedLanguages.includes(targetLang)) {
            targetLang = 'en';
        }

        const rawLat = context.lat ?? req.body?.lat ?? 9.9312;
        const rawLon = context.lon ?? req.body?.lon ?? 76.2673;
        let lat = parseFloat(rawLat);
        let lon = parseFloat(rawLon);
        if (Number.isNaN(lat)) lat = 9.9312;
        if (Number.isNaN(lon)) lon = 76.2673;
        const o = await orchestrate(lat, lon);
        
        let responseText;
        let explainer = 'rule-template';

        if (hasLlmKey()) {
            try {
                const langName = LANG_NAMES[targetLang] || targetLang;
                const intent = nvidia.detectIntent(message);
                const out = await nvidia.explainWithNvidia({
                    question: message, targetLang, langName, intent, o,
                });
                responseText = out.text;
                explainer = `nvidia:${out.model}:${out.intent}`;
            } catch (e) {
                console.error('NVIDIA explainer failed, using localized rule engine fallback:', e.message);
                responseText = buildLocalizedAdvisory(targetLang, o, lat, lon);
            }
        } else {
            responseText = buildLocalizedAdvisory(targetLang, o, lat, lon, message);
        }

        res.json({
            text: responseText,
            detectedLang: targetLang,
            explainer, // 'nvidia:<model>:<intent>' or 'rule-template'
            citations: [
                { text: 'Open-Meteo marine + forecast', url: 'https://open-meteo.com/' },
                { text: 'INCOIS (PFZ/OSF)', url: 'https://incois.gov.in/' },
                { text: 'IMD Mausam', url: 'https://mausam.imd.gov.in/' },
            ],
            chips: CHIPS_BY_LANG[targetLang] || CHIPS_BY_LANG.en,
            safety: o.risk,
            fishing: o.fishingOpportunity,
            why: o.risk.factors,
            provenance: o.provenance,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error in chat' });
    }
});

// GET /api/analytics — matches BOTH old + new frontend
app.get('/api/analytics', async (req, res) => {
    try {
        const { lat, lon } = normLatLon(req);
        const lang = req.query.lang || 'en';
        const o = await orchestrate(lat, lon, lang);
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const seedBase = Math.abs(Math.sin(lat * 12.9 + lon * 78.6) * 1000);
        const trends = days.map((name, i) => ({
            name,
            day: i + 1,
            sst: +(o.ocean.seaSurfaceTemperature + Math.sin(i * 1.1 + seedBase) * 0.6).toFixed(1),
            chl: +(Math.max(0.1, o.ocean.chlorophyll + Math.cos(i * 0.9 + seedBase) * 0.25)).toFixed(2),
        }));
        res.json({
            trends,
            sstTrends: trends.map(t => ({ day: t.day, value: t.sst })),
            chlorophyllTrends: trends.map(t => ({ day: t.day, value: t.chl })),
            bulletins: o.bulletins.map(b => ({
                source: b.source, title: b.title, desc: b.desc, message: `${b.title} — ${b.desc}`,
                time: b.time, type: b.type, url: b.url,
            })),
            anomaly: {
                detected: o.ocean.chlorophyll > 0.9 || o.weather.windSpeed > 30,
                message: o.ocean.chlorophyll > 0.9
                    ? (lang === 'hi' ? `क्लोरोफिल ${o.ocean.chlorophyll} mg/m³ सामान्य से अधिक — प्रबल PFZ संकेत।` : `Chlorophyll ${o.ocean.chlorophyll} mg/m³ above baseline — strong PFZ signal.`)
                    : o.weather.windSpeed > 30 ? (lang === 'hi' ? `हवा की गति ${o.weather.windSpeed} km/h औसत से अधिक — सावधानी बरतें।` : `Wind ${o.weather.windSpeed} km/h above 7-day mean — caution.`) : (lang === 'hi' ? 'कोई बड़ी असामान्यता नहीं।' : 'No major anomaly.'),
            },
            provenance: o.provenance,
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error in analytics' });
    }
});

// GET /api/orchestrator — full agent trace for UI pipeline view
app.get('/api/orchestrator', async (req, res) => {
    try {
        const { lat, lon } = normLatLon(req);
        const lang = req.query.lang || 'en';
        const o = await orchestrate(lat, lon, lang);
        const isHi = lang === 'hi';
        const agents = isHi ? [
            { name: 'इनपुट प्रोसेसर', status: 'ok', detail: `अक्षांश ${lat.toFixed(2)}, देशांतर ${lon.toFixed(2)}, भाषा: हिंदी` },
            { name: 'मौसम व महासागर एजेंट', status: o.weather.live ? 'ok' : 'degraded', detail: o.weather.source },
            { name: 'मत्स्य क्षेत्र (PFZ) विश्लेषक', status: 'ok', detail: `${o.pfz.length} क्षेत्र सक्रिय, उच्चतम स्कोर ${o.pfz[0]?.score ?? 0}` },
            { name: 'अंतर्राष्ट्रीय सीमा निगरानी', status: 'ok', detail: `IMBL दूरी ${o.geofence.distToIMBL} किमी` },
            { name: 'डेटा सत्यापन प्रणाली', status: o.validation.confidence === 'Low' ? 'warn' : 'ok', detail: `विश्वसनीयता: ${o.validation.confidence === 'High' ? 'उच्च' : 'मध्यम'}` },
            { name: 'सुरक्षा निर्णय इंजन', status: o.risk.alertLevel === 'DANGER' ? 'alert' : 'ok', detail: `${o.risk.alertLevel} (${o.risk.riskScore}/100)` },
            { name: 'एआई व्याख्याकार', status: hasLlmKey() ? 'ok' : 'fallback', detail: hasLlmKey() ? `nvidia:${nvidia.MODEL}` : 'नियम-आधारित व्याख्याकार' },
        ] : [
            { name: 'Input Processor', status: 'ok', detail: `lat ${lat}, lon ${lon}, lang ${lang}` },
            { name: 'Weather/Ocean Tool', status: o.weather.live ? 'ok' : 'degraded', detail: `${o.weather.source}` },
            { name: 'PFZ/Fishing Tool', status: 'ok', detail: `${o.pfz.length} zone(s), best score ${o.pfz[0]?.score ?? 0}` },
            { name: 'Geo/Border Tool', status: 'ok', detail: `IMBL ${o.geofence.distToIMBL} km` },
            { name: 'Data Validator', status: o.validation.confidence === 'Low' ? 'warn' : 'ok', detail: `confidence ${o.validation.confidence}` },
            { name: 'Safety Rule Engine', status: o.risk.alertLevel === 'DANGER' ? 'alert' : 'ok', detail: `${o.risk.alertLevel} (${o.risk.riskScore})` },
            { name: 'LLM Explainer', status: hasLlmKey() ? 'ok' : 'fallback', detail: hasLlmKey() ? `nvidia:${nvidia.MODEL}` : 'rule-based explainer (no key)' },
        ];
        res.json({ ...o, agents, safety: o.risk, fishing: o.fishingOpportunity, v: API_VERSION });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error in orchestrator' });
    }
});

app.get('/api/health', async (req, res) => {
    const bhashiniStatus = await bhashini.healthCheck().catch(() => ({ configured: false, reachable: false }));
    res.json({ ok: true, llm: { provider: 'nvidia', model: nvidia.MODEL, on: hasLlmKey() }, bhashini: bhashiniStatus, time: new Date().toISOString() });
});

// ---- Bhashini voice endpoints (NMT / TTS / ASR) ----

// POST /api/translate {text, sourceLang, targetLang} -> {translated, engine}
app.post('/api/translate', async (req, res) => {
    try {
        const { text, sourceLang = 'en', targetLang = 'hi' } = req.body || {};
        if (!text || !String(text).trim()) return res.status(400).json({ error: 'text required' });
        const translated = await bhashini.translateText(String(text).slice(0, 5000), sourceLang, targetLang);
        res.json({ translated, engine: 'bhashini' });
    } catch (e) {
        console.error('translate failed:', e.message);
        res.status(502).json({ error: `Bhashini translation failed: ${e.message}` });
    }
});

// POST /api/tts {text, lang} -> {audioContent (base64 wav), format, engine}
app.post('/api/tts', async (req, res) => {
    try {
        const { text, lang = 'hi' } = req.body || {};
        if (!text || !String(text).trim()) return res.status(400).json({ error: 'text required' });
        if (String(text).length > 800) return res.status(400).json({ error: 'text too long (max 800 chars)' });
        const out = await bhashini.textToSpeech(text, lang);
        res.json(out);
    } catch (e) {
        console.error('tts failed:', e.message);
        res.status(502).json({ error: `Bhashini TTS failed: ${e.message}` });
    }
});

// POST /api/detect-text {text} -> {lang, score, engine}
// Identifies the language of a transcript (incl. romanized Indic text like
// "aaj machli"), so the answer language follows what was SPOKEN, not the UI.
app.post('/api/detect-text', async (req, res) => {
    try {
        const { text } = req.body || {};
        if (!text || !String(text).trim()) return res.status(400).json({ error: 'text required' });
        const out = await bhashini.detectTextLanguage(text);
        res.json({ ...out, engine: 'bhashini' });
    } catch (e) {
        console.error('detect-text failed:', e.message);
        res.status(502).json({ error: `Language detection failed: ${e.message}` });
    }
});

// POST /api/asr {audioContent (base64 wav/flac), lang='auto'} -> {transcript, detectedLang, engine}
// lang='auto' (default) detects the SPOKEN language first, so a fisherman can speak
// Hindi while the UI is set to English and still get a Hindi answer.
app.post('/api/asr', async (req, res) => {
    try {
        const { audioContent, lang = 'auto', audioFormat = 'wav', samplingRate = 16000 } = req.body || {};
        if (!audioContent) return res.status(400).json({ error: 'audioContent (base64) required' });
        if (String(audioContent).length > 8 * 1024 * 1024) return res.status(400).json({ error: 'audio too large (max ~6MB)' });
        const out = await bhashini.speechToText(audioContent, lang, { audioFormat, samplingRate });
        res.json(out);
    } catch (e) {
        console.error('asr failed:', e.message);
        res.status(502).json({ error: `Bhashini ASR failed: ${e.message}` });
    }
});

app.get('/', (req, res) => res.json({ name: 'SaagarSathi ORCA server', ok: true, health: '/api/health', llm: { provider: 'nvidia', on: hasLlmKey() } }));

// JSON 404 for unknown API routes (Express default would send HTML).
app.use('/api', (req, res) => res.status(404).json({ error: `Unknown endpoint: ${req.method} ${req.path}` }));

const server = app.listen(PORT, () => console.log(`SaagarSathi server listening on port ${PORT} (llm-nvidia:${hasLlmKey() ? 'on' : 'fallback — add NVIDIA_API_KEY to server/.env'})`));
// Friendly error when the port is already taken (e.g. an old server is still
// running): previously this crashed with a raw EADDRINUSE stack trace.
server.on('error', (err) => {
    if (err && err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use — another SaagarSathi server is probably still running. Stop it (or run: Get-Process node | Stop-Process) and start again.`);
        process.exit(1);
    }
    throw err;
});
