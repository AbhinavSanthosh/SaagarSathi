// LLM Explainer (ORCA §6.2 / §10) — NVIDIA NIM backend.
//
// Design contract (research-mandated, do not weaken):
//  1. The safety verdict is COMPUTED by the deterministic Safety Rule Engine.
//     The LLM only NARRATES it — it may never override, soften, or omit it.
//  2. Verdict FIRST (yes/no), then evidence. Risk is presented even when the
//     user only asked about fishing zones.
//  3. Every number quoted must match the computed facts exactly.
//
// NVIDIA NIM is OpenAI-compatible:
//   POST {BASE}/chat/completions  header Authorization: Bearer <NVIDIA_API_KEY>
const axios = require('axios');

const BASE_URL = process.env.NVIDIA_BASE_URL || 'https://integrate.api.nvidia.com/v1';
const MODEL = process.env.NVIDIA_MODEL || 'meta/llama-3.2-11b-vision-instruct';

function isConfigured() {
    return !!process.env.NVIDIA_API_KEY;
}

// Rule-based intent so the explainer emphasizes what was asked
// WITHOUT dropping the safety verdict.
function detectIntent(question) {
    const q = String(question || '').toLowerCase();
    if (/(sos|mayday|distress|drowning|drown|sinking|capsiz|rescue|emergency|help me|accident)/.test(q)) return 'emergency';
    if (/(pfz|potential fishing|where.*fish|fish.*(where|zone|spot|area|catch)|nearest.*zone|high.*zone|catch zone|fishing zone)/.test(q)) return 'pfz';
    if (/(imbl|border|boundary|mpa|protected|restrict|ban period|banned|ecozone|cross.*(line|border))/.test(q)) return 'geofence';
    if (/(weather|wind|wave|swell|rain|cyclone|storm|tide|surge|lightning|temperature|forecast)/.test(q)) return 'weather';
    if (/(safe|safety|go out|go.*sea|venture|should i|fish.*today|tomorrow|ok to|alright)/.test(q)) return 'safety';
    return 'general';
}

function verdictWord(alertLevel) {
    // First-line answer vocabulary per verdict
    if (alertLevel === 'SAFE') return 'YES';
    if (alertLevel === 'CAUTION') return 'YES, WITH CAUTION';
    if (alertLevel === 'HIGH RISK') return 'NO';
    if (alertLevel === 'DANGER') return 'NO';
    return 'UNKNOWN — NO';
}

function buildExplainerPrompt({ question, targetLang, langName, intent, o }) {
    const r = o.risk;
    const f = o.fishingOpportunity;
    const w = o.weather;
    const oc = o.ocean;
    const g = o.geofence;
    const reasons = r.reasons.length ? r.reasons.join('; ') : 'No hazards detected';
    const zone = f
        ? `${f.recommendedZone.title} at ${f.recommendedZone.lat.toFixed(3)}, ${f.recommendedZone.lon.toFixed(3)} (score ${f.score}/100, ${f.confidence} confidence, SST ${oc.seaSurfaceTemperature}C, Chl-a ${oc.chlorophyll} mg/m3)`
        : 'No active fishing zone today';

    const facts = [
        `SAFETY VERDICT (computed, immutable): ${r.alertLevel} — ${r.status}`,
        `Risk score: ${r.riskScore}/100`,
        `Risk factors: ${reasons}`,
        `Advice: ${r.advice}`,
        `Wind: ${w.windSpeed} km/h from ${w.windDirection} deg; Wave height: ${w.waveHeight} m; Swell: ${w.swellWaveHeight ?? 'n/a'} m; Rain: ${w.precipitation} mm; SST: ${oc.seaSurfaceTemperature}C; Chlorophyll-a: ${oc.chlorophyll} mg/m3`,
        `IMBL: ${g.distToIMBL} km away (${g.nearestBoundary})${g.isInsideMPA ? `; INSIDE MPA: ${g.insideMPAName} (fishing restricted)` : ''}`,
        `FISHING OPPORTUNITY (independent of safety): ${zone}`,
    ].join('\n');

    // Intent shapes: what to emphasize. The safety verdict is ALWAYS present —
    // only the storytelling order and flavor change with the question.
    let shape = '';
    if (intent === 'pfz') {
        shape = (r.alertLevel === 'DANGER' || r.alertLevel === 'HIGH RISK')
            ? `The user asks for fishing zones, but safety is DANGER/HIGH RISK. Open with empathy (a lost day hurts) then a firm NO — do not go out today (verdict ${r.alertLevel}). Explain the risk factors vividly. Name the zone ONLY to mark it OFF LIMITS today. Suggest a useful no-go-day task (mend nets, service the engine). Never recommend sailing to it.`
            : `Open with excitement: YES — the fish are likely gathering; give zone + coordinates + score first. Then 2-3 bullets on WHY (warm SST edge + green chlorophyll-rich water, in plain words). Then the safety verdict (${r.alertLevel}) in one warm line with its advice. End with one practical tip (leave early, carry extra ice).`;
    } else if (intent === 'emergency') {
        shape = `Emergencies need clarity over charm. Line 1 MUST be the immediate life-safety action: call VHF Channel 16 and Indian Coast Guard helpline 1554, share live location. Then 3 short numbered steps (stay with the boat, life jackets on, nearest harbour if reachable). Then one line stating the current safety verdict (${r.alertLevel}). Keep it calm and short.`;
    } else {
        // safety / weather / geofence / general: verdict-first safety answer
        shape = `Line 1 MUST be a direct ${verdictWord(r.alertLevel)} answer to their question (YES = the sea welcomes you, NO = the sea says stay home today). Say it with feeling, like good or bad news from a friend. Then the "why" in 2-4 short bullets that translate numbers into sea-feel (use the wave/wind guide in your instructions). If they asked about weather, describe what the sea will FEEL like out there. If they asked about IMBL/borders, make the boundary distance the hero bullet with the boundary name. Always close with the advice line.`;
    }

    return {
        system: `You are SaagarSathi, the fisherman's trusted harbor friend — warm, respectful, plain-spoken, like advice from an experienced elder at the landing centre. Never a dry government bulletin. You EXPLAIN a pre-computed safety verdict — you never decide, override, soften, or omit it.

VOICE (this is the whole job): conversational and human. Vary every answer — never start two answers the same way. Rotate openings: a greeting, a sea observation, the direct answer with feeling. One short practical seamanship tip per answer, tied to the verdict (fuel saving on long runs, extra ice when zones are far, net-mending on no-go days, life jackets and float plans always). End with a warm content-free invitation to ask more (e.g. "ask me about tomorrow anytime" — NEVER describe tomorrow's or later weather, you have no forecast data) AND the reminder to confirm with official INCOIS/IMD bulletins before sailing.

LANGUAGE (mandatory): answer COMPLETELY in ${langName} (code '${targetLang}'), in its authentic script. Simple short sentences a fisherman understands — and easily spoken aloud. No tables, no jargon, at most 2 emoji total, never mid-sentence.

SEA-FEEL GUIDE (translate numbers into felt conditions, staying truthful):
- Waves <1 m: gentle, knee-high ripples, easy boat handling.
- Waves 1-2 m: waist-high, rocking boat, tiring for small craft.
- Waves 2-3.5 m: chest-high and rough, small boats stay home.
- Waves >3.5 m: dangerous walls of water, no one goes out.
- Wind <15 km/h: light breeze, flags flutter. 15-25: steady push, whitecaps start.
- Wind 25-40: strong, hard to hold course in small boats. Above 40: dangerous, harbour only.

HARD RULES:
- Verdict and advice ALWAYS appear, even if the user only asked about fish.
- Quote every number EXACTLY as given in FACTS. Never invent numbers, times, or zones.
- Wind direction: quote the degrees number exactly (e.g. 240 deg). Never convert it to compass names like southwest.
- Describe ONLY current values from FACTS. Never claim what already happened ("has stopped", "has cleared") or what will happen later.
- Apply the SEA-FEEL GUIDE literally per number: 12 km/h wind is always "light", 0.5 m swell is always "calm" — even when the overall verdict is DANGER. Never dress calm numbers in alarming adjectives, and never soften dangerous numbers with calm words.
- Every answer MUST have all four parts in order: 1) verdict line 2) why-bullets 3) one practical tip line starting with "Tip:" 4) one warm line inviting the next question plus the INCOIS/IMD reminder.
- Under 130 words.`,
        user: `FACTS (do not change):\n${facts}\n\nANSWER SHAPE:\n${shape}\n\nUser question: ${question}`,
    };
}

async function explainWithNvidia({ question, targetLang, langName, intent, o, timeoutMs = 45000 }) {
    const key = process.env.NVIDIA_API_KEY;
    if (!key) throw new Error('NVIDIA_API_KEY missing');
    const { system, user } = buildExplainerPrompt({ question, targetLang, langName, intent, o });
    const r = await axios.post(
        `${BASE_URL}/chat/completions`,
        {
            model: MODEL,
            messages: [
                { role: 'system', content: system },
                { role: 'user', content: user },
            ],
            temperature: 0.3,
            top_p: 0.9,
            max_tokens: 600,
            stream: false,
        },
        {
            headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json', Accept: 'application/json' },
            timeout: timeoutMs,
        }
    );
    const text = r.data?.choices?.[0]?.message?.content;
    if (!text || !String(text).trim()) throw new Error('Empty NVIDIA response');
    return { text: String(text).trim(), model: MODEL, intent };
}

module.exports = {
    isConfigured,
    detectIntent,
    verdictWord,
    buildExplainerPrompt,
    explainWithNvidia,
    MODEL,
    BASE_URL,
};
