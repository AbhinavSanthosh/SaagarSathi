import type { ReactNode } from 'react';
import { AlertTriangle, AlertOctagon, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { alertStyle } from '../lib/locations';
import { useApp } from '../context/AppContext';

const borderColors: Record<string, string> = {
  SAFE: 'border-l-emerald-500',
  CAUTION: 'border-l-amber-500',
  'HIGH RISK': 'border-l-orange-500',
  DANGER: 'border-l-rose-500',
};

export const LEVEL_TRANSLATIONS: Record<string, Record<string, string>> = {
  SAFE: {
    en: 'SAFE',
    hi: 'सुरक्षित (SAFE)',
    ta: 'பாதுகாப்பானது (SAFE)',
    ml: 'സുരക്ഷിതം (SAFE)',
    te: 'సురక్షితం (SAFE)',
    gu: 'સુરક્ષિત (SAFE)',
    mr: 'सुरक्षित (SAFE)',
    bn: 'নিরাপদ (SAFE)',
    kn: 'ಸುರಕ್ಷಿತ (SAFE)',
  },
  CAUTION: {
    en: 'CAUTION',
    hi: 'सतर्कता (CAUTION)',
    ta: 'எச்சரிக்கை (CAUTION)',
    ml: 'ജാഗ്രത (CAUTION)',
    te: 'జాగ్రత్త (CAUTION)',
    gu: 'સાવચેતી (CAUTION)',
    mr: 'सावधगिरी (CAUTION)',
    bn: 'সতর্কতা (CAUTION)',
    kn: 'ಎಚ್ಚರಿಕೆ (CAUTION)',
  },
  'HIGH RISK': {
    en: 'HIGH RISK',
    hi: 'उच्च जोखिम (HIGH RISK)',
    ta: 'அதிக ஆபத்து (HIGH RISK)',
    ml: 'ഉയർന്ന അപകടസാധ്യത (HIGH RISK)',
    te: 'అధిక ప్రమాదం (HIGH RISK)',
    gu: 'ઉચ્ચ જોખમ (HIGH RISK)',
    mr: 'उच्च धोका (HIGH RISK)',
    bn: 'উচ্চ ঝুঁকি (HIGH RISK)',
    kn: 'ಹೆಚ್ಚಿನ ಅಪಾಯ (HIGH RISK)',
  },
  DANGER: {
    en: 'DANGER',
    hi: 'ख़तरा (DANGER)',
    ta: 'கடும் ஆபத்து (DANGER)',
    ml: 'ഗുരുതരമായ അപകടം (DANGER)',
    te: 'తీవ్ర ప్రమాదం (DANGER)',
    gu: 'ગંભીર જોખમ (DANGER)',
    mr: 'गंभीर धोका (DANGER)',
    bn: 'মারাত্মক বিপদ (DANGER)',
    kn: 'ತೀವ್ರ ಅಪಾಯ (DANGER)',
  },
};

export function verdictIcon(level?: string, cls = 'h-5 w-5') {
  const l = (level || '').toUpperCase();
  if (l === 'SAFE') return <CheckCircle2 className={cls} />;
  if (l === 'CAUTION') return <AlertCircle className={cls} />;
  if (l === 'HIGH RISK') return <AlertTriangle className={cls} />;
  if (l === 'DANGER') return <AlertOctagon className={cls} />;
  return <Info className={cls} />;
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white/85 backdrop-blur-md rounded-2xl border border-sky-100/90 shadow-xs shadow-sky-950/4 ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({
  icon,
  title,
  sub,
  right,
}: {
  icon?: ReactNode;
  title: string;
  sub?: string;
  right?: ReactNode;
}) {
  return (
    <div className="px-4 py-3.5 border-b border-sky-100/80 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && (
          <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-slate-900 text-sm leading-tight truncate">{title}</h3>
          {sub && <p className="text-xs text-slate-500 truncate mt-0.5">{sub}</p>}
        </div>
      </div>
      {right}
    </div>
  );
}

export function VerdictBanner({
  level,
  status,
  advice,
  score,
}: {
  level: string;
  status: string;
  advice?: string;
  score?: number;
}) {
  const { lang, t } = useApp();
  const s = alertStyle(level);
  const border = borderColors[(level || '').toUpperCase()] || 'border-l-slate-400';
  const levelText = LEVEL_TRANSLATIONS[(level || '').toUpperCase()]?.[lang] || level;

  return (
    <div className={`bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100/90 border-l-4 ${border} p-4 md:p-5 shadow-xs shadow-sky-950/4`}>
      <div className="flex items-start gap-3.5">
        <div className={`mt-0.5 shrink-0 ${s.text}`}>
          {verdictIcon(level, 'h-6 w-6')}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className={`text-xl font-bold tracking-tight ${s.text}`}>{levelText}</span>
            {score !== undefined && (
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                {t.riskWord} {score}/100
              </span>
            )}
          </div>
          <p className="text-sm font-medium text-slate-800 mt-1">{status}</p>
          {advice && (
            <div className="text-xs text-slate-600 mt-2 p-2.5 rounded-xl bg-sky-50/50 border border-sky-100 leading-relaxed">
              <span className="font-semibold text-slate-800">{t.adviceWord}:</span> {advice}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function WhyTrail({
  factors,
  provenance,
}: {
  factors?: Array<{ label: string; points: number; detail?: string }>;
  provenance?: Array<{ agent: string; source: string; time: string }>;
}) {
  const { t } = useApp();

  return (
    <div className="space-y-3">
      {factors && factors.length > 0 ? (
        <div className="divide-y divide-sky-100/80">
          {factors.map((f, i) => (
            <div key={i} className="flex items-start justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
              <div className="flex items-start gap-2.5 min-w-0">
                {f.points >= 40 ? (
                  <AlertOctagon size={16} className="text-rose-500 mt-0.5 shrink-0" />
                ) : f.points > 0 ? (
                  <AlertTriangle size={16} className="text-amber-500 mt-0.5 shrink-0" />
                ) : (
                  <CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />
                )}
                <div className="min-w-0">
                  <div className="text-sm font-medium text-slate-800 leading-tight">{f.label}</div>
                  {f.detail && <div className="text-xs text-slate-500 mt-0.5">{f.detail}</div>}
                </div>
              </div>
              <span className="text-xs font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md shrink-0">
                +{f.points}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-500">{t.allChecksNominal}</p>
      )}
      {provenance && (
        <div className="rounded-xl bg-sky-50/60 border border-sky-100 p-3 text-xs text-slate-600 leading-relaxed">
          <div className="font-semibold text-sky-900 mb-1.5 tracking-wide text-[11px] uppercase flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500" />
            {t.evidenceTrail}
          </div>
          <div className="space-y-1">
            {provenance.map((p, i) => (
              <div key={i} className="flex gap-2 py-0.5">
                <span className="text-sky-400 font-medium shrink-0">{i + 1}.</span>
                <span>
                  <strong className="text-slate-800 font-semibold">{p.agent}:</strong> {p.source}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse bg-sky-100/70 rounded-2xl ${className}`} />;
}
