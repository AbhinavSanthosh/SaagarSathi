import { useState } from 'react';
import { X, MapPin } from 'lucide-react';
import { useApp } from '../context/AppContext';
import OceanMap from '../components/OceanMap';

export default function MapPage() {
  const { t } = useApp();
  const [selected, setSelected] = useState<any>(null);

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row min-h-[calc(100vh-3.5rem)]">
      {/* Reusable Ocean Map */}
      <div className="flex-1 relative z-0 min-h-[55vh] md:min-h-0">
        <OceanMap onSelectZone={setSelected} />
      </div>

      {/* Side panel */}
      {selected ? (
        <div className="md:w-84 bg-white/95 backdrop-blur-md border-t md:border-t-0 md:border-l border-sky-100 p-5 md:overflow-y-auto z-[600] shadow-lg">
          <div className="flex justify-between items-start mb-3">
            <h3 className="text-sm font-semibold text-slate-900 leading-tight">{selected.title}</h3>
            <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-sky-50 text-slate-400 cursor-pointer">
              <X size={16} />
            </button>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{selected.desc}</p>
          {selected.why && (
            <div className="text-xs text-emerald-800 bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 mt-3 font-medium">
              {selected.why}
            </div>
          )}
          <div className="mt-3.5 space-y-0 divide-y divide-sky-100 text-sm">
            {selected.score && (
              <div className="flex justify-between py-2">
                <span className="text-slate-500 text-xs">{t.pfzScore}</span>
                <span className="font-semibold text-slate-900 text-xs">{selected.score}/100</span>
              </div>
            )}
            {selected.sst && (
              <div className="flex justify-between py-2">
                <span className="text-slate-500 text-xs">SST / Chl-a</span>
                <span className="font-medium text-slate-900 text-xs">{selected.sst}°C / {selected.chlorophyll} mg/m³</span>
              </div>
            )}
            {selected.dist && (
              <div className="flex justify-between py-2">
                <span className="text-slate-500 text-xs">{t.distance}</span>
                <span className="font-medium text-slate-900 text-xs">{selected.dist}</span>
              </div>
            )}
            {selected.wave != null && selected.wave !== 0 && (
              <div className="flex justify-between py-2">
                <span className="text-slate-500 text-xs">{t.wave}</span>
                <span className="font-medium text-slate-900 text-xs">{typeof selected.wave === 'number' ? `${selected.wave.toFixed(1)} m` : selected.wave}</span>
              </div>
            )}
          </div>
          {selected.type === 'danger' && (
            <p className="mt-4 text-xs text-rose-800 bg-rose-50 border border-rose-100 rounded-xl p-3 leading-relaxed">
              {t.avoidArea}
            </p>
          )}
        </div>
      ) : (
        <div className="hidden md:flex w-76 bg-white/70 backdrop-blur-md border-l border-sky-100 p-6 flex-col items-center justify-center text-center text-slate-400 text-xs">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center mb-3">
            <MapPin size={22} />
          </div>
          <span className="max-w-[180px] leading-relaxed font-medium">{t.clickZonePrompt}</span>
        </div>
      )}
    </div>
  );
}
