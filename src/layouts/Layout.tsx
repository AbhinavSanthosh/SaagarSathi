import type { ReactNode } from 'react';
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Map as MapIcon, MessageCircle, BarChart2, Menu, MapPin, X, Globe, Waves } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LOCATIONS, LANGUAGES } from '../lib/locations';
import CustomDropdown from '../components/CustomDropdown';

export default function Layout({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const loc = useLocation();
  const { location, setLocationId, lang, setLang, t } = useApp();

  const navItems = [
    { path: '/', label: t.dashboard, icon: Home },
    { path: '/map', label: t.oceanMap, icon: MapIcon },
    { path: '/ask', label: t.askOrca, icon: MessageCircle },
    { path: '/info', label: t.research, icon: BarChart2 },
  ];

  const languageDropdownItems = LANGUAGES.map((l) => ({
    value: l.code,
    label: l.name,
  }));

  const locationDropdownItems = LOCATIONS.map((l) => ({
    value: l.id,
    label: l.names?.[lang] || l.name,
    sublabel: l.state,
  }));

  return (
    <div className="flex flex-col h-screen bg-sky-50/30 overflow-hidden text-slate-800 relative">
      {/* Fixed Ocean Background with Low Opacity */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        <img
          src="/ocean_bg.jpg"
          alt=""
          className="w-full h-full object-cover opacity-[0.09] filter contrast-125 saturate-110"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-sky-50/30 via-transparent to-sky-100/30" />
      </div>

      {/* Top Header */}
      <header className="bg-white/85 backdrop-blur-md border-b border-sky-100 z-40 shrink-0 relative shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              className="p-1.5 md:hidden hover:bg-sky-100/70 rounded-xl text-slate-600 transition-colors cursor-pointer"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="menu"
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <NavLink to="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-600 to-ocean-500 text-white flex items-center justify-center shadow-xs shadow-sky-600/30 group-hover:scale-105 transition-transform">
                <Waves size={16} className="animate-wave" />
              </div>
              <span className="font-bold text-slate-900 text-[15px] tracking-tight">
                SaagarSathi <span className="text-sky-600 font-semibold">· ORCA</span>
              </span>
            </NavLink>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Custom Language Dropdown */}
            <CustomDropdown
              items={languageDropdownItems}
              value={lang}
              onChange={setLang}
              icon={<Globe size={13} />}
              size="sm"
              menuClassName="w-40"
            />

            {/* Custom Location Dropdown */}
            <CustomDropdown
              items={locationDropdownItems}
              value={location.id}
              onChange={setLocationId}
              icon={<MapPin size={13} />}
              size="sm"
              menuClassName="w-56"
            />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-sky-100 px-4 py-2.5 grid grid-cols-2 gap-2 bg-white/95 backdrop-blur-md shadow-lg">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={() =>
                  `flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium transition-all ${
                    loc.pathname === item.path
                      ? 'bg-sky-100 text-sky-800 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:bg-sky-50'
                  }`
                }
              >
                <item.icon size={16} className={loc.pathname === item.path ? 'text-sky-600' : 'text-slate-400'} />
                {item.label}
              </NavLink>
            ))}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden max-w-6xl w-full mx-auto relative z-10">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex flex-col w-52 shrink-0 border-r border-sky-100/90 bg-white/65 backdrop-blur-md py-4 px-2.5 gap-1">
          {navItems.map((item) => {
            const active = loc.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all ${
                  active
                    ? 'border-l-2 border-sky-600 text-sky-900 bg-sky-100/90 font-semibold shadow-2xs pl-2.5'
                    : 'text-slate-600 hover:bg-sky-50/80 hover:text-slate-900 font-medium'
                }`}
              >
                <item.icon size={16} className={active ? 'text-sky-600' : 'text-slate-400'} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </aside>

        <main className="flex-1 overflow-y-auto relative">{children}</main>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden bg-white/90 backdrop-blur-md border-t border-sky-100 pb-safe z-40 shrink-0 relative">
        <div className="flex">
          {navItems.map((item) => {
            const active = loc.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center py-2 text-xs transition-colors ${
                  active ? 'text-sky-600 font-semibold' : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                <item.icon size={18} />
                <span className="text-[10px] mt-0.5">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
