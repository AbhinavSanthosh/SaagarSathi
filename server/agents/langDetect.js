// Shared spoken-language detection for Devanagari-ambiguous text.
// Hindi and Marathi share the Devanagari script: script detection alone can
// only say "Devanagari". This module disambiguates with Marathi-specific
// characters (ळ ॲ ऑ — virtually absent in Hindi) plus high-frequency
// function-word scoring. Frontend keeps a mirror copy in src/lib/speech.ts;
// keep the two in sync.
const MR_CHARS = ['ळ', 'ऍ', 'ऑ', 'ॲ'];
const MR_WORDS = [
    'आहे', 'आहेत', 'नाही', 'नको', 'मला', 'माझा', 'माझी', 'माझे', 'तुला', 'तुम्ही',
    'काय', 'कसा', 'कसे', 'कशी', 'कुठे', 'केव्हा', 'होय', 'होता', 'होती', 'होते',
    'केला', 'केली', 'केले', 'पाहिजे', 'शकता', 'शकतो', 'करा', 'बघा', 'चांगल',
];
const HI_WORDS = [
    'है', 'हैं', 'नहीं', 'मत', 'मुझे', 'मेरा', 'मेरी', 'मेरे', 'तुम', 'आपको',
    'क्या', 'कैसा', 'कैसे', 'कैसी', 'कहाँ', 'कब', 'हाँ', 'था', 'थी', 'थे',
    'किया', 'किए', 'चाहिए', 'करो', 'देखो', 'अच्छा', 'अच्छी',
];

function countWord(haystack, word) {
    // Devanagari-aware boundaries (\b does not work for Indic scripts)
    const re = new RegExp(`(?<![\u0900-\u097F])${word}(?![\u0900-\u097F])`, 'g');
    return (haystack.match(re) || []).length;
}

// Input MUST be Devanagari text. Returns 'hi' | 'mr' (ties -> 'hi', legacy).
function hindiVsMarathi(text) {
    return familyMarkerWinner(text) ?? 'hi';
}

// Marker evidence for hi vs mr. Null on tie: a tie must NOT count as Hindi,
// or transliterated Malayalam in Devanagari would be mislabelled.
function familyMarkerWinner(text) {
    const t = ` ${String(text || '')} `;
    let mr = 0;
    let hi = 0;
    for (const ch of MR_CHARS) {
        mr += (t.split(ch).length - 1) * 3;
    }
    for (const w of MR_WORDS) mr += countWord(t, w) * 2;
    for (const w of HI_WORDS) hi += countWord(t, w) * 2;
    if (mr > hi) return 'mr';
    if (hi > mr) return 'hi';
    return null;
}

const DEVANAGARI_FAMILY = new Set(['hi', 'mr']);

// Full text -> spoken language. Mirrors old detectLanguageFromText plus
// Hindi/Marathi disambiguation. Returns app language codes.
function detectSpokenLang(text) {
    if (!text || typeof text !== 'string' || !text.trim()) return 'en';
    const str = text.trim();
    if (/[\u0900-\u097F]/.test(str)) return hindiVsMarathi(str);
    if (/[\u0B80-\u0BFF]/.test(str)) return 'ta';
    if (/[\u0D00-\u0D7F]/.test(str)) return 'ml';
    if (/[\u0C00-\u0C7F]/.test(str)) return 'te';
    if (/[\u0980-\u09FF]/.test(str)) return 'bn';
    if (/[\u0A80-\u0AFF]/.test(str)) return 'gu';
    if (/[\u0C80-\u0CFF]/.test(str)) return 'kn';
    return 'en';
}

module.exports = { hindiVsMarathi, familyMarkerWinner, detectSpokenLang, DEVANAGARI_FAMILY };
