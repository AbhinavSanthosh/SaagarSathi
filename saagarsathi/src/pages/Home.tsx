import React, { useState, useEffect } from 'react';
import { Search, Mic, Wind, Waves, AlertTriangle, ChevronRight, Navigation2, CheckCircle2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const navigate = useNavigate();
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We would use the selected area's coordinates from global state here, using Kochi for now.
    fetch('/api/weather?lat=9.9312&lon=76.2673')
      .then(res => res.json())
      .then(data => {
        setWeatherData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6">
      
      {/* The Omnibar */}
      <div className="relative group cursor-pointer" onClick={() => navigate('/ask')}>
        <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400 group-hover:text-ocean-500 transition-colors" />
        </div>
        <div className="w-full bg-white border border-gray-200 text-gray-500 rounded-full py-4 pl-12 pr-16 shadow-sm hover:shadow-md transition-shadow text-base outline-none flex items-center">
           Ask about safety, weather, or fishing zones...
        </div>
        <div className="absolute inset-y-0 right-2 flex items-center">
          <button className="p-2 bg-ocean-50 text-ocean-600 rounded-full hover:bg-ocean-100 transition-colors">
            <Mic className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Quick Info & Safety Box */}
      <div className="bg-white rounded-3xl shadow-sm overflow-hidden border border-gray-100 min-h-[200px]">
        {loading ? (
          <div className="flex items-center justify-center h-full p-12 text-gray-400">Loading marine data...</div>
        ) : weatherData ? (
          <>
            <div className={`p-6 text-center text-white ${
              weatherData.alertLevel === 'danger' ? 'bg-danger' : 
              weatherData.alertLevel === 'warning' ? 'bg-warning text-yellow-900' : 'bg-safe'
            }`}>
              {weatherData.alertLevel === 'danger' && <AlertTriangle className="h-10 w-10 mx-auto mb-2 opacity-90" />}
              {weatherData.alertLevel === 'warning' && <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-90" />}
              {weatherData.alertLevel === 'safe' && <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-90" />}
              
              <h2 className="text-3xl font-black tracking-tight mb-1">{weatherData.status}</h2>
              <p className="font-medium opacity-90">{weatherData.message}</p>
            </div>
            
            <div className="grid grid-cols-2 divide-x divide-gray-100 p-4">
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center text-gray-500 mb-1">
                  <Wind className="h-4 w-4 mr-1.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Wind</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{weatherData.windSpeed} <span className="text-sm font-medium text-gray-500">km/h</span></span>
              </div>
              <div className="flex flex-col items-center justify-center py-2">
                <div className="flex items-center text-gray-500 mb-1">
                  <Waves className="h-4 w-4 mr-1.5" />
                  <span className="text-xs font-semibold uppercase tracking-wider">Waves</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{weatherData.waveHeight} <span className="text-sm font-medium text-gray-500">m</span></span>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-gray-200 text-gray-600 p-6 text-center h-full flex flex-col justify-center">
            <h2 className="text-xl font-bold">STATUS UNKNOWN</h2>
            <p className="text-sm mt-2">Awaiting ocean state data. Tap here to view available weather.</p>
          </div>
        )}
      </div>

      {/* Mini-Map */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-900 flex items-center">
            <Navigation2 className="w-5 h-5 mr-2 text-ocean-600" />
            Live Zones
          </h3>
          <button 
            onClick={() => navigate('/map')}
            className="text-sm text-ocean-600 font-semibold hover:text-ocean-700 flex items-center"
          >
            Expand Map <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
        
        {/* Placeholder for actual map. Using an image or stylized div for now */}
        <div className="relative h-64 bg-ocean-50 cursor-pointer" onClick={() => navigate('/map')}>
          <div className="absolute inset-0 bg-[url('https://maps.wikimedia.org/osm-intl/10/727/478.png')] bg-cover bg-center opacity-60 mix-blend-multiply"></div>
          
          {/* Overlays */}
          {weatherData?.alertLevel === 'danger' && (
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-danger rounded-full mix-blend-multiply opacity-40 blur-md animate-pulse"></div>
          )}
          <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-safe rounded-full mix-blend-multiply opacity-50 blur-md"></div>
          
          {/* Badge */}
          <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 rounded-full bg-safe animate-pulse"></div>
              <span className="text-xs font-bold text-gray-700">PFZ Detected</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
