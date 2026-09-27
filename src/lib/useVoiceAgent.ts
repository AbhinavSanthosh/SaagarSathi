// Real voice-agent hook: live transcript WHILE speaking, mic toggles stop,
// Enter sends. Two capture paths run in parallel:
//
//  1. Browser SpeechRecognition (Chrome) -> instant interim/final text.
//  2. WAV backup recorder (all browsers) -> Bhashini ASR with auto language
//     detection, used whenever the browser path yields nothing (network errors,
//     'no-speech' silence, Firefox/Safari, wrong-language speech).
//
// Nothing fails silently: stop with no usable audio reports 'unclear',
// mic denial reports 'denied'.
import { useCallback, useEffect, useRef, useState } from 'react';
import { LOCALE_MAP, detectScriptLang, familyMarkerWinner } from './speech';
import { startWavRecorder, bhashiniTranscribe, detectTextLang, type WavRecorder } from './voiceApi';

export type VoiceStatus = 'idle' | 'listening' | 'processing';
export type VoiceErrorCode = 'denied' | 'unclear' | 'failed';

export interface VoiceResult {
  text: string;
  spokenLang: string;
}

interface VoiceAgentCallbacks {
  onInterimText?: (text: string) => void;
  onFinalText?: (text: string, spokenLang: string) => void;
  onError?: (code: VoiceErrorCode) => void;
  onStatusChange?: (s: VoiceStatus) => void;
}

const MAX_SECONDS = 60;
const MAX_RESTARTS = 6;

export function useVoiceAgent(uiLang: string, cb: VoiceAgentCallbacks) {
  const [status, setStatus] = useState<VoiceStatus>('idle');

  const statusRef = useRef<VoiceStatus>('idle');
  const uiLangRef = useRef(uiLang);
  const cbRef = useRef(cb);
  const recRef = useRef<any>(null);
  const wavRef = useRef<WavRecorder | null>(null);
  const finalsRef = useRef<string[]>([]);
  const browserDeadRef = useRef(false);
  const wavFailedRef = useRef(false);
  const restartsRef = useRef(0);
  const finalizePromiseRef = useRef<Promise<VoiceResult | null> | null>(null);

  uiLangRef.current = uiLang;
  cbRef.current = cb;

  const setBoth = useCallback((s: VoiceStatus) => {
    statusRef.current = s;
    setStatus(s);
    cbRef.current.onStatusChange?.(s);
  }, []);

  const startBrowser = useCallback((): boolean => {
    const SR =
      typeof window !== 'undefined'
        ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        : null;
    if (!SR) return false;
    try {
      const rec = new SR();
      rec.continuous = true; // keep session open across pauses until user taps mic
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.lang = LOCALE_MAP[uiLangRef.current] || `${uiLangRef.current}-IN`;

      rec.onresult = (event: any) => {
        let interim = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const item = event.results[i];
          const transcript = item?.[0]?.transcript || '';
          if (item.isFinal) {
            if (transcript.trim()) finalsRef.current.push(transcript.trim());
          } else {
            interim += transcript;
          }
        }
        const full = [...finalsRef.current, interim.trim()].filter(Boolean).join(' ');
        if (full) cbRef.current.onInterimText?.(full);
      };

      rec.onerror = (event: any) => {
        const errType = event?.error;
        browserDeadRef.current = true;
        if (errType === 'not-allowed' || errType === 'service-not-allowed') {
          // Mic denied at browser level. If the WAV backup already failed too,
          // nothing can capture audio: report denial now instead of dying silent.
          // Otherwise keep recording — the transcript still arrives on stop.
          if (wavFailedRef.current) {
            try {
              recRef.current?.stop();
            } catch {
              /* noop */
            }
            recRef.current = null;
            try {
              wavRef.current?.cancel();
            } catch {
              /* noop */
            }
            wavRef.current = null;
            setBoth('idle');
            cbRef.current.onError?.('denied');
          }
        }
        // Other errors ('network', 'no-speech', ...): WAV backup continues;
        // final text (or a real error) is produced on stop. Never finalize
        // silently here — that would swallow a working recording.
      };

      rec.onend = () => {
        // Chrome auto-ends sessions on silence/timeout: revive while listening.
        if (
          statusRef.current === 'listening' &&
          !browserDeadRef.current &&
          restartsRef.current < MAX_RESTARTS
        ) {
          restartsRef.current += 1;
          try {
            rec.start();
            return;
          } catch {
            browserDeadRef.current = true;
          }
        }
      };

      rec.start();
      recRef.current = rec;
      return true;
    } catch {
      return false;
    }
  }, [setBoth]);

  const finalize = useCallback(
    async (origin: 'manual' | 'auto' | 'enter', silent: boolean): Promise<VoiceResult | null> => {
      if (statusRef.current !== 'listening') return null;
      if (finalizePromiseRef.current) return finalizePromiseRef.current;
      const p = (async (): Promise<VoiceResult | null> => {
        setBoth('processing');
        try {
          recRef.current?.stop();
        } catch {
          /* noop */
        }
        recRef.current = null;

        let wav: Blob | null = null;
        try {
          wav = (await wavRef.current?.stop()) ?? null;
        } catch {
          wav = null;
        }
        wavRef.current = null;

        const browserText = finalsRef.current.join(' ').trim();

        // Authority rule: NEVER trust the UI language for what was spoken.
        // The spoken language is decided from the AUDIO/TRANSCRIPT, in order:
        //  1. Non-Latin script in the browser transcript -> that script's
        //     language, with Devanagari split into Hindi vs Marathi
        //     (Marathi speech is never blanket-labelled 'hi'). Instant.
        //  2. Latin-only / missing transcript + recording -> candidate RACE:
        //     Bhashini ASR runs in parallel for the likely languages and each
        //     transcript is validated by its own script (wrong-model garbage
        //     is rejected, never mislabelled as Hindi). First valid wins.
        //  3. No recording at all -> browser text labelled by script.
        const DEV_FAMILY = new Set(['hi', 'mr']);
        const ALL_INDIC = ['hi', 'ta', 'ml', 'te', 'gu', 'mr', 'bn', 'kn'];
        const isIndic = (l: string) => ALL_INDIC.includes(l);
        const norm = (l: string) => l.toLowerCase().split('-')[0];

        // Validate one ASR transcript against its requested language, SCORED:
        //   3 = strong (distinctive script match, or Devanagari WITH hi/mr
        //       marker evidence for the requested side)
        //   1 = weak (Devanagari tie with no markers, or English output)
        //   null = rejected (wrong script: confident garbage from a
        //       wrong-language model, e.g. Malayalam audio answered as 'hi').
        const validateAsr = async (
          wav: Blob,
          requested: string
        ): Promise<{ result: VoiceResult; score: number } | null> => {
          let r;
          try {
            r = await bhashiniTranscribe(wav, requested);
          } catch {
            return null;
          }
          const text = r?.text?.trim();
          if (!text) return null;
          const script = detectScriptLang(text);
          if (script === 'en') {
            return requested === 'en' ? { result: { text, spokenLang: 'en' }, score: 1 } : null;
          }
          if (script === requested) {
            if (DEV_FAMILY.has(requested)) {
              const winner = familyMarkerWinner(text);
              return { result: { text, spokenLang: requested }, score: winner ? 3 : 1 };
            }
            return { result: { text, spokenLang: script }, score: 3 };
          }
          // Devanagari hi<->mr relabel (sibling model heard it right).
          if (DEV_FAMILY.has(script) && DEV_FAMILY.has(requested)) {
            const winner = familyMarkerWinner(text);
            return { result: { text, spokenLang: script }, score: winner ? 3 : 1 };
          }
          return null;
        };

        // Parallel race over candidates (quota-capped). Returns best scored.
        const race = async (wav: Blob, cands: string[]) => {
          const seen = new Set<string>();
          const ordered = cands
            .map((c) => c.toLowerCase().split('-')[0])
            .filter((c) => (seen.has(c) ? false : (seen.add(c), true)))
            .slice(0, 9);
          const scored = await Promise.all(ordered.map((c) => validateAsr(wav, c)));
          let best: { result: VoiceResult; score: number } | null = null;
          for (const s of scored) {
            if (s && (!best || s.score > best.score)) best = s;
          }
          return best;
        };

        const ui = uiLangRef.current.toLowerCase().split('-')[0];
        let result: VoiceResult | null = null;
        if (browserText && detectScriptLang(browserText) !== 'en') {
          // Fast path: native-script transcript labels itself.
          result = { text: browserText, spokenLang: detectScriptLang(browserText) };
        } else if (wav) {
          if (browserText) {
            const lid = await detectTextLang(browserText);
            if (lid && lid.lang === 'en' && (lid.score == null || lid.score >= 0.5)) {
              result = { text: browserText, spokenLang: 'en' };
            } else {
              // Indic speech in Latin script (or LID uncertain): race the
              // likely models. Devanagari-family suspects always include BOTH
              // hi and mr so Marathi is never swallowed by Hindi.
              const familySuspect =
                (lid && ['hi', 'mr', 'gu'].includes(lid.lang)) || ui === 'hi' || ui === 'mr';
              const cands = [
                ...(lid && lid.lang !== 'en' && isIndic(lid.lang) ? [lid.lang] : []),
                ...(isIndic(ui) && ui !== 'en' ? [ui] : []),
                'hi',
                ...(familySuspect ? ['mr'] : []),
                'en',
              ];
              let best = await race(wav, cands);
              if (!best || best.score < 3) {
                // Ambiguous field (everyone weak): expand over the remaining
                // Indic models once so Malayalam/Marathi/etc. are never
                // swallowed by a weak Hindi accept.
                const rest = ALL_INDIC.filter((l) => !cands.map(norm).includes(l));
                const expanded = await race(wav, rest);
                if (expanded && (!best || expanded.score > best.score)) best = expanded;
              }
              if (best) {
                result = best.result;
              } else {
                result = {
                  text: browserText,
                  spokenLang: lid && lid.lang !== 'en' ? lid.lang : 'en',
                };
              }
            }
          } else {
            // No browser text (Firefox/Safari/failed STT): race UI + defaults,
            // expanding when weak.
            const familySuspect = ui === 'hi' || ui === 'mr';
            let best = await race(wav, [
              ...(isIndic(ui) && ui !== 'en' ? [ui] : []),
              'hi',
              ...(familySuspect ? ['mr'] : []),
              'en',
            ]);
            if (!best || best.score < 3) {
              const expanded = await race(wav, ALL_INDIC);
              if (expanded && (!best || expanded.score > best.score)) best = expanded;
            }
            if (best) result = best.result;
          }
        } else if (browserText) {
          result = { text: browserText, spokenLang: detectScriptLang(browserText) };
        }

        setBoth('idle');
        if (!result) {
          if (!silent) {
            cbRef.current.onError?.(browserDeadRef.current && !wav ? 'denied' : 'unclear');
          }
          return null;
        }
        if (!silent) cbRef.current.onFinalText?.(result.text, result.spokenLang);
        void origin;
        return result;
      })();
      finalizePromiseRef.current = p;
      try {
        return await p;
      } finally {
        finalizePromiseRef.current = null;
      }
    },
    [setBoth]
  );

  // Manual mic-tap stop (fires onFinalText unless configured otherwise by caller).
  const stop = useCallback(() => finalize('manual', false), [finalize]);

  // Enter-key stop: finalizes WITHOUT firing onFinalText; caller submits the
  // returned text itself (so Enter = stop + send in one gesture).
  const stopAndGet = useCallback(() => finalize('enter', true), [finalize]);

  const start = useCallback(() => {
    if (statusRef.current !== 'idle') return;
    finalsRef.current = [];
    browserDeadRef.current = false;
    wavFailedRef.current = false;
    restartsRef.current = 0;
    setBoth('listening');

    const browserOk = startBrowser();

    // Parallel WAV backup in every browser (also the only path where SR is missing).
    startWavRecorder(MAX_SECONDS, (wav) => {
      // max-time auto-stop -> finalize like a manual stop
      if (wavRef.current) wavRef.current = { stop: async () => wav, cancel: () => {} };
      void finalize('auto', false);
    })
      .then((rec) => {
        if (statusRef.current !== 'listening') {
          rec.cancel();
          return;
        }
        wavRef.current = rec;
      })
      .catch(() => {
        wavRef.current = null;
        wavFailedRef.current = true;
        if (!browserOk || browserDeadRef.current) {
          // Neither engine can capture audio (mic denied / no mic):
          // stop everything and say so instead of hanging on "listening".
          try {
            recRef.current?.stop();
          } catch {
            /* noop */
          }
          recRef.current = null;
          setBoth('idle');
          cbRef.current.onError?.('denied');
        }
        // Browser-only mode continues otherwise; denial surfaces via rec.onerror.
      });
  }, [finalize, setBoth, startBrowser]);

  const toggle = useCallback(() => {
    if (statusRef.current === 'listening') void stop();
    else if (statusRef.current === 'idle') start();
  }, [start, stop]);

  const cancel = useCallback(() => {
    try {
      recRef.current?.stop();
    } catch {
      /* noop */
    }
    recRef.current = null;
    try {
      wavRef.current?.cancel();
    } catch {
      /* noop */
    }
    wavRef.current = null;
    setBoth('idle');
  }, [setBoth]);

  useEffect(() => cancel, [cancel]);

  return { status, start, stop, stopAndGet, toggle, cancel };
}
