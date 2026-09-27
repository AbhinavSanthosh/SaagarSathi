import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, TrendingUp, Radio } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import clsx from 'clsx';
import { useApp } from '../context/AppContext';
import { apiGet } from '../lib/api';
import { Card, Skeleton } from '../components/ui';
import MinimalSearchBar from '../components/MinimalSearchBar';
import CustomDropdown from '../components/CustomDropdown';

export default function InfoHub() {
  const navigate = useNavigate();
  const { location, lang, t } = useApp();
  const [data, setData] = useState<any>(null);
  const [metric, setMetric] = useState<'both' | 'sst' | 'chl'>('both');

  useEffect(() => {
    setData(null);
    apiGet(`/api/analytics?lat=${location.lat}&lon=${location.lon}&lang=${lang}`)
      .then(setData)
      .catch(console.error);
  }, [location.id, lang]);

  const handleSearch = (q: string, voiceLocale?: string) => {
    navigate('/ask', { state: { initialQuery: q, voiceLocale: voiceLocale || lang } });
  };

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-5 pb-24 animate-rise">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <TrendingUp size={20} className="text-sky-600" />
            <span>{t.analyticsTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">{location.name} · {t.analyticsSubtitle}</p>
        </div>
        <div className="w-full md:w-76">
          <MinimalSearchBar
            placeholder={t.searchPlaceholder}
            onSearch={handleSearch}
            currentLang={lang}
            size="md"
            submitVoiceOnStop
          />
        </div>
      </div>

      {!data ? (
        <><Skeleton className="h-28" /><Skeleton className="h-64" /></>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-5">
            {/* Anomaly alert */}
            {data.anomaly?.detected && (
              <div className="flex items-start gap-3 bg-amber-50/90 backdrop-blur-sm border border-amber-200/80 rounded-2xl p-4 shadow-xs">
                <AlertTriangle size={18} className="text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <h3 className="text-sm font-semibold text-amber-900">{t.anomalyDetected}</h3>
                  <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{data.anomaly.message}</p>
                </div>
              </div>
            )}

            {/* Chart */}
            <Card>
              <div className="p-5">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
                  <h3 className="text-sm font-semibold text-slate-900">{t.sevenDayTrends}</h3>
                  <CustomDropdown
                    items={[
                      { value: 'both', label: t.bothMetrics },
                      { value: 'sst', label: t.sstOnly },
                      { value: 'chl', label: t.chlOnly },
                    ]}
                    value={metric}
                    onChange={(v) => setMetric(v as any)}
                    size="sm"
                    menuClassName="w-48"
                  />
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={data.trends}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} dy={8} />
                      <YAxis yAxisId="l" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={40} domain={['auto', 'auto']} />
                      <YAxis yAxisId="r" orientation="right" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 11 }} width={40} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #bae6fd', fontSize: 12, boxShadow: '0 4px 12px rgba(2,132,199,0.08)' }} />
                      <Legend wrapperStyle={{ fontSize: 12 }} />
                      {(metric === 'both' || metric === 'sst') && <Line yAxisId="l" type="monotone" dataKey="sst" name="SST (°C)" stroke="#0284c7" strokeWidth={2.5} dot={{ r: 3, fill: '#0284c7' }} activeDot={{ r: 5 }} />}
                      {(metric === 'both' || metric === 'chl') && <Line yAxisId="r" type="monotone" dataKey="chl" name="Chl-a (mg/m³)" stroke="#0d9488" strokeWidth={2.5} dot={{ r: 3, fill: '#0d9488' }} activeDot={{ r: 5 }} />}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                <p className="text-xs text-slate-400 mt-3.5 leading-relaxed">
                  {t.pfzScienceNote}
                </p>
              </div>
            </Card>

            {/* Provenance */}
            <Card>
              <div className="px-5 py-3.5 border-b border-sky-100/80">
                <h3 className="text-sm font-semibold text-slate-900">{t.dataProvenance}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{t.provenanceSub}</p>
              </div>
              <div className="p-4 space-y-1">
                {(data.provenance || []).map((p: any, i: number) => (
                  <div key={i} className="flex items-baseline gap-3 py-2.5 border-b border-sky-50/70 last:border-0 text-sm">
                    <span className="text-xs font-semibold text-sky-700 bg-sky-50 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                      {i + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-slate-800">{p.agent}</span>
                      <span className="text-slate-500 ml-2 text-xs">{p.source}</span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Right column — bulletins */}
          <div>
            <Card>
              <div className="px-5 py-3.5 border-b border-sky-100/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Radio size={14} className="text-sky-600" />
                  <h3 className="text-sm font-semibold text-slate-900">{t.liveBulletins}</h3>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                  {data.bulletins?.length || 0}
                </span>
              </div>
              <div className="divide-y divide-sky-100/70 max-h-[560px] overflow-y-auto">
                {data.bulletins?.map((b: any, i: number) => (
                  <div
                    key={i}
                    className={clsx(
                      'px-5 py-3.5 hover:bg-sky-50/40 transition-colors',
                      b.type === 'danger'
                        ? 'border-l-4 border-l-rose-500'
                        : b.type === 'warning'
                        ? 'border-l-4 border-l-amber-500'
                        : 'border-l-4 border-l-sky-500'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-semibold text-sky-800 bg-sky-100/80 px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {b.source}
                      </span>
                      <span className="text-xs text-slate-400">{b.time}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900">{b.title}</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{b.desc || b.message}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
