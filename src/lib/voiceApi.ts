// Bhashini-backed voice helpers: server TTS audio + 16kHz WAV recording + server ASR.
// All network calls go through the Vite /api proxy with localhost fallback (see lib/api).

import { apiPost } from './api';
import { cleanTextForSpeech } from './speech';

// POST /api/tts -> object URL (audio/wav) or null on any failure
export async function bhashiniTtsUrl(text: string, lang: string): Promise<string | null> {
  const cleaned = cleanTextForSpeech(text).slice(0, 800);
  if (!cleaned) return null;
  try {
    const d = await apiPost<{ audioContent: string }>('/api/tts', { text: cleaned, lang });
    if (!d?.audioContent) return null;
    const bytes = Uint8Array.from(atob(d.audioContent), (c) => c.charCodeAt(0));
    const blob = new Blob([bytes.buffer as ArrayBuffer], { type: 'audio/wav' });
    return URL.createObjectURL(blob);
  } catch {
    return null;
  }
}

// Convert any recorded audio blob -> 16kHz mono 16-bit PCM WAV blob (what Bhashini ASR wants)
export async function blobToWav16k(input: Blob): Promise<Blob> {
  const AC: typeof AudioContext | undefined =
    window.AudioContext || (window as any).webkitAudioContext;
  if (!AC) throw new Error('WebAudio not supported');
  const buf = await input.arrayBuffer();
  const ctx = new AC();
  try {
    const decoded = await ctx.decodeAudioData(buf);
    const targetRate = 16000;
    const frames = Math.max(1, Math.floor(decoded.duration * targetRate));
    const offline = new OfflineAudioContext(1, frames, targetRate);
    const src = offline.createBufferSource();
    // downmix to mono
    const mono = offline.createBuffer(1, decoded.length, decoded.sampleRate);
    const mch = mono.getChannelData(0);
    const nCh = decoded.numberOfChannels;
    for (let c = 0; c < nCh; c++) {
      const ch = decoded.getChannelData(c);
      for (let i = 0; i < ch.length; i++) mch[i] = (mch[i] || 0) + ch[i] / nCh;
    }
    src.buffer = mono;
    src.connect(offline.destination);
    src.start();
    const rendered = await offline.startRendering();
    const data = rendered.getChannelData(0);
    const wav = encodeWav16(data, targetRate);
    return new Blob([wav], { type: 'audio/wav' });
  } finally {
    try { await ctx.close(); } catch { /* noop */ }
  }
}

function encodeWav16(samples: Float32Array, sampleRate: number): ArrayBuffer {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const v = new DataView(buffer);
  const writeStr = (off: number, s: string) => {
    for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i));
  };
  writeStr(0, 'RIFF');
  v.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, 'WAVE');
  writeStr(12, 'fmt ');
  v.setUint32(16, 16, true);
  v.setUint16(20, 1, true);
  v.setUint16(22, 1, true);
  v.setUint32(24, sampleRate, true);
  v.setUint32(28, sampleRate * 2, true);
  v.setUint16(32, 2, true);
  v.setUint16(34, 16, true);
  writeStr(36, 'data');
  v.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    v.setInt16(44 + i * 2, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return buffer;
}

function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = String(r.result || '');
      resolve(s.includes(',') ? s.split(',')[1] : s);
    };
    r.onerror = () => reject(new Error('blob read failed'));
    r.readAsDataURL(blob);
  });
}

// POST /api/detect-text -> {lang, score} or null.
// Handles romanized Indic text ("aaj machli") that script checks can't label.
export async function detectTextLang(text: string): Promise<{ lang: string; score: number | null } | null> {
  if (!text || !text.trim()) return null;
  try {
    const d = await apiPost<{ lang: string; score: number | null }>('/api/detect-text', {
      text: text.slice(0, 1000),
    });
    const lang = d?.lang?.toLowerCase().split('-')[0];
    if (!lang) return null;
    return { lang, score: d.score ?? null };
  } catch {
    return null;
  }
}

// POST /api/asr with a WAV blob -> {text, lang} or null.
// lang='auto' (default) detects the SPOKEN language: speak Hindi with English UI
// and you get back Hindi text + lang 'hi'.
export async function bhashiniTranscribe(
  wavBlob: Blob,
  lang = 'auto'
): Promise<{ text: string; lang: string } | null> {
  try {
    const b64 = await blobToBase64(wavBlob);
    const d = await apiPost<{ transcript: string; detectedLang?: string }>('/api/asr', {
      audioContent: b64,
      lang,
      audioFormat: 'wav',
      samplingRate: 16000,
    });
    const text = d?.transcript?.trim();
    if (!text) return null;
    return { text, lang: d.detectedLang || lang };
  } catch {
    return null;
  }
}

export interface WavRecorder {
  stop: () => Promise<Blob | null>;
  cancel: () => void;
}

// Record mic -> 16kHz WAV blob. Resolves null if cancelled/failed.
// onAutoStop fires with the WAV when maxSeconds elapse (so callers can transcribe).
export async function startWavRecorder(maxSeconds = 15, onAutoStop?: (wav: Blob | null) => void): Promise<WavRecorder> {
  if (!navigator.mediaDevices?.getUserMedia) throw new Error('Microphone not available in this browser.');
  if (typeof MediaRecorder === 'undefined') throw new Error('Audio recording not supported in this browser.');
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  const rec = new MediaRecorder(stream);
  const chunks: Blob[] = [];
  let stopped = false;
  let result: Blob | null = null;
  let resolveDone: (b: Blob | null) => void = () => {};
  const done = new Promise<Blob | null>((resolve) => {
    resolveDone = resolve;
  });
  rec.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) chunks.push(e.data);
  };
  const finish = async (cancelled: boolean) => {
    if (stopped) return result;
    stopped = true;
    try { rec.stream.getTracks().forEach((t) => t.stop()); } catch { /* noop */ }
    if (cancelled || chunks.length === 0) {
      result = null;
    } else {
      try {
        result = await blobToWav16k(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
      } catch {
        result = null;
      }
    }
    resolveDone(result);
    return result;
  };
  rec.onstop = () => {
    void finish(false);
  };
  const timer = setTimeout(() => {
    void finish(false).then((wav) => {
      try {
        onAutoStop?.(wav);
      } catch {
        /* noop */
      }
    });
  }, maxSeconds * 1000);
  try {
    rec.start(250);
  } catch {
    clearTimeout(timer);
    stream.getTracks().forEach((t) => t.stop());
    throw new Error('Recorder start failed');
  }
  return {
    stop: async () => {
      if (stopped) return result;
      clearTimeout(timer);
      try {
        rec.stop();
      } catch {
        return finish(true);
      }
      return done;
    },
    cancel: () => {
      clearTimeout(timer);
      void finish(true);
    },
  };
}
