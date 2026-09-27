import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wind, Waves, MapPin, Fish, Navigation2,
  AlertCircle, Activity, Sparkles, ArrowRight, Map as MapIcon, Maximize2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiGet, BACKEND_HINT, API_VERSION } from '../lib/api';
import { Card, CardHeader, VerdictBanner, WhyTrail, Skeleton } from '../components/ui';
import MinimalSearchBar from '../components/MinimalSearchBar';
import OceanMap from '../components/OceanMap';

interface Orchestrator {
  weather: any; ocean: any; pfz: any[]; geofence: any;
  risk: any; fishingOpportunity: any; validation: any;
  bulletins: any[]; provenance: any[]; agents: any[];
}

export default function Home() {
  const navigate = useNavigate();
  const { location, lang, langName, t } = useApp();
  const [data, setData] = useState<Orchestrator | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    setLoading(true); setErr('');
    apiGet<Orchestrator>(`/api/orchestrator?lat=${location.lat}&lon=${location.lon}&lang=${lang}`)
      .then((d) => {
        // Contract guard: an outdated backend (pre-fix server still running)
        // sends zone shapes this UI can't render — tell the user to restart it
        // instead of crashing.
        if ((d as any)?.v !== API_VERSION) {
          throw new Error('OUTDATED_BACKEND');
        }
        setData(d); setLoading(false);
      })
      .catch((e) => {
        setErr(
          e instanceof Error && e.message === 'OUTDATED_BACKEND'
            ? 'Your backend server is an old version. Stop it (Ctrl+C in its terminal) and start it again: cd saagarsathi/server → node index.js. Then press Retry.'
            : BACKEND_HINT
        );
        setLoading(false);
      });
  }, [location.id, lang]);

  const handleSearch = (query: string, voiceLocale?: string) => {
    navigate('/ask', { state: { initialQuery: query, voiceLocale: voiceLocale || lang } });
  };

  const metrics = data ? [
    { icon: <Wind size={18} />, label: t.weatherWind, value: `${data.weather.windSpeed}`, unit: 'km/h', sub: `${t.from} ${data.weather.windDirection}°`, color: 'text-ocean-600 bg-ocean-50' },
    { icon: <Waves size={18} />, label: t.weatherWaves, value: `${data.weather.waveHeight}`, unit: 'm', sub: `${t.swell} ${data.weather.swellWaveHeight ?? '—'} m`, color: 'text-sky-600 bg-sky-50' },
    { icon: <Activity size={18} />, label: t.oceanSST, value: `${data.ocean.seaSurfaceTemperature}`, unit: '°C', sub: 'Oceansat-3 SSTM', color: 'text-teal-600 bg-teal-50' },
    { icon: <Sparkles size={18} />, label: t.oceanChla, value: `${data.ocean.chlorophyll}`, unit: 'mg/m³', sub: data.ocean.upwellingIndex ? t.upwellingLikely : t.upwellingWeak, color: 'text-emerald-600 bg-emerald-50' },
  ] : [];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-4 pb-24 animate-rise">
      {/* Search Bar + Location Strip */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full">
          <MinimalSearchBar
            placeholder={t.searchPlaceholder}
            onSearch={handleSearch}
            currentLang={lang}
            size="lg"
            submitVoiceOnStop
          />
        </div>
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-md border border-sky-150 text-slate-700 rounded-full px-4 py-2.5 text-xs shrink-0 font-medium shadow-2xs">
          <MapPin size={14} className="text-sky-600 shrink-0" />
          <span>{location.name} · {location.lat.toFixed(2)}, {location.lon.toFixed(2)}</span>
        </div>
      </div>

      {loading ? (
        <>
          <Skeleton className="h-32" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </div>
          <Skeleton className="h-48" />
        </>
      ) : err || !data ? (
        <Card className="p-8 text-center max-w-xl mx-auto">
          <AlertCircle className="mx-auto text-amber-500 mb-3" size={32} />
          <h2 className="font-semibold text-base text-slate-900">{t.serviceUnreachable}</h2>
          <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{err}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-5 px-5 py-2.5 bg-sky-600 text-white text-xs font-medium rounded-xl hover:bg-sky-700 transition-all shadow-sm shadow-sky-600/30 cursor-pointer"
          >
            {t.retry}
          </button>
        </Card>
      ) : (
        <>
          {/* Main Verdict Banner */}
          <VerdictBanner
            level={data.risk.alertLevel}
            status={data.risk.status}
            advice={data.risk.advice}
            score={data.risk.riskScore}
          />

          {/* Environmental Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {metrics.map((m, i) => (
              <Card key={i} className="p-4 flex items-center gap-3.5 hover:border-sky-300/80 transition-colors">
                <div className={`w-10 h-10 rounded-xl ${m.color} flex items-center justify-center shrink-0`}>
                  {m.icon}
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-500 font-medium">{m.label}</div>
                  <div className="text-xl font-bold text-slate-900 leading-tight">
                    {m.value} <span className="text-xs font-normal text-slate-500">{m.unit}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mt-0.5">{m.sub}</div>
                </div>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Fishing Opportunity (PFZ) */}
            <Card className="lg:col-span-2">
              <CardHeader
                icon={<Fish size={16} />}
                title={t.fishingOpportunity}
                sub={data.pfz[0] ? `${t.fishingOppSub} · ${data.pfz[0].score}/100` : 'No PFZ today'}
                right={
                  <button
                    onClick={() => navigate('/map')}
                    className="text-xs font-medium text-sky-700 bg-sky-50 border border-sky-200/80 px-3 py-1.5 rounded-xl hover:bg-sky-100 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t.openMap}</span>
                    <ArrowRight size={12} />
                  </button>
                }
              />
              <div className="p-4 space-y-3">
                {data.pfz.map((z: any) => {
                  // Tolerant coords: current API sends lat/lon + array center,
                  // very old servers sent only a {lat,lon} center object.
                  const plat = z.lat ?? z.center?.lat ?? (Array.isArray(z.center) ? z.center[0] : undefined);
                  const plon = z.lon ?? z.center?.lon ?? (Array.isArray(z.center) ? z.center[1] : undefined);
                  return (
                  <div
                    key={z.id}
                    className="rounded-2xl border border-sky-100 bg-sky-50/40 hover:bg-sky-50/70 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-slate-900 text-sm flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{z.title} · {typeof plat === 'number' ? plat.toFixed(3) : '—'}, {typeof plon === 'number' ? plon.toFixed(3) : '—'}</span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">{z.desc}</div>
                      <div className="text-[11px] text-slate-500 mt-1.5 font-medium">{z.why}</div>
                    </div>
                    <button
                      onClick={() => navigate('/map')}
                      className="shrink-0 text-xs font-medium bg-sky-600 text-white px-3.5 py-2 rounded-xl hover:bg-sky-700 transition-all shadow-xs shadow-sky-600/30 cursor-pointer"
                    >
                      {t.navigate}
                    </button>
                  </div>
                  );
                })}

                {data.risk.alertLevel === 'DANGER' && (
                  <div className="rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium p-3">
                    {t.dangerPrecedence}
                  </div>
                )}
              </div>
            </Card>

            {/* Geofence Watch */}
            <Card>
              <CardHeader icon={<Navigation2 size={16} />} title={t.geofenceWatch} sub={data.geofence.nearestBoundary} />
              <div className="p-4 space-y-3">
                <div className="rounded-2xl bg-sky-50/60 border border-sky-100 p-4">
                  <div className="text-2xl font-bold text-sky-950">
                    {data.geofence.distToIMBL} <span className="text-xs font-medium text-sky-700">{t.kmToImbl}</span>
                  </div>
                  <div className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {data.geofence.warnings[0] || t.clearBoundary}
                  </div>
                </div>

                {data.geofence.isInsideMPA && (
                  <div className="text-xs text-rose-700 bg-rose-50 border border-rose-200 rounded-xl p-3">
                    {t.insideMpaWarning}
                  </div>
                )}

                <button
                  onClick={() => navigate('/map')}
                  className="w-full py-2.5 rounded-xl border border-sky-200 text-sky-800 text-xs font-medium hover:bg-sky-50 hover:border-sky-300 transition-all cursor-pointer"
                >
                  {t.viewImblMap}
                </button>
              </div>
            </Card>
          </div>

          {/* Live Bulletins & Live Ocean Map */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2">
              <CardHeader
                title={t.liveBulletins}
                sub="INCOIS · IMD · DAMINI · Bhuvan"
                right={
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200/60">
                    {data.bulletins.length} {t.active}
                  </span>
                }
              />
              <div className="divide-y divide-sky-100/70 max-h-80 overflow-y-auto">
                {data.bulletins.map((b: any) => (
                  <div key={b.id} className="p-3.5 hover:bg-sky-50/40 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-sky-100 text-sky-700 px-2 py-0.5 rounded-md">
                        {b.source}
                      </span>
                      <span className="text-xs text-slate-400">{b.time}</span>
                    </div>
                    <div className="text-sm font-medium text-slate-900">{b.title}</div>
                    <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">{b.desc}</div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Live Interactive Ocean Map Card replacing Agent pipeline */}
            <Card className="flex flex-col overflow-hidden">
              <CardHeader
                icon={<MapIcon size={16} />}
                title={t.oceanMap}
                sub={location.name}
                right={
                  <button
                    onClick={() => navigate('/map')}
                    className="text-xs font-semibold text-sky-700 bg-sky-50 border border-sky-200/90 px-2.5 py-1.5 rounded-xl hover:bg-sky-100 hover:border-sky-300 transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs group"
                    title={t.openMap}
                  >
                    <Maximize2 size={13} className="text-sky-600 group-hover:scale-110 transition-transform" />
                    <span>{t.maximize}</span>
                  </button>
                }
              />
              <div className="relative flex-1 min-h-[300px] w-full rounded-b-2xl overflow-hidden">
                <OceanMap
                  className="w-full h-full min-h-[300px]"
                  compactLegend
                />
              </div>
            </Card>
          </div>

          {/* Explainable Evidence (Why trail) */}
          <Card>
            <CardHeader
              title={t.whyVerdict}
              sub={t.whyEvidenceSub}
            />
            <div className="p-4">
              <WhyTrail factors={data.risk.factors} provenance={data.provenance} />
            </div>
          </Card>

          {/* Footer Disclaimer */}
          <div className="text-center text-xs text-slate-400 py-3 border-t border-sky-100">
            {t.disclaimerText} · {t.respondsInText} {langName}.
          </div>
        </>
      )}
    </div>
  );
}
