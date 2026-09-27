import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Polygon,
  Circle,
  CircleMarker,
  Polyline,
  LayersControl,
  FeatureGroup,
  Popup,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import { Compass, Navigation } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiGet } from '../lib/api';

const STANDARD_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const SATELLITE_URL = 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

/** Flies the map smoothly to the new center when location changes (without remounting). */
function MapUpdater({ center }: { center: [number, number] }) {
  const map = useMap();
  const prevCenter = useRef(center);
  useEffect(() => {
    if (prevCenter.current[0] !== center[0] || prevCenter.current[1] !== center[1]) {
      map.flyTo(center, map.getZoom(), { duration: 1.2 });
      prevCenter.current = center;
    }
  }, [center, map]);
  return null;
}

/** Listens for Leaflet baselayerchange events and updates the global basemap state. */
function BasemapTracker({
  onBaseChange,
  satelliteLayerName,
}: {
  onBaseChange: (b: 'standard' | 'satellite') => void;
  satelliteLayerName: string;
}) {
  useMapEvents({
    baselayerchange(e) {
      if (
        e.name === satelliteLayerName ||
        e.name.toLowerCase().includes('satellite') ||
        e.name.toLowerCase().includes('esri')
      ) {
        onBaseChange('satellite');
      } else {
        onBaseChange('standard');
      }
    },
  });
  return null;
}

export interface OceanMapProps {
  className?: string;
  compactLegend?: boolean;
  onSelectZone?: (zone: any) => void;
  showLayersControl?: boolean;
}

export default function OceanMap({
  className = 'w-full h-full absolute inset-0',
  compactLegend = false,
  onSelectZone,
  showLayersControl = true,
}: OceanMapProps) {
  const { location, t, basemap, setBasemap } = useApp();
  const [zones, setZones] = useState<{
    dangerZones: any[];
    pfz: any[];
    mpas: any[];
    imbl: any[];
    vessel: any;
    geofence: any;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    apiGet(`/api/zones?lat=${location.lat}&lon=${location.lon}`)
      .then((d: any) => {
        setZones(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [location.id]);

  const center: [number, number] = [location.lat, location.lon];
  const isSatellite = basemap === 'satellite';

  return (
    <div className="relative w-full h-full overflow-hidden">
      <MapContainer
        center={center}
        zoom={compactLegend ? 8.5 : 9}
        className={className}
        zoomControl={!compactLegend}
      >
        <MapUpdater center={center} />
        <BasemapTracker
          onBaseChange={setBasemap}
          satelliteLayerName={t.satelliteLayer}
        />

        {showLayersControl ? (
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked={!isSatellite} name={t.standardLayer}>
              <TileLayer attribution="&copy; OpenStreetMap" url={STANDARD_URL} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer checked={isSatellite} name={t.satelliteLayer}>
              <TileLayer attribution="Esri World Imagery" url={SATELLITE_URL} />
            </LayersControl.BaseLayer>
            <LayersControl.Overlay checked name={t.pfzZones}>
              <FeatureGroup>
                {(zones?.pfz || []).map((z: any, i: number) => {
                  // Tolerant center: current API sends an array, very old
                  // servers sent a {lat,lon} object. Skip unusable entries.
                  const pos: [number, number] | null = Array.isArray(z.center)
                    ? (z.center as [number, number])
                    : typeof z.center?.lat === 'number'
                      ? [z.center.lat, z.center.lon ?? z.center.lng]
                      : typeof z.lat === 'number'
                        ? [z.lat, z.lon]
                        : null;
                  if (!pos || !pos.every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
                  return (
                  <Circle
                    key={`pfz-${i}`}
                    center={pos}
                    radius={z.radius || 8000}
                    pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.22, weight: 2 }}
                    eventHandlers={{ click: () => onSelectZone?.({ type: 'pfz', ...z }) }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[150px] text-xs">
                        <div className="font-bold text-emerald-800 flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                          <span>{z.title}</span>
                        </div>
                        <div className="text-slate-600 text-[11px] mt-1">{z.desc}</div>
                        {z.score && (
                          <div className="text-emerald-700 font-semibold text-[11px] mt-1 bg-emerald-50 px-1.5 py-0.5 rounded-md inline-block">
                            Score: {z.score}/100
                          </div>
                        )}
                        {z.why && <div className="text-[10px] text-slate-500 mt-1">{z.why}</div>}
                      </div>
                    </Popup>
                  </Circle>
                  );
                })}
              </FeatureGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name={t.hazardBuffers}>
              <FeatureGroup>
                {(zones?.dangerZones || []).map((z: any, i: number) => (
                  <Polygon
                    key={`dz-${i}`}
                    positions={z.coordinates}
                    pathOptions={{
                      color: z.type === 'mpa' ? '#f59e0b' : '#ef4444',
                      fillColor: z.type === 'mpa' ? '#f59e0b' : '#ef4444',
                      fillOpacity: 0.18,
                      weight: 2,
                      dashArray: '6 4',
                    }}
                    eventHandlers={{ click: () => onSelectZone?.({ type: 'danger', ...z }) }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[140px] text-xs">
                        <div className="font-bold text-rose-800">{z.title}</div>
                        <div className="text-slate-600 text-[11px] mt-1">{z.desc || z.reason}</div>
                      </div>
                    </Popup>
                  </Polygon>
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name={t.imblLines}>
              <FeatureGroup>
                {(zones?.imbl || []).map((s: any, i: number) => (
                  <Polyline
                    key={`imbl-${i}`}
                    positions={s.line}
                    pathOptions={{ color: '#dc2626', weight: 2.5, dashArray: '8 5' }}
                  />
                ))}
                {(zones?.mpas || []).map((m: any, i: number) => (
                  <Polygon
                    key={`mpa-${i}`}
                    positions={m.polygon}
                    pathOptions={{ color: '#d97706', fillColor: '#f59e0b', fillOpacity: 0.15, weight: 1.5 }}
                    eventHandlers={{
                      click: () =>
                        onSelectZone?.({
                          type: 'danger',
                          title: m.name,
                          desc: 'Marine Protected Area — fishing restricted.',
                          dist: `${m.radiusKm} km radius`,
                          wave: null,
                        }),
                    }}
                  >
                    <Popup>
                      <div className="p-1 min-w-[140px] text-xs">
                        <div className="font-bold text-amber-800">{m.name}</div>
                        <div className="text-slate-600 text-[11px] mt-1">Marine Protected Area ({m.radiusKm} km)</div>
                      </div>
                    </Popup>
                  </Polygon>
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          </LayersControl>
        ) : (
          <>
            <TileLayer
              attribution="&copy; OpenStreetMap"
              url={isSatellite ? SATELLITE_URL : STANDARD_URL}
            />
            <FeatureGroup>
              {(zones?.pfz || []).map((z: any, i: number) => {
                const pos: [number, number] | null = Array.isArray(z.center)
                  ? (z.center as [number, number])
                  : typeof z.center?.lat === 'number'
                    ? [z.center.lat, z.center.lon ?? z.center.lng]
                    : typeof z.lat === 'number'
                      ? [z.lat, z.lon]
                      : null;
                if (!pos || !pos.every((n) => typeof n === 'number' && Number.isFinite(n))) return null;
                return (
                <Circle
                  key={`pfz-${i}`}
                  center={pos}
                  radius={z.radius || 8000}
                  pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.22, weight: 2 }}
                />
                );
              })}
              {(zones?.imbl || []).map((s: any, i: number) => (
                <Polyline
                  key={`imbl-${i}`}
                  positions={s.line}
                  pathOptions={{ color: '#dc2626', weight: 2.5, dashArray: '8 5' }}
                />
              ))}
            </FeatureGroup>
          </>
        )}

        {zones?.vessel && (
          <CircleMarker
            center={[zones.vessel.lat, zones.vessel.lon]}
            radius={compactLegend ? 7 : 8}
            pathOptions={{ color: '#0284c7', fillColor: '#0284c7', fillOpacity: 1, weight: 2.5 }}
          >
            <Popup>
              <div className="p-1 text-xs font-semibold text-sky-900">
                {t.yourVessel} ({location.name})
              </div>
            </Popup>
          </CircleMarker>
        )}
      </MapContainer>

      {/* Nautical Ocean Legend (Full or Compact) */}
      {compactLegend ? (
        <div className="absolute bottom-2 left-2 z-[500] bg-white/90 backdrop-blur-md rounded-xl border border-sky-100/90 px-2.5 py-1 text-[10px] flex items-center gap-2.5 shadow-md shadow-sky-950/6 pointer-events-auto">
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 shadow-xs shadow-emerald-500/30" />
            <span>PFZ</span>
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-sky-600 shrink-0 shadow-xs shadow-sky-600/30" />
            <span>Vessel</span>
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span className="w-2 h-2 rounded-sm bg-rose-400 shrink-0" />
            <span>Hazard</span>
          </span>
          <span className="flex items-center gap-1 font-medium text-slate-700">
            <span className="w-3 h-0 border-t-2 border-dashed border-red-500 shrink-0" />
            <span>IMBL</span>
          </span>
        </div>
      ) : (
        <div className="absolute top-3 left-3 z-[500] bg-white/90 backdrop-blur-md rounded-2xl border border-sky-100 p-3.5 text-xs space-y-2 max-w-[220px] shadow-lg shadow-sky-950/6 pointer-events-auto">
          <div className="font-semibold text-slate-900 text-xs flex items-center gap-1.5 pb-1.5 border-b border-sky-100">
            <Compass size={14} className="text-sky-600 shrink-0" />
            <span className="truncate">{location.name}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 shadow-xs shadow-emerald-500/30" />
            <span>{t.pfzLikely}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-400 shrink-0" />
            <span>{t.hazardBuffer}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-3.5 h-0 border-t-2 border-dashed border-red-500 shrink-0" />
            <span>{t.imblBoundary}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0 shadow-xs shadow-sky-600/40" />
            <span>{t.yourVessel}</span>
          </div>
          {zones?.geofence && (
            <div className="pt-1.5 text-sky-800 font-medium border-t border-sky-100 text-[11px] flex items-center gap-1">
              <Navigation size={11} className="text-sky-600 shrink-0" />
              <span>IMBL {zones.geofence.distToIMBL} km</span>
            </div>
          )}
          {loading && <div className="text-sky-600 animate-pulse text-[11px]">Loading nautical data…</div>}
        </div>
      )}
    </div>
  );
}
