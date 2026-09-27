import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { ExternalLink, Volume2, VolumeX, Sparkles, Waves } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../lib/locations';
import { apiPost, BACKEND_HINT } from '../lib/api';
import MinimalSearchBar from '../components/MinimalSearchBar';
import CustomDropdown from '../components/CustomDropdown';
import { speakText } from '../lib/speech';

interface Msg {
  id: number;
  sender: 'user' | 'bot';
  text: string;
  citations?: Array<{ text: string; url: string }>;
  chips?: string[];
  isError?: boolean;
  safety?: any;
  why?: Array<{ label: string; points: number; detail?: string }>;
  detectedLang?: string;
}

export default function AskSaagarsathi() {
  const { location, lang, setLang, t } = useApp();
  const routerLocation = useLocation();

  const [messages, setMessages] = useState<Msg[]>([
    {
      id: 1,
      sender: 'bot',
      text: `${t.askWelcome} (${location.name})`,
      citations: [],
      chips: t.suggestions.slice(0, 3),
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [playingMsgId, setPlayingMsgId] = useState<number | null>(null);
  const stopSpeakRef = useRef<(() => void) | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const lastInitialQueryRef = useRef<string | null>(null);
  const msgIdRef = useRef(2);
  const nextMsgId = () => {
    msgIdRef.current += 1;
    return msgIdRef.current;
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Update initial greeting when location or language changes if only 1 message
  useEffect(() => {
    setMessages((prev) =>
      prev.length === 1
        ? [
            {
              ...prev[0],
              text: `${t.askWelcome} (${location.name})`,
              chips: t.suggestions.slice(0, 3),
            },
          ]
        : prev
    );
  }, [location.id, location.name, lang, t]);

  // Handle incoming queries from dashboard / research search bars.
  // (Effect is registered after `send` is defined — see below.)
  const handleSpeak = useCallback(
    (text: string, langCode: string, msgId: number) => {
      if (playingMsgId === msgId) {
        stopSpeakRef.current?.();
        setPlayingMsgId(null);
        return;
      }

      stopSpeakRef.current?.();
      setPlayingMsgId(msgId);

      const cancel = speakText(
        text,
        langCode || lang || 'en',
        () => setPlayingMsgId(msgId),
        () => setPlayingMsgId(null),
        () => setPlayingMsgId(null)
      );

      stopSpeakRef.current = cancel;
    },
    [playingMsgId, lang]
  );

  const send = useCallback(async (text: string, voiceLang?: string) => {
    const msg = text.trim();
    if (!msg || loading) return;

    setMessages((p) => [...p, { id: nextMsgId(), sender: 'user', text: msg }]);
    setLoading(true);

    try {
      const d = await apiPost<any>('/api/chat', {
        message: msg,
        lang: voiceLang || lang || 'en',
        context: {
          lat: location.lat,
          lon: location.lon,
          location: location.name,
          voiceLang,
        },
      });

      const newMsgId = nextMsgId();
      setMessages((p) => [
        ...p,
        {
          id: newMsgId,
          sender: 'bot',
          text: d.text,
          citations: d.citations || [],
          chips: d.chips || [],
          safety: d.safety,
          why: d.why,
          detectedLang: d.detectedLang || lang,
        },
      ]);

      // Automatically speak response if query was voice-based
      if (voiceLang) {
        handleSpeak(d.text, d.detectedLang || lang, newMsgId);
      }
    } catch {
      setMessages((p) => [
        ...p,
        {
          id: nextMsgId(),
          sender: 'bot',
          isError: true,
          text: `${BACKEND_HINT}. Emergency safety: Check VHF Ch-16 and head to nearest harbor.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [loading, location.lat, location.lon, location.name, lang, handleSpeak]);

  // Incoming queries from dashboard / research search bars.
  // Accepts a NEW query every time navigation state changes (asking twice works).
  useEffect(() => {
    const state = routerLocation.state as { initialQuery?: string; voiceLocale?: string } | null;
    if (state?.initialQuery && state.initialQuery !== lastInitialQueryRef.current) {
      lastInitialQueryRef.current = state.initialQuery;
      send(state.initialQuery, state.voiceLocale);
    }
  }, [routerLocation.state, send]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      stopSpeakRef.current?.();
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-transparent">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-sky-100 bg-white/80 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-ocean-500 text-white flex items-center justify-center shadow-xs shadow-sky-600/30">
            <Waves size={16} className="animate-wave" />
          </div>
          <div>
            <h2 className="font-semibold text-slate-900 text-sm leading-tight flex items-center gap-1.5">
              {t.askHeaderTitle}
            </h2>
            <span className="text-xs text-slate-500">
              {location.name} · {t.askHeaderSubtitle}
            </span>
          </div>
        </div>
        <CustomDropdown
          items={LANGUAGES.map((l) => ({ value: l.code, label: l.name }))}
          value={lang}
          onChange={setLang}
          size="sm"
          menuClassName="w-36"
        />
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 pb-6">
        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap gap-2 max-w-3xl mx-auto">
          {t.suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs font-medium bg-white/90 backdrop-blur-sm border border-sky-100 text-slate-700 px-3.5 py-1.5 rounded-full hover:border-sky-300 hover:bg-sky-50/80 hover:text-sky-800 shadow-2xs transition-all cursor-pointer"
            >
              {s}
            </button>
          ))}
        </div>

        <div className="max-w-3xl mx-auto space-y-4">
          {messages.map((m) => {
            const isPlaying = playingMsgId === m.id;
            return (
              <div
                key={m.id}
                className={clsx(
                  'flex flex-col max-w-[92%] md:max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-200',
                  m.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
                )}
              >
                <div
                  className={clsx(
                    'px-4 py-3.5 rounded-2xl whitespace-pre-wrap text-[14px] leading-relaxed',
                    m.sender === 'user'
                      ? 'bg-gradient-to-tr from-sky-600 to-sky-500 text-white rounded-tr-xs shadow-sm shadow-sky-600/20'
                      : m.isError
                      ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-xs'
                      : 'bg-white/90 backdrop-blur-md text-slate-900 border border-sky-100/90 rounded-tl-xs shadow-xs shadow-sky-950/4'
                  )}
                >
                  {m.text}
                </div>

                {m.sender === 'bot' && !m.isError && (
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleSpeak(m.text, m.detectedLang || lang, m.id)}
                      className={clsx(
                        'text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-xl border transition-all cursor-pointer',
                        isPlaying
                          ? 'bg-sky-600 text-white border-sky-600 animate-pulse shadow-sm shadow-sky-600/30'
                          : 'bg-white/90 backdrop-blur-xs text-slate-700 border-sky-150 hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 shadow-2xs'
                      )}
                      title={isPlaying ? 'Stop reading' : 'Listen via Text-to-Speech'}
                    >
                      {isPlaying ? <VolumeX size={13} /> : <Volume2 size={13} />}
                      <span>
                        {isPlaying ? 'Playing…' : `${t.listenBtn} (${(m.detectedLang || lang).toUpperCase()})`}
                      </span>
                    </button>

                    {m.safety && (
                      <button
                        onClick={() => setExpanded((e) => ({ ...e, [m.id]: !e[m.id] }))}
                        className="text-xs font-medium text-sky-800 bg-sky-50/80 border border-sky-200/70 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors cursor-pointer"
                      >
                        {expanded[m.id] ? t.hideWhy : `${t.whyRiskScore} ${m.safety.alertLevel} (${m.safety.riskScore}/100)`}
                      </button>
                    )}
                  </div>
                )}

                {m.sender === 'bot' && expanded[m.id] && m.why && (
                  <div className="mt-2 w-full bg-slate-900 text-slate-100 rounded-2xl p-3.5 text-xs leading-relaxed shadow-lg">
                    {m.why.length === 0 && <div>{t.allChecksNominal}</div>}
                    {m.why.map((f, i) => (
                      <div key={i} className="py-1 border-b border-slate-800 last:border-0">
                        <span className="text-sky-400 font-bold">+{f.points}</span> · <b>{f.label}</b>
                        {f.detail ? ` — ${f.detail}` : ''}
                      </div>
                    ))}
                  </div>
                )}

                {m.citations && m.citations.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {m.citations.map((c, i) => (
                      <a
                        key={i}
                        href={c.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center text-[11px] font-medium text-sky-800 bg-sky-50/90 px-2.5 py-1 rounded-lg border border-sky-200/60 hover:bg-sky-100 transition-colors"
                      >
                        {c.text} <ExternalLink size={10} className="ml-1" />
                      </a>
                    ))}
                  </div>
                )}

                {m.chips && m.chips.length > 0 && (
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {m.chips.map((c, i) => (
                      <button
                        key={i}
                        onClick={() => send(c)}
                        className="px-3.5 py-1.5 bg-white/90 backdrop-blur-xs border border-sky-150 text-slate-700 rounded-full text-xs font-medium hover:border-sky-300 hover:text-sky-700 hover:bg-sky-50 shadow-2xs transition-all cursor-pointer"
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="text-xs font-medium text-sky-900 bg-white/90 backdrop-blur-md border border-sky-200/80 w-max px-4 py-2.5 rounded-2xl animate-pulse flex items-center gap-2 shadow-xs">
              <Sparkles size={14} className="text-sky-600 animate-spin" />
              <span>ORCA reasoning in progress…</span>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Bottom Search Bar */}
      <div className="border-t border-sky-100 p-3.5 bg-white/80 backdrop-blur-md shrink-0">
        <div className="max-w-3xl mx-auto">
          <MinimalSearchBar
            placeholder={t.searchPlaceholder}
            onSearch={(q, voiceLang) => send(q, voiceLang)}
            isSubmitting={loading}
            currentLang={lang}
            size="md"
          />
        </div>
        <p className="text-center text-[11px] text-slate-400 mt-2 font-normal">
          {t.advisoryDisclaimer}
        </p>
      </div>
    </div>
  );
}
