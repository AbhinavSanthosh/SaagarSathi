import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Search, Mic, Send } from 'lucide-react';
import clsx from 'clsx';
import { useApp } from '../context/AppContext';
import { useVoiceAgent } from '../lib/useVoiceAgent';

interface MinimalSearchBarProps {
  placeholder?: string;
  onSearch: (query: string, voiceLang?: string) => void;
  className?: string;
  autoFocus?: boolean;
  initialValue?: string;
  isSubmitting?: boolean;
  currentLang?: string;
  size?: 'md' | 'lg';
  /**
   * When true, stopping the mic submits the transcript immediately
   * (dashboard -> jumps to chatbot with the answer).
   * When false, stopping only fills the input; Enter/Send submits (chatbot).
   */
  submitVoiceOnStop?: boolean;
}

export default function MinimalSearchBar({
  placeholder,
  onSearch,
  className = '',
  autoFocus = false,
  initialValue = '',
  isSubmitting = false,
  currentLang = 'en',
  size = 'lg',
  submitVoiceOnStop = false,
}: MinimalSearchBarProps) {
  const { t, lang } = useApp();
  const activeLang = currentLang || lang || 'en';
  const effectivePlaceholder = placeholder || t.searchPlaceholder;

  const [query, setQuery] = useState(initialValue);
  const [voiceError, setVoiceError] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const queryRef = useRef(query);
  queryRef.current = query;
  const submittingRef = useRef(isSubmitting);
  submittingRef.current = isSubmitting;

  const showVoiceError = (msg: string) => {
    setVoiceError(msg);
    setTimeout(() => setVoiceError(''), 4000);
  };

  const doSearch = (val: string, voiceLang?: string) => {
    const text = val.trim();
    if (!text || submittingRef.current) return;
    // voiceLang passes through untouched: undefined = typed (no auto-TTS),
    // a code = voice-originated (answer + spoken reply in that language).
    onSearchRef.current(text, voiceLang);
    setQuery('');
  };
  const onSearchRef = useRef(onSearch);
  onSearchRef.current = onSearch;

  // Real voice-agent behavior:
  // - live transcript streams into the input AS you speak (browser STT)
  // - mic tap stops; dashboard submits at once, chat fills input for Enter
  const voice = useVoiceAgent(activeLang, {
    onInterimText: (text) => setQuery(text),
    onFinalText: (text, spokenLang) => {
      if (submitVoiceOnStopRef.current) doSearch(text, spokenLang);
      else setQuery(text);
    },
    onError: (code) => showVoiceError(code === 'denied' ? t.voiceNotSupported : t.speakClear),
  });
  const submitVoiceOnStopRef = useRef(submitVoiceOnStop);
  submitVoiceOnStopRef.current = submitVoiceOnStop;

  const listening = voice.status === 'listening';
  const processing = voice.status === 'processing';

  useEffect(() => {
    if (initialValue) setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (textToSubmit?: string, voiceLang?: string) => {
    // Enter/Send WHILE listening = stop the mic AND send in one gesture.
    if (voice.status === 'listening') {
      void voice.stopAndGet().then((r) => {
        const val = (r?.text ?? textToSubmit ?? queryRef.current).trim();
        if (!val) return;
        doSearch(val, r?.spokenLang ?? voiceLang);
      });
      return;
    }
    // While converting, Enter/Send is ignored: the final text lands
    // via onFinalText a moment later (prevents double submits).
    if (voice.status !== 'idle') return;
    doSearch(textToSubmit ?? queryRef.current, voiceLang);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const toggleVoiceInput = () => {
    setVoiceError('');
    voice.toggle();
  };

  const hasText = query.trim().length > 0;

  return (
    <div className={clsx('relative w-full', className)}>
      <div
        className={clsx(
          'flex items-center w-full transition-all duration-200',
          'bg-white/95 backdrop-blur-md border border-sky-150 shadow-sm shadow-sky-950/5',
          'focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-500/15',
          'rounded-full',
          size === 'lg' ? 'h-12 md:h-13 px-4 gap-3' : 'h-10 md:h-11 px-3.5 gap-2.5'
        )}
      >
        {/* Search icon */}
        <Search
          className={clsx(
            'shrink-0 text-sky-500 stroke-[2]',
            size === 'lg' ? 'w-[18px] h-[18px]' : 'w-4 h-4'
          )}
        />

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus={autoFocus}
          placeholder={listening ? t.voiceListening : effectivePlaceholder}
          className={clsx(
            'flex-1 bg-transparent text-slate-900 placeholder:text-slate-400 focus:outline-none min-w-0 font-normal',
            size === 'lg' ? 'text-[15px]' : 'text-sm'
          )}
        />

        {/* Right actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Mic button: tap to start, tap again to stop */}
          <button
            type="button"
            onClick={toggleVoiceInput}
            disabled={processing || isSubmitting}
            title={t.voiceTooltip}
            className={clsx(
              'relative flex items-center justify-center rounded-full transition-all cursor-pointer disabled:opacity-50',
              listening
                ? 'bg-rose-500 text-white animate-pulse shadow-md shadow-rose-500/30 ring-4 ring-rose-500/20'
                : processing
                ? 'bg-amber-400 text-white animate-pulse'
                : 'text-slate-400 hover:text-sky-600 hover:bg-sky-50',
              size === 'lg' ? 'w-8 h-8' : 'w-7 h-7'
            )}
          >
            <Mic className={size === 'lg' ? 'w-4 h-4' : 'w-3.5 h-3.5'} />
            {listening && (
              <span className="absolute -inset-1 rounded-full border-2 border-rose-500 animate-ping pointer-events-none" />
            )}
          </button>

          {/* Send button — only when there's text */}
          {hasText && (
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={isSubmitting}
              className={clsx(
                'flex items-center justify-center rounded-full bg-sky-600 text-white',
                'hover:bg-sky-700 active:scale-95 transition-all disabled:opacity-40 shadow-sm shadow-sky-600/30 cursor-pointer',
                size === 'lg' ? 'w-8 h-8' : 'w-7 h-7'
              )}
            >
              <Send className={size === 'lg' ? 'w-3.5 h-3.5' : 'w-3 h-3'} />
            </button>
          )}
        </div>
      </div>

      {/* Voice feedback toast */}
      {(listening || processing || voiceError) && (
        <div className="absolute left-1/2 -translate-x-1/2 -bottom-9 z-30">
          {listening && (
            <span className="flex items-center gap-2 text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-1 rounded-full whitespace-nowrap shadow-md shadow-rose-950/5">
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
              {t.listening}
            </span>
          )}
          {processing && (
            <span className="flex items-center gap-2 text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full whitespace-nowrap shadow-md shadow-amber-950/5">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              {t.converting}
            </span>
          )}
          {voiceError && (
            <span className="text-xs font-medium text-amber-800 bg-amber-50 border border-amber-200 px-3.5 py-1 rounded-full whitespace-nowrap shadow-md shadow-amber-950/5">
              {voiceError}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
