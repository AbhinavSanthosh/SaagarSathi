import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, MessageCircle, BarChart2, Menu, MapPin, X } from 'lucide-react';

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: Home },
    { path: '/map', label: 'Maps', icon: MapIcon },
    { path: '/ask', label: 'Ask SaagarSathi', icon: MessageCircle },
    { path: '/info', label: 'Info Hub', icon: BarChart2 },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50 overflow-hidden">
      {/* Top Navbar */}
      <header className="bg-ocean-900 text-white shadow-md z-40 relative">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button 
              className="p-2 md:hidden hover:bg-ocean-800 rounded-lg transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <div className="flex items-center space-x-2">
              {/* Logo Placeholder */}
              <div className="w-8 h-8 bg-ocean-500 rounded-full flex items-center justify-center font-bold text-lg">
                O
              </div>
              <h1 className="text-xl font-bold tracking-wide hidden sm:block">SaagarSathi</h1>
            </div>
          </div>

          {/* Area Switcher */}
          <div className="flex items-center bg-ocean-800 px-3 py-1.5 rounded-full border border-ocean-700 cursor-pointer hover:bg-ocean-700 transition-colors">
            <MapPin size={16} className="text-ocean-300 mr-2" />
            <select className="bg-transparent text-sm font-medium focus:outline-none cursor-pointer appearance-none text-white pr-4">
              <option value="kochi" className="text-black">Kochi Coast</option>
              <option value="mangaluru" className="text-black">Mangaluru</option>
              <option value="chennai" className="text-black">Chennai</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200">
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors ${
                    isActive 
                      ? 'bg-ocean-50 text-ocean-700 font-semibold' 
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={20} className={isActive ? 'text-ocean-600' : 'text-gray-400'} />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </aside>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-gray-50 relative w-full h-full">
          {children}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white border-t border-gray-200 pb-safe z-40">
        <div className="flex justify-around">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center justify-center flex-1 py-3 px-2 ${
                  isActive ? 'text-ocean-600' : 'text-gray-500'
                }`}
              >
                <div className={`p-1.5 rounded-full ${isActive ? 'bg-ocean-50' : ''}`}>
                  <Icon size={24} />
                </div>
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
