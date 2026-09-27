import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { LOCATIONS, LANGUAGES, type LocationOption } from '../lib/locations';
import { getTranslations, type Translations, type LanguageCode } from '../lib/translations';

interface AppState {
  location: LocationOption;
  setLocationId: (id: string) => void;
  lang: string;
  setLang: (c: string) => void;
  langName: string;
  t: Translations;
  basemap: 'standard' | 'satellite';
  setBasemap: (b: 'standard' | 'satellite') => void;
}

const Ctx = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [locId, setLocId] = useState<string>(() => {
    return localStorage.getItem('saagarsathi_loc') || 'kochi';
  });

  const [lang, setLangState] = useState<string>(() => {
    return localStorage.getItem('saagarsathi_lang') || 'en';
  });

  const [basemap, setBasemapState] = useState<'standard' | 'satellite'>(() => {
    return (localStorage.getItem('saagarsathi_basemap') as 'standard' | 'satellite') || 'standard';
  });

  const setLang = (newLang: string) => {
    setLangState(newLang);
    localStorage.setItem('saagarsathi_lang', newLang);
  };

  const setLocationId = (newLocId: string) => {
    setLocId(newLocId);
    localStorage.setItem('saagarsathi_loc', newLocId);
  };

  const setBasemap = (newBasemap: 'standard' | 'satellite') => {
    setBasemapState(newBasemap);
    localStorage.setItem('saagarsathi_basemap', newBasemap);
  };

  // Pre-load speech voices for smooth TTS
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.getVoices();
      const onVoicesChanged = () => {
        window.speechSynthesis.getVoices();
      };
      window.speechSynthesis.addEventListener('voiceschanged', onVoicesChanged);
      return () => window.speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged);
    }
  }, []);

  const value = useMemo<AppState>(() => {
    const rawLocation = LOCATIONS.find((l) => l.id === locId) || LOCATIONS[0];
    const localizedName = rawLocation.names?.[lang] || rawLocation.names?.en || rawLocation.name;
    const location = { ...rawLocation, name: localizedName };
    const langName = LANGUAGES.find((l) => l.code === lang)?.name || 'English';
    const t = getTranslations(lang as LanguageCode);
    return { location, setLocationId, lang, setLang, langName, t, basemap, setBasemap };
  }, [locId, lang, basemap]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useApp() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useApp outside provider');
  return v;
}
