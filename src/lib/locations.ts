export interface LocationOption {
  id: string;
  name: string;
  state: string;
  lat: number;
  lon: number;
  names: Record<string, string>;
}

export const LOCATIONS: LocationOption[] = [
  {
    id: 'kochi',
    name: 'Kochi Coast',
    state: 'Kerala',
    lat: 9.9312,
    lon: 76.2673,
    names: {
      en: 'Kochi Coast',
      hi: 'कोच्चि तट',
      ta: 'கொச்சி கடற்கரை',
      ml: 'കൊച്ചി തീരം',
      te: 'కొచ్చి తీరం',
      gu: 'કોચી તટ',
      mr: 'कोची किनारा',
      bn: 'কোচি উপকূল',
      kn: 'ಕೊಚ್ಚಿ ತೀರ',
    },
  },
  {
    id: 'thiruvananthapuram',
    name: 'Thiruvananthapuram',
    state: 'Kerala',
    lat: 8.5241,
    lon: 76.9366,
    names: {
      en: 'Thiruvananthapuram',
      hi: 'तिरुवनंतपुरम',
      ta: 'திருவனந்தபுரம்',
      ml: 'തിരുവനന്തപുരം',
      te: 'తిరువనంతపురం',
      gu: 'તિરુવનંતપુરમ',
      mr: 'तिरुवनंतपुरम',
      bn: 'তিরুবনন্তপুরম',
      kn: 'ತಿರುವನಂತಪುರಂ',
    },
  },
  {
    id: 'chennai',
    name: 'Chennai',
    state: 'Tamil Nadu',
    lat: 13.0827,
    lon: 80.2707,
    names: {
      en: 'Chennai',
      hi: 'चेन्नई',
      ta: 'சென்னை',
      ml: 'ചെന്നൈ',
      te: 'చెన్నై',
      gu: 'ચેન્નાઈ',
      mr: 'चेन्नई',
      bn: 'চেন্নাই',
      kn: 'ಚೆನ್ನೈ',
    },
  },
  {
    id: 'mannar',
    name: 'Gulf of Mannar',
    state: 'Tamil Nadu',
    lat: 9.0,
    lon: 79.1,
    names: {
      en: 'Gulf of Mannar',
      hi: 'मन्नार की खाड़ी',
      ta: 'மன்னார் வளைகுடா',
      ml: 'മന്നാർ ഉൾക്കടൽ',
      te: 'మన్నార్ గల్ఫ్',
      gu: 'મન્નારનો અખાત',
      mr: 'मन्नारचे आखात',
      bn: 'মান্নার উপসাগর',
      kn: 'ಮನ್ನಾರ್ ಕೊಲ್ಲಿ',
    },
  },
  {
    id: 'palk',
    name: 'Palk Strait',
    state: 'Tamil Nadu',
    lat: 9.7,
    lon: 79.4,
    names: {
      en: 'Palk Strait',
      hi: 'पाक जलडमरूमध्य',
      ta: 'பாக் நீரிணை',
      ml: 'പാക് കടലിടുക്ക്',
      te: 'పాక్ జలసంధి',
      gu: 'પાકની સામુદ્રધુની',
      mr: 'पाल्कची सामुद्रधुनी',
      bn: 'পক প্রণালী',
      kn: 'ಪಾಕ್ ಜಲಸಂಧಿ',
    },
  },
  {
    id: 'mangaluru',
    name: 'Mangaluru',
    state: 'Karnataka',
    lat: 12.9141,
    lon: 74.856,
    names: {
      en: 'Mangaluru',
      hi: 'मंगलुरु',
      ta: 'மங்களூரு',
      ml: 'മംഗലാപുരം',
      te: 'మంగళూరు',
      gu: 'મંગલોર',
      mr: 'मंगळुरू',
      bn: 'ম্যাঙ্গালোর',
      kn: 'ಮಂಗಳೂರು',
    },
  },
  {
    id: 'veraval',
    name: 'Veraval',
    state: 'Gujarat',
    lat: 21.35,
    lon: 70.36,
    names: {
      en: 'Veraval',
      hi: 'वेरावल',
      ta: 'வேராவல்',
      ml: 'വേരാവൽ',
      te: 'వెరావల్',
      gu: 'વેરાવળ',
      mr: 'वेरावळ',
      bn: 'ভেরাভাল',
      kn: 'ವೆರಾವಲ್',
    },
  },
];

export const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिंदी' },
  { code: 'ta', name: 'தமிழ்' },
  { code: 'ml', name: 'മലയാളം' },
  { code: 'te', name: 'తెలుగు' },
  { code: 'gu', name: 'ગુજરાતી' },
  { code: 'mr', name: 'मराठी' },
  { code: 'bn', name: 'বাংলা' },
  { code: 'kn', name: 'ಕನ್ನಡ' },
];

export function alertStyle(level?: string) {
  const l = (level || 'UNKNOWN').toUpperCase();
  if (l === 'SAFE') return { bg: 'bg-emerald-500', soft: 'bg-emerald-50 text-emerald-800 border-emerald-200', text: 'text-emerald-600', dot: 'bg-emerald-500' };
  if (l === 'CAUTION') return { bg: 'bg-amber-500', soft: 'bg-amber-50 text-amber-900 border-amber-200', text: 'text-amber-600', dot: 'bg-amber-500' };
  if (l === 'HIGH RISK') return { bg: 'bg-orange-500', soft: 'bg-orange-50 text-orange-900 border-orange-200', text: 'text-orange-600', dot: 'bg-orange-500' };
  if (l === 'DANGER') return { bg: 'bg-red-500', soft: 'bg-red-800 border-red-200', text: 'text-red-600', dot: 'bg-red-500' };
  return { bg: 'bg-slate-400', soft: 'bg-slate-100 text-slate-700 border-slate-200', text: 'text-slate-500', dot: 'bg-slate-400' };
}
