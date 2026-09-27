// Speech-to-Text (STT) and Text-to-Speech (TTS) helper for Indian regional languages

export const LOCALE_MAP: Record<string, string> = {
  en: 'en-IN',
  hi: 'hi-IN',
  ta: 'ta-IN',
  ml: 'ml-IN',
  te: 'te-IN',
  gu: 'gu-IN',
  mr: 'mr-IN',
  bn: 'bn-IN',
  kn: 'kn-IN',
};

export const LANG_NAME_MAP: Record<string, string[]> = {
  hi: ['hindi', 'हिन्दी', 'devanagari'],
  ta: ['tamil', 'தமிழ்'],
  ml: ['malayalam', 'മലയാളം'],
  te: ['telugu', 'తెలుగు'],
  gu: ['gujarati', 'ગુજરાતી'],
  mr: ['marathi', 'मराठी'],
  bn: ['bengali', 'বাংলা', 'bangla'],
  kn: ['kannada', 'ಕನ್ನಡ'],
  en: ['english', 'en-in', 'en-us', 'en-gb'],
};

// Clean markdown and non-speech symbols from text before TTS
export function cleanTextForSpeech(text: string): string {
  if (!text) return '';
  return text
    .replace(/https?:\/\/[^\s]+/g, '') // remove URLs
    .replace(/\[\d+\]/g, '') // remove citation numbers [1]
    .replace(/[*_~`#▸●·]/g, '') // remove markdown symbols
    .replace(/IMBL/gi, 'I M B L')
    .replace(/PFZ/gi, 'P F Z')
    .replace(/SST/gi, 'S S T')
    .replace(/INCOIS/gi, 'Incoys')
    .replace(/IMD/gi, 'I M D')
    .replace(/\s+/g, ' ')
    .trim();
}

// Find the best matching browser voice for given language
export function findMatchingVoice(langCode: string): SpeechSynthesisVoice | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const targetLocale = (LOCALE_MAP[langCode] || `${langCode}-IN`).toLowerCase();
  const langKey = langCode.toLowerCase();
  const searchTerms = LANG_NAME_MAP[langKey] || [langKey];

  // 1. Exact locale match (e.g. 'hi-in' or 'hi_IN')
  const exactMatch = voices.find(
    (v) => v.lang.toLowerCase().replace('_', '-') === targetLocale
  );
  if (exactMatch) return exactMatch;

  // 2. Starts with language code (e.g. 'hi' in 'hi-IN')
  const prefixMatch = voices.find((v) =>
    v.lang.toLowerCase().startsWith(langKey)
  );
  if (prefixMatch) return prefixMatch;

  // 3. Voice name contains language name (e.g. "Google हिन्दी" or "Microsoft Heera - Hindi")
  const nameMatch = voices.find((v) => {
    const vName = v.name.toLowerCase();
    return searchTerms.some((term) => vName.includes(term));
  });
  if (nameMatch) return nameMatch;

  // 4. Default / English voice fallback
  return (
    voices.find((v) => v.lang.toLowerCase().startsWith('en')) ||
    voices.find((v) => v.default) ||
    voices[0] ||
    null
  );
}

// Play TTS text: Bhashini server voice first (real Indic voices), browser voice fallback.
// Same callback contract as before so existing callers keep working.
export function speakText(
  text: string,
  langCode: string = 'en',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): () => void {
  const cleaned = cleanTextForSpeech(text);
  if (!cleaned) return () => {};

  let cancelled = false;
  let audioEl: HTMLAudioElement | null = null;
  let audioUrl: string | null = null;
  let browserCancel: (() => void) | null = null;

  void (async () => {
    try {
      const { bhashiniTtsUrl } = await import('./voiceApi');
      const url = await bhashiniTtsUrl(cleaned, langCode);
      if (cancelled) {
        if (url) URL.revokeObjectURL(url);
        return;
      }
      if (url) {
        audioUrl = url;
        audioEl = new Audio(url);
        audioEl.onplay = () => onStart?.();
        audioEl.onended = () => {
          URL.revokeObjectURL(url);
          onEnd?.();
        };
        audioEl.onerror = () => {
          URL.revokeObjectURL(url);
          if (!cancelled) browserCancel = browserSpeak(cleaned, langCode, onStart, onEnd, onError);
        };
        await audioEl.play();
        return;
      }
    } catch {
      /* fall through to browser voice */
    }
    if (!cancelled) browserCancel = browserSpeak(cleaned, langCode, onStart, onEnd, onError);
  })();

  return () => {
    cancelled = true;
    try {
      audioEl?.pause();
    } catch {
      /* noop */
    }
    audioEl = null;
    if (audioUrl) {
      try {
        URL.revokeObjectURL(audioUrl);
      } catch {
        /* noop */
      }
      audioUrl = null;
    }
    try {
      browserCancel?.();
    } catch {
      /* noop */
    }
    try {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    } catch {
      /* noop */
    }
  };
}

// Browser speech synthesis path (used directly, and as Bhashini fallback)
function browserSpeak(
  cleaned: string,
  langCode: string = 'en',
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: any) => void
): () => void {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    console.warn('SpeechSynthesis is not supported in this browser.');
    onError?.('SpeechSynthesis not supported');
    return () => {};
  }

  try {
    window.speechSynthesis.cancel();
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    }

    const utterance = new SpeechSynthesisUtterance(cleaned);
    const targetLocale = LOCALE_MAP[langCode] || `${langCode}-IN`;
    utterance.lang = targetLocale;
    utterance.rate = 0.95; // slightly slower for clear comprehension
    utterance.pitch = 1.0;

    const matchedVoice = findMatchingVoice(langCode);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => onStart?.();
    utterance.onend = () => onEnd?.();
    utterance.onerror = (e) => {
      console.warn('Speech synthesis utterance error:', e);
      onError?.(e);
    };

    window.speechSynthesis.speak(utterance);

    return () => {
      try {
        window.speechSynthesis.cancel();
      } catch {
        /* noop */
      }
    };
  } catch (err) {
    console.error('Failed to trigger speech synthesis:', err);
    onError?.(err);
    return () => {};
  }
}

// Hindi vs Marathi share Devanagari: disambiguate with Marathi-specific
// characters (ळ ॲ ऑ — virtually absent in Hindi) + function-word scoring.
// Mirror of server/agents/langDetect.js — keep the two in sync.
function countFamilyMarkers(text: string): { mr: number; hi: number } {
  const t = ` ${text} `;
  let mr = 0;
  let hi = 0;
  for (const ch of ['ळ', 'ऍ', 'ऑ', 'ॲ']) {
    mr += (t.split(ch).length - 1) * 3;
  }
  const mrWords = [
    'आहे', 'आहेत', 'नाही', 'नको', 'मला', 'माझा', 'माझी', 'माझे', 'तुला', 'तुम्ही',
    'काय', 'कसा', 'कसे', 'कशी', 'कुठे', 'केव्हा', 'होय', 'होता', 'होती', 'होते',
    'केला', 'केली', 'केले', 'पाहिजे', 'शकता', 'शकतो', 'करा', 'बघा', 'चांगल',
  ];
  const hiWords = [
    'है', 'हैं', 'नहीं', 'मत', 'मुझे', 'मेरा', 'मेरी', 'मेरे', 'तुम', 'आपको',
    'क्या', 'कैसा', 'कैसे', 'कैसी', 'कहाँ', 'कब', 'हाँ', 'था', 'थी', 'थे',
    'किया', 'किए', 'चाहिए', 'करो', 'देखो', 'अच्छा', 'अच्छी',
  ];
  const countWord = (haystack: string, word: string) => {
    const re = new RegExp(`(?<![\u0900-\u097F])${word}(?![\u0900-\u097F])`, 'g');
    return (haystack.match(re) || []).length;
  };
  for (const w of mrWords) mr += countWord(t, w) * 2;
  for (const w of hiWords) hi += countWord(t, w) * 2;
  return { mr, hi };
}

// Marker evidence that Devanagari text is specifically Hindi or Marathi.
// Returns the winner, or null on a tie (no evidence either way) — a tie must
// NOT be accepted as Hindi, or transliterated Malayalam in Devanagari would
// be mislabelled.
export function familyMarkerWinner(text: string): 'hi' | 'mr' | null {
  const { mr, hi } = countFamilyMarkers(text);
  if (mr > hi) return 'mr';
  if (hi > mr) return 'hi';
  return null;
}

function hindiVsMarathi(text: string): 'hi' | 'mr' {
  // Legacy tie-break: ties count as Hindi (matches long-standing behavior).
  return familyMarkerWinner(text) ?? 'hi';
}

// Detect language from script (mirrors backend detectLanguageFromText).
// Used to label browser-STT transcripts: Devanagari text is split into
// Hindi vs Marathi (never blanket-labelled 'hi').
export function detectScriptLang(text: string): string {
  if (!text || typeof text !== 'string') return 'en';
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

