import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Circle, LayersControl, FeatureGroup } from 'react-leaflet';
import { AlertOctagon, Info, Map as MapIcon, X, Fish } from 'lucide-react';

const kochiCoords: [number, number] = [9.9312, 76.2673];

export default function MapPage() {
  const [selectedFeature, setSelectedFeature] = useState<any>(null);
  const [zones, setZones] = useState<{ dangerZones: any[], pfz: any[] }>({ dangerZones: [], pfz: [] });

  useEffect(() => {
    fetch('/api/zones?lat=9.9312&lon=76.2673')
      .then(res => res.json())
      .then(data => setZones(data))
      .catch(console.error);
  }, []);

  return (
    <div className="relative w-full h-full flex flex-col md:flex-row">
      <div className="flex-1 relative z-0">
        <MapContainer center={kochiCoords} zoom={10} className="w-full h-full" zoomControl={false}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer checked name="Standard">
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
            </LayersControl.BaseLayer>
            <LayersControl.Overlay checked name="Danger Zones">
              <FeatureGroup>
                {zones.dangerZones.map((zone, i) => (
                  <Polygon 
                    key={i}
                    positions={zone.coordinates} 
                    pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.4 }}
                    eventHandlers={{ click: () => setSelectedFeature({ type: 'danger', ...zone }) }}
                  />
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
            <LayersControl.Overlay checked name="Fishing Zones (PFZ)">
              <FeatureGroup>
                {zones.pfz.map((zone, i) => (
                  <Circle 
                    key={i}
                    center={zone.center} 
                    radius={zone.radius || 8000} 
                    pathOptions={{ color: '#10b981', fillColor: '#10b981', fillOpacity: 0.5 }}
                    eventHandlers={{ click: () => setSelectedFeature({ type: 'pfz', ...zone }) }}
                  />
                ))}
              </FeatureGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>

      {/* Bottom Sheet / Side Panel */}
      {selectedFeature && (
        <div className="absolute md:relative bottom-0 left-0 right-0 md:w-80 bg-white shadow-2xl z-[1000] rounded-t-3xl md:rounded-none border-t md:border-t-0 md:border-l border-gray-200">
          <div className="p-6 flex flex-col">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                {selectedFeature.type === 'danger' ? (
                  <AlertOctagon className="text-red-500 w-6 h-6" />
                ) : (
                  <Fish className="text-emerald-500 w-6 h-6" />
                )}
                <h3 className="text-lg font-bold text-gray-900">{selectedFeature.title}</h3>
              </div>
              <button onClick={() => setSelectedFeature(null)} className="p-1 bg-gray-100 rounded-full hover:bg-gray-200">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-6">{selectedFeature.desc}</p>
            <div className="space-y-3">
              {selectedFeature.dist && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Distance</span>
                  <span className="text-sm font-bold">{selectedFeature.dist}</span>
                </div>
              )}
              {selectedFeature.wave && (
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Wave Height</span>
                  <span className="text-sm font-bold">{selectedFeature.wave}</span>
                </div>
              )}
            </div>
            {selectedFeature.type === 'danger' && (
              <div className="mt-6 p-4 bg-red-50 text-red-700 rounded-xl flex items-start space-x-3 text-sm font-medium">
                <Info className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>Strictly avoid this area. Coast Guard patrol advised.</p>
              </div>
            )}
          </div>
        </div>
      )}
      {!selectedFeature && (
        <div className="hidden md:flex relative w-80 bg-white border-l border-gray-200 p-6 flex-col items-center justify-center text-center text-gray-400">
          <MapIcon className="w-12 h-12 mb-4 text-gray-300" />
          <p>Click on any highlighted zone on the map to view details.</p>
        </div>
      )}
    </div>
  );
}
