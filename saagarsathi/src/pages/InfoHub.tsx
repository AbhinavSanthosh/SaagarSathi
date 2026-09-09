import React, { useState, useEffect } from 'react';
import { Search, Activity, FileText, Bell, AlertCircle, TrendingDown, Info } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import clsx from 'clsx';

export default function InfoHub() {
  const [data, setData] = useState<{ trends: any[], bulletins: any[], anomaly: any } | null>(null);

  useEffect(() => {
    fetch('/api/analytics')
      .then(res => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6 pb-24">
      
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900">Research & Analytics</h1>
          <p className="text-gray-500 font-medium">Kochi Coast Baseline</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search coordinates or MPAs..."
            className="w-full bg-white border border-gray-200 rounded-full py-2.5 pl-10 pr-4 focus:outline-none focus:border-ocean-500 focus:ring-1 focus:ring-ocean-500 shadow-sm"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Analytics */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Anomaly Detection Card */}
          {data?.anomaly?.detected && (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-start space-x-4 shadow-sm">
              <div className="p-2 bg-amber-100 rounded-full text-amber-600 flex-shrink-0">
                <TrendingDown size={24} />
              </div>
              <div>
                <h3 className="text-amber-900 font-bold flex items-center mb-1">
                  Anomaly Detected <span className="ml-2 text-[10px] bg-amber-200 px-2 py-0.5 rounded uppercase tracking-wider font-bold">Live</span>
                </h3>
                <p className="text-amber-800 text-sm font-medium leading-relaxed">
                  {data.anomaly.message}
                </p>
              </div>
            </div>
          )}

          {/* Charts */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Activity className="w-5 h-5 mr-2 text-ocean-600" />
                7-Day Environmental Trends
              </h3>
              <select className="bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none">
                <option>Chlorophyll-a</option>
                <option>Sea Surface Temp (SST)</option>
              </select>
            </div>
            
            <div className="h-64 w-full">
              {data?.trends ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={data.trends}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#9ca3af', fontSize: 12}} dx={-10} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Line type="monotone" dataKey="chl" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff'}} activeDot={{r: 6}} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Loading chart...</div>
              )}
            </div>
          </div>
          
        </div>

        {/* Right Col: Feed */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-[500px]">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex items-center justify-between sticky top-0">
              <h3 className="font-bold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-ocean-600" />
                Live Bulletins
              </h3>
              <span className="text-xs font-bold text-ocean-600 bg-ocean-100 px-2 py-1 rounded">
                {data?.bulletins?.filter(b => b.type === 'danger' || b.type === 'safe').length || 0} New
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {data?.bulletins ? data.bulletins.map((bulletin, idx) => (
                <div key={idx} className={clsx(
                  "p-4 rounded-xl hover:bg-gray-50 transition-colors border-l-4 bg-white",
                  bulletin.type === 'danger' ? 'border-danger' : 
                  bulletin.type === 'safe' ? 'border-safe' : 'border-gray-300 opacity-60'
                )}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-2 py-0.5 rounded">{bulletin.source}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{bulletin.time}</span>
                  </div>
                  <h4 className="text-sm font-bold text-gray-900 mb-1">{bulletin.title}</h4>
                  <p className="text-xs text-gray-600 line-clamp-2">{bulletin.desc}</p>
                </div>
              )) : (
                <div className="p-4 text-center text-gray-400 text-sm">Loading bulletins...</div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
