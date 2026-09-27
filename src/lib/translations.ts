export type LanguageCode = 'en' | 'hi' | 'ta' | 'ml' | 'te' | 'gu' | 'mr' | 'bn' | 'kn';

export interface Translations {
  // Navigation
  dashboard: string;
  dashboardSub: string;
  oceanMap: string;
  oceanMapSub: string;
  askOrca: string;
  askOrcaSub: string;
  research: string;
  researchSub: string;
  location: string;
  language: string;

  // Search Bar
  searchPlaceholder: string;
  listening: string;
  converting: string;
  voiceNotSupported: string;
  voiceListening: string;
  speakClear: string;
  voiceTooltip: string;
  maximize: string;
  pfzScienceNote: string;
  riskWord: string;
  adviceWord: string;
  evidenceTrail: string;

  // Home Page
  weatherWind: string;
  weatherWaves: string;
  oceanSST: string;
  oceanChla: string;
  from: string;
  swell: string;
  upwellingLikely: string;
  upwellingWeak: string;
  fishingOpportunity: string;
  fishingOppSub: string;
  openMap: string;
  navigate: string;
  geofenceWatch: string;
  kmToImbl: string;
  clearBoundary: string;
  insideMpaWarning: string;
  viewImblMap: string;
  liveBulletins: string;
  active: string;
  agentPipeline: string;
  fullEvidence: string;
  whyVerdict: string;
  whyEvidenceSub: string;
  disclaimerText: string;
  respondsInText: string;
  serviceUnreachable: string;
  retry: string;
  dangerPrecedence: string;

  // Map Page
  mapTitle: string;
  standardLayer: string;
  satelliteLayer: string;
  pfzZones: string;
  hazardBuffers: string;
  imblLines: string;
  pfzLikely: string;
  hazardBuffer: string;
  imblBoundary: string;
  yourVessel: string;
  clickZonePrompt: string;
  avoidArea: string;
  pfzScore: string;
  distance: string;
  wave: string;

  // Ask ORCA
  askHeaderTitle: string;
  askHeaderSubtitle: string;
  askWelcome: string;
  listenBtn: string;
  whyRiskScore: string;
  hideWhy: string;
  allChecksNominal: string;
  advisoryDisclaimer: string;
  suggestions: string[];

  // InfoHub
  analyticsTitle: string;
  analyticsSubtitle: string;
  anomalyDetected: string;
  sevenDayTrends: string;
  bothMetrics: string;
  sstOnly: string;
  chlOnly: string;
  dataProvenance: string;
  provenanceSub: string;
  offlineNotice: string;
}

export const TRANSLATIONS: Record<LanguageCode, Translations> = {
  en: {
    dashboard: 'Dashboard',
    dashboardSub: 'Go / No-Go verdict',
    oceanMap: 'Ocean Map',
    oceanMapSub: 'PFZ · IMBL · hazards',
    askOrca: 'Ask ORCA',
    askOrcaSub: 'Conversational advisor',
    research: 'Research',
    researchSub: 'Trends · bulletins · audit',
    location: 'Location',
    language: 'Language',

    searchPlaceholder: 'What would you like to find today?',
    listening: 'Listening… Speak in any language',
    converting: 'Converting speech to text…',
    voiceNotSupported: 'Voice recognition is not supported in this browser.',
    voiceListening: 'Listening…',
    speakClear: 'Could not hear clearly. Please try again.',
    voiceTooltip: 'Voice search — speaks & listens in any language',
    maximize: 'Maximize',
    pfzScienceNote: 'Oceansat-3 OCM/SSTM proxy fused with INCOIS PFZ baseline. PFZ forms on SST fronts + chlorophyll hotspots.',
    riskWord: 'Risk',
    adviceWord: 'Advice',
    evidenceTrail: 'Evidence Trail · Audit Log',

    weatherWind: 'Wind',
    weatherWaves: 'Waves',
    oceanSST: 'SST',
    oceanChla: 'Chl-a',
    from: 'from',
    swell: 'swell',
    upwellingLikely: 'upwelling likely',
    upwellingWeak: 'upwelling weak',
    fishingOpportunity: 'Fishing opportunity (independent of safety)',
    fishingOppSub: 'Potential Fishing Zone',
    openMap: 'Open map',
    navigate: 'Navigate',
    geofenceWatch: 'Geofence watch',
    kmToImbl: 'km to IMBL',
    clearBoundary: 'Clear of boundary buffers.',
    insideMpaWarning: 'Inside Marine Protected Area — fishing restricted.',
    viewImblMap: 'View IMBL + MPA map',
    liveBulletins: 'Live bulletins',
    active: 'active',
    agentPipeline: 'Agent pipeline',
    fullEvidence: 'Full evidence + trends',
    whyVerdict: 'Why this verdict? — explainable evidence',
    whyEvidenceSub: 'Every point cites its official source feed',
    disclaimerText: 'SaagarSathi is a decision-support advisory. Always confirm with official INCOIS and IMD bulletins before sailing.',
    respondsInText: 'Responds in',
    serviceUnreachable: 'Service unreachable',
    retry: 'Retry',
    dangerPrecedence: 'PFZ exists but DANGER takes precedence — do not sail. Safety and opportunity are computed independently.',

    mapTitle: 'Ocean Map',
    standardLayer: 'Standard (OSM)',
    satelliteLayer: 'Satellite (Esri)',
    pfzZones: 'PFZ zones',
    hazardBuffers: 'Hazard / IMBL buffers',
    imblLines: 'IMBL lines + MPAs',
    pfzLikely: 'PFZ (fish likely)',
    hazardBuffer: 'Hazard / IMBL buffer',
    imblBoundary: 'IMBL boundary',
    yourVessel: 'Your vessel',
    clickZonePrompt: 'Click a zone on the map for details',
    avoidArea: 'Avoid this area. IMBL lines are approximate — verify on official charts.',
    pfzScore: 'PFZ score',
    distance: 'Distance',
    wave: 'Wave',

    askHeaderTitle: 'ORCA · SaagarSathi AI',
    askHeaderSubtitle: 'Online · responds in your language',
    askWelcome: 'Namaskaram! I am ORCA · SaagarSathi. Ask about safety, PFZ, IMBL, cyclone, or emergency in any language.',
    listenBtn: 'Listen',
    whyRiskScore: 'Why',
    hideWhy: 'Hide why',
    allChecksNominal: 'All checks nominal — no active hazards.',
    advisoryDisclaimer: 'Advisory only — always confirm with INCOIS/IMD before sailing.',
    suggestions: [
      'Is it safe to fish today?',
      'Where is the nearest PFZ?',
      'How far is the IMBL?',
      'Storm or cyclone warning?',
      'Emergency — what do I do?'
    ],

    analyticsTitle: 'Research & Analytics',
    analyticsSubtitle: 'Environmental baseline, SST + chlorophyll trends, bulletins & audit trail',
    anomalyDetected: 'Anomaly detected',
    sevenDayTrends: '7-day environmental trends',
    bothMetrics: 'SST + Chlorophyll',
    sstOnly: 'Sea Surface Temp',
    chlOnly: 'Chlorophyll-a',
    dataProvenance: 'Data provenance',
    provenanceSub: 'Every verdict is traceable',
    offlineNotice: 'You are offline — showing last synced data. Verdicts may be stale.'
  },

  hi: {
    dashboard: 'डैशबोर्ड',
    dashboardSub: 'सुरक्षा निर्णय (Go / No-Go)',
    oceanMap: 'समुद्री नक्शा',
    oceanMapSub: 'PFZ · IMBL · खतरे',
    askOrca: 'ORCA से पूछें',
    askOrcaSub: 'एआई सलाहकार',
    research: 'अनुसंधान व विश्लेषण',
    researchSub: 'रुझान · बुलेटिन · ऑडिट',
    location: 'स्थान',
    language: 'भाषा',

    searchPlaceholder: 'आज आप क्या खोजना चाहते हैं? (बोलें या लिखें)',
    listening: 'सुन रहे हैं… किसी भी भाषा में बोलें',
    converting: 'बोली को टेक्स्ट में बदला जा रहा है…',
    voiceNotSupported: 'इस ब्राउज़र में आवाज़ पहचान समर्थित नहीं है।',
    voiceListening: 'सुन रहे हैं…',
    speakClear: 'आवाज़ स्पष्ट नहीं सुनाई दी। कृपया पुनः प्रयास करें।',
    voiceTooltip: 'वॉइस सर्च — किसी भी भाषा में बोलें',
    maximize: 'बड़ा करें',
    pfzScienceNote: 'Oceansat-3 OCM/SSTM प्रॉक्सी व INCOIS बेसलाइन। SST फ्रंट व क्लोरोफिल हॉटस्पॉट पर PFZ का निर्माण होता है।',
    riskWord: 'जोखिम',
    adviceWord: 'सलाह',
    evidenceTrail: 'साक्ष्य व ऑडिट ट्रेल',

    weatherWind: 'हवा की गति',
    weatherWaves: 'लहरें',
    oceanSST: 'समुद्री तापमान (SST)',
    oceanChla: 'क्लोरोफिल-ए',
    from: 'दिशा',
    swell: 'स्वेल',
    upwellingLikely: 'अपवेलिंग संभव',
    upwellingWeak: 'अपवेलिंग सामान्य',
    fishingOpportunity: 'मत्स्य पालन अवसर (PFZ)',
    fishingOppSub: 'संभावित मत्स्य क्षेत्र',
    openMap: 'नक्शा खोलें',
    navigate: 'नेविगेट करें',
    geofenceWatch: 'सीमा सुरक्षा (Geofence)',
    kmToImbl: 'किमी IMBL सीमा से',
    clearBoundary: 'अंतर्राष्ट्रीय सीमा से सुरक्षित दूरी पर।',
    insideMpaWarning: 'समुद्री संरक्षित क्षेत्र (MPA) के भीतर — मछली पकड़ना प्रतिबंधित है।',
    viewImblMap: 'IMBL व MPA नक्शा देखें',
    liveBulletins: 'ताज़ा बुलेटिन',
    active: 'सक्रिय',
    agentPipeline: 'एजेंट स्थिति',
    fullEvidence: 'विस्तृत आंकड़े व रुझान',
    whyVerdict: 'यह निर्णय क्यों? — साक्ष्य व कारण',
    whyEvidenceSub: 'प्रत्येक बिंदु आधिकारिक स्रोतों पर आधारित है',
    disclaimerText: 'सागरसाथी एक निर्णय-सहायता प्रणाली है। समुद्र में जाने से पूर्व हमेशा INCOIS और IMD की आधिकारिक बुलेटिन अवश्य देखें।',
    respondsInText: 'जवाब भाषा:',
    serviceUnreachable: 'सर्वर से संपर्क नहीं हो सका',
    retry: 'पुनः प्रयास करें',
    dangerPrecedence: 'PFZ क्षेत्र उपलब्ध है लेकिन ख़तरा (DANGER) सर्वोपरि है — समुद्र में न जाएं।',

    mapTitle: 'समुद्री नक्शा',
    standardLayer: 'मानक नक्शा (OSM)',
    satelliteLayer: 'उपग्रह (Satellite)',
    pfzZones: 'PFZ क्षेत्र',
    hazardBuffers: 'खतरा / IMBL बफ़र',
    imblLines: 'IMBL रेखाएं व संरक्षित क्षेत्र',
    pfzLikely: 'PFZ (मछली क्षेत्र)',
    hazardBuffer: 'खतरा / IMBL क्षेत्र',
    imblBoundary: 'IMBL अंतरराष्ट्रीय सीमा',
    yourVessel: 'आपकी नाव',
    clickZonePrompt: 'विवरण देखने के लिए नक्शे पर किसी क्षेत्र को दबाएं',
    avoidArea: 'इस क्षेत्र से दूर रहें। IMBL सीमा रेखाएं अनुमानित हैं।',
    pfzScore: 'PFZ स्कोर',
    distance: 'दूरी',
    wave: 'लहर',

    askHeaderTitle: 'ORCA · सागरसाथी AI',
    askHeaderSubtitle: 'ऑनलाइन · आपकी भाषा में उत्तर देता है',
    askWelcome: 'नमस्ते! मैं ORCA · सागरसाथी हूँ। सुरक्षा, PFZ, IMBL, तूफ़ान या आपातकाल के बारे में किसी भी भाषा में पूछें।',
    listenBtn: 'सुनें',
    whyRiskScore: 'कारण जानें',
    hideWhy: 'छिपाएं',
    allChecksNominal: 'सभी मानक सामान्य हैं — कोई ख़तरा नहीं।',
    advisoryDisclaimer: 'सलाह केवल संदर्भ हेतु है — नौकायन से पूर्व INCOIS/IMD से पुष्टि करें।',
    suggestions: [
      'क्या आज मछली पकड़ना सुरक्षित है?',
      'निकटतम PFZ क्षेत्र कहाँ है?',
      'IMBL अंतर्राष्ट्रीय सीमा कितनी दूर है?',
      'क्या कोई तूफ़ान या चक्रवात की चेतावनी है?',
      'आपातकाल में क्या करें?'
    ],

    analyticsTitle: 'अनुसंधान व विश्लेषण',
    analyticsSubtitle: 'पर्यावरणीय रुझान, SST व क्लोरोफिल आंकड़े, बुलेटिन व ऑडिट ट्रेल',
    anomalyDetected: 'असामान्यता का पता चला',
    sevenDayTrends: '7-दिवसीय पर्यावरणीय रुझान',
    bothMetrics: 'SST + क्लोरोफिल',
    sstOnly: 'समुद्री तापमान (SST)',
    chlOnly: 'क्लोरोफिल-ए',
    dataProvenance: 'डेटा स्रोत व ऑडिट',
    provenanceSub: 'प्रत्येक निर्णय प्रमाणित है',
    offlineNotice: 'आप ऑफ़लाइन हैं — पुराना सहेजा डेटा दिखाया जा रहा है।'
  },

  ta: {
    dashboard: 'முகப்பு பலகை',
    dashboardSub: 'பாதுகாப்பு முடிவு (Go / No-Go)',
    oceanMap: 'கடல் வரைபடம்',
    oceanMapSub: 'PFZ · IMBL · ஆபத்துகள்',
    askOrca: 'ORCA-விடம் கேளுங்கள்',
    askOrcaSub: 'AI ஆலோசகர்',
    research: 'ஆராய்ச்சி & பகுப்பாய்வு',
    researchSub: 'போக்குகள் · அறிவிப்புகள்',
    location: 'இடம்',
    language: 'மொழி',

    searchPlaceholder: 'இன்று நீங்கள் என்ன தேட விரும்புகிறீர்கள்?',
    listening: 'கேட்கிறது… எந்த மொழியிலும் பேசுங்கள்',
    converting: 'பேச்சு உரையாக மாற்றப்படுகிறது…',
    voiceNotSupported: 'உங்கள் உலாவியில் குரல் அறிதல் ஆதரிக்கப்படவில்லை.',
    voiceListening: 'கேட்கிறது…',
    speakClear: 'தெளிவாக கேட்கவில்லை. மீண்டும் முயற்சிக்கவும்.',
    voiceTooltip: 'குரல் தேடல் — எந்த மொழியிலும் பேசலாம்',
    maximize: 'பெரிதாக்கு',
    pfzScienceNote: 'Oceansat-3 OCM/SSTM பிரதிநிதி INCOIS PFZ அடிப்படையுடன் இணைப்பு. SST முனைகள் + குளோரோபில் பகுதிகளில் PFZ உருவாகிறது.',
    riskWord: 'ஆபத்து',
    adviceWord: 'ஆலோசனை',
    evidenceTrail: 'ஆதாரம் · தணிக்கை பதிவு',

    weatherWind: 'காற்று வேகம்',
    weatherWaves: 'அலைகள்',
    oceanSST: 'கடல் வெப்பநிலை (SST)',
    oceanChla: 'குளோரோபில்-ஏ',
    from: 'திசை',
    swell: 'அலை வீச்சு',
    upwellingLikely: 'அப்வெல்லிங் சாத்தியம்',
    upwellingWeak: 'அப்வெல்லிங் குறைவு',
    fishingOpportunity: 'மீன்பிடி வாய்ப்பு (PFZ)',
    fishingOppSub: 'சாத்தியமான மீன்பிடி மண்டலம்',
    openMap: 'வரைபடத்தை திறக்கவும்',
    navigate: 'வழிகாட்டுதல்',
    geofenceWatch: 'எல்லை கண்காணிப்பு',
    kmToImbl: 'கி.மீ IMBL எல்லை வரை',
    clearBoundary: 'சர்வதேச எல்லையிலிருந்து பாதுகாப்பான தொலைவில் உள்ளது.',
    insideMpaWarning: 'கடல் பாதுகாக்கப்பட்ட பகுதி — மீன்பிடிக்க தடை.',
    viewImblMap: 'IMBL & MPA வரைபடம்',
    liveBulletins: 'நேரலை அறிவிப்புகள்',
    active: 'செயலில்',
    agentPipeline: 'செயலி நிலை',
    fullEvidence: 'முழு ஆதாரங்கள் & போக்குகள்',
    whyVerdict: 'இந்த முடிவின் காரணம் என்ன? — ஆதாரங்கள்',
    whyEvidenceSub: 'ஒவ்வொரு தகவலும் அதிகாரப்பூர்வ மூலங்களை மேற்கோள் காட்டுகிறது',
    disclaimerText: 'சாகர்சாதி ஒரு முடிவு-ஆதரவு ஆலோசனை அமைப்பு. கடலுக்குச் செல்லும் முன் INCOIS மற்றும் IMD அறிவிப்புகளை உறுதிப்படுத்தவும்.',
    respondsInText: 'பதில் மொழி:',
    serviceUnreachable: 'சேவையகத்தை தொடர்பு கொள்ள முடியவில்லை',
    retry: 'மீண்டும் முயற்சி',
    dangerPrecedence: 'PFZ பகுதி உள்ளது ஆனால் ஆபத்து (DANGER) முதன்மையானது — கடலுக்கு செல்ல வேண்டாம்.',

    mapTitle: 'கடல் வரைபடம்',
    standardLayer: 'நிலையான வரைபடம்',
    satelliteLayer: 'செயற்கைக்கோள்',
    pfzZones: 'PFZ பகுதிகள்',
    hazardBuffers: 'ஆபத்து / IMBL பகுதிகள்',
    imblLines: 'IMBL எல்லைகள் & MPA',
    pfzLikely: 'PFZ (மீன் அதிகம்)',
    hazardBuffer: 'ஆபத்து பகுதி',
    imblBoundary: 'IMBL எல்லை',
    yourVessel: 'உங்கள் படகு',
    clickZonePrompt: 'விவரங்களை அறிய வரைபடத்தில் மண்டலத்தை கிளிக் செய்யவும்',
    avoidArea: 'இந்த பகுதியை தவிர்க்கவும். எல்லைகள் தோராயமானவை.',
    pfzScore: 'PFZ மதிப்பீடு',
    distance: 'தூரம்',
    wave: 'அலை',

    askHeaderTitle: 'ORCA · சாகர்சாதி AI',
    askHeaderSubtitle: 'ஆன்லைன் · உங்கள் மொழியில் பதிலளிக்கிறது',
    askWelcome: 'வணக்கம்! நான் ORCA · சாகர்சாதி. பாதுகாப்பு, PFZ, IMBL, புயல் பற்றி எந்த மொழியிலும் கேளுங்கள்.',
    listenBtn: 'கேளுங்கள்',
    whyRiskScore: 'காரணம்',
    hideWhy: 'மறைக்க',
    allChecksNominal: 'அனைத்து சோதனைகளும் பாதுகாப்பானவை.',
    advisoryDisclaimer: 'ஆலோசனை மட்டுமே — கடலுக்குச் செல்லும் முன் அதிகாரப்பூர்வ அறிக்கையை உறுதிப்படுத்தவும்.',
    suggestions: [
      'இன்று மீன்பிடிக்க பாதுகாப்பானதா?',
      'அருகிலுள்ள PFZ எங்கே உள்ளது?',
      'IMBL எல்லை தூரம் எவ்வளவு?',
      'புயல் அல்லது சூறாவளி எச்சரிக்கை உள்ளதா?',
      'அவசர காலத்தில் என்ன செய்ய வேண்டும்?'
    ],

    analyticsTitle: 'ஆராய்ச்சி & பகுப்பாய்வு',
    analyticsSubtitle: 'சுற்றுச்சூழல் போக்குகள், SST & குளோரோபில் தரவு',
    anomalyDetected: 'முரண்பாடு கண்டறியப்பட்டது',
    sevenDayTrends: '7-நாள் சுற்றுச்சூழல் போக்குகள்',
    bothMetrics: 'SST + குளோரோபில்',
    sstOnly: 'கடல் வெப்பநிலை',
    chlOnly: 'குளோரோபில்-ஏ',
    dataProvenance: 'தரவு மூலங்கள்',
    provenanceSub: 'அனைத்து முடிவுகளும் சரிபார்க்கப்பட்டவை',
    offlineNotice: 'நீங்கள் ஆஃப்லைனில் உள்ளீர்கள் — சேமிக்கப்பட்ட தரவு காட்டப்படுகிறது.'
  },

  ml: {
    dashboard: 'ഡാഷ്‌ബോർഡ്',
    dashboardSub: 'സുരക്ഷാ നിർദ്ദേശം (Go / No-Go)',
    oceanMap: 'സമുദ്ര മാപ്പ്',
    oceanMapSub: 'PFZ · IMBL · അപകടങ്ങൾ',
    askOrca: 'ORCA-യോട് ചോദിക്കുക',
    askOrcaSub: 'എഐ ഉപദേശകൻ',
    research: 'ഗവേഷണം & വിശകലനം',
    researchSub: 'ട്രെൻഡുകൾ · ബുള്ളറ്റിനുകൾ',
    location: 'സ്ഥലം',
    language: 'ഭാഷ',

    searchPlaceholder: 'ഇന്ന് നിങ്ങൾക്ക് എന്താണ് അറിയേണ്ടത്?',
    listening: 'കേൾക്കുന്നു… ഏത് ഭാഷയിലും സംസാരിക്കാം',
    converting: 'സംസാരം വാചകമാക്കുന്നു…',
    voiceNotSupported: 'നിങ്ങളുടെ ബ്രൗസറിൽ വോയ്‌സ് റെക്കഗ്നിഷൻ പിന്തുണയ്ക്കുന്നില്ല.',
    voiceListening: 'കേൾക്കുന്നു…',
    speakClear: 'വ്യക്തമായി കേട്ടില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക.',
    voiceTooltip: 'വോയ്‌സ് തിരയൽ — ഏത് ഭാഷയിലും സംസാരിക്കാം',
    maximize: 'വലുതാക്കുക',
    pfzScienceNote: 'Oceansat-3 OCM/SSTM പ്രോക്സി INCOIS PFZ അടിസ്ഥാനവുമായി ചേർന്ന്. SST ഫ്രണ്ടുകളിലും ക്ലോറോഫിൽ ഹോട്ട്സ്പോട്ടുകളിലും PFZ രൂപപ്പെടുന്നു.',
    riskWord: 'അപകടസാധ്യത',
    adviceWord: 'നിർദ്ദേശം',
    evidenceTrail: 'തെളിവ് ശേഖരം · ഓഡിറ്റ്',

    weatherWind: 'കാറ്റ്',
    weatherWaves: 'തിരമാലകൾ',
    oceanSST: 'സമുദ്ര താപനില (SST)',
    oceanChla: 'ക്ലോറോഫിൽ-എ',
    from: 'ദിശ',
    swell: 'സ്വെൽ',
    upwellingLikely: 'അപ്‌വെല്ലിംഗ് സാധ്യത',
    upwellingWeak: 'അപ്‌വെല്ലിംഗ് കുറവ്',
    fishingOpportunity: 'മത്സ്യബന്ധന അവസരം (PFZ)',
    fishingOppSub: 'സാധ്യതാ മത്സ്യ മേഖല',
    openMap: 'മാപ്പ് തുറക്കുക',
    navigate: 'നാവിഗേറ്റ്',
    geofenceWatch: 'അതിർത്തി സുരക്ഷ (Geofence)',
    kmToImbl: 'കി.മീ IMBL അതിർത്തിയിലേക്ക്',
    clearBoundary: 'അന്താരാഷ്ട്ര അതിർത്തിയിൽ നിന്ന് സുരക്ഷിത അകലത്തിൽ.',
    insideMpaWarning: 'സമുദ്ര സംരക്ഷിത മേഖലയിൽ — മത്സ്യബന്ധനം നിരോധിച്ചിരിക്കുന്നു.',
    viewImblMap: 'IMBL & MPA മാപ്പ് കാണുക',
    liveBulletins: 'തത്സമയ ബുള്ളറ്റിനുകൾ',
    active: 'സജീവം',
    agentPipeline: 'ഏജന്റ് നില',
    fullEvidence: 'പൂർണ്ണ തെളിവുകളും ട്രെൻഡുകളും',
    whyVerdict: 'ഈ തീരുമാനത്തിന്റെ കാരണം? — തെളിവുകൾ',
    whyEvidenceSub: 'ഓരോ വിവരവും ഔദ്യോഗിക സ്രോതസ്സുകളെ അടിസ്ഥാനമാക്കിയുള്ളതാണ്',
    disclaimerText: 'സാഗർസാഥി ഒരു തീരുമാന-പിന്തുണ സംവിധാനമാണ്. കടലിൽ പോകുന്നതിന് മുൻപ് INCOIS, IMD ബുള്ളറ്റിനുകൾ ഉറപ്പാക്കുക.',
    respondsInText: 'മറുപടി ഭാഷ:',
    serviceUnreachable: 'സെർവറുമായി ബന്ധപ്പെടാൻ കഴിഞ്ഞില്ല',
    retry: 'വീണ്ടും ശ്രമിക്കുക',
    dangerPrecedence: 'PFZ ലഭ്യമാണ് എന്നാൽ അപകടം (DANGER) നിലനിൽക്കുന്നു — കടലിൽ പോകരുത്.',

    mapTitle: 'സമുദ്ര മാപ്പ്',
    standardLayer: 'സ്റ്റാൻഡേർഡ് മാപ്പ്',
    satelliteLayer: 'ഉപഗ്രഹം (Satellite)',
    pfzZones: 'PFZ മേഖലകൾ',
    hazardBuffers: 'അപകട മേഖലകൾ',
    imblLines: 'IMBL അതിർത്തികളും MPA-യും',
    pfzLikely: 'PFZ (മത്സ്യസാധ്യത)',
    hazardBuffer: 'അപകട മേഖല',
    imblBoundary: 'IMBL അതിർത്തി',
    yourVessel: 'നിങ്ങളുടെ ബോട്ട്',
    clickZonePrompt: 'വിവരങ്ങൾ അറിയാൻ മാപ്പിലെ സോൺ ക്ലിക്ക് ചെയ്യുക',
    avoidArea: 'ഈ പ്രദേശം ഒഴിവാക്കുക. അതിർത്തികൾ ഏകദേശമാണ്.',
    pfzScore: 'PFZ സ്കോർ',
    distance: 'ദൂരം',
    wave: 'തിരമാല',

    askHeaderTitle: 'ORCA · സാഗർസാഥി AI',
    askHeaderSubtitle: 'ഓൺലൈൻ · നിങ്ങളുടെ ഭാഷയിൽ പ്രതികരിക്കുന്നു',
    askWelcome: 'നമസ്കാരം! ഞാൻ ORCA · സാഗർസാഥിയാണ്. സുരക്ഷ, PFZ, IMBL, ചുഴലിക്കാറ്റ് എന്നിവയെക്കുറിച്ച് ഏത് ഭാഷയിലും ചോദിക്കാം.',
    listenBtn: 'കേൾക്കുക',
    whyRiskScore: 'കാരണം',
    hideWhy: 'മറയ്ക്കുക',
    allChecksNominal: 'എല്ലാ സുരക്ഷാ പരിശോധനകളും തൃപ്തികരമാണ്.',
    advisoryDisclaimer: 'ഉപദേശം മാത്രം — കടലിൽ പോകുന്നതിന് മുൻപ് INCOIS/IMD വിവരങ്ങൾ സ്ഥിരീകരിക്കുക.',
    suggestions: [
      'ഇന്ന് കടലിൽ പോകുന്നത് സുരക്ഷിതമാണോ?',
      'ഏറ്റവും അടുത്തുള്ള PFZ എവിടെയാണ്?',
      'IMBL അതിർത്തിയിലേക്ക് എത്ര ദൂരമുണ്ട്?',
      'ചുഴലിക്കാറ്റ് മുന്നറിയിപ്പ് ഉണ്ടോ?',
      'അടിയന്തിര ഘട്ടത്തിൽ എന്ത് ചെയ്യണം?'
    ],

    analyticsTitle: 'ഗവേഷണം & വിശകലനം',
    analyticsSubtitle: 'പരിസ്ഥിതി ട്രെൻഡുകൾ, SST & ക്ലോറോഫിൽ ഡാറ്റ',
    anomalyDetected: 'വ്യതിയാനം കണ്ടെത്തി',
    sevenDayTrends: '7-ദിവസത്തെ പാരിസ്ഥിതിക ട്രെൻഡുകൾ',
    bothMetrics: 'SST + ക്ലോറോഫിൽ',
    sstOnly: 'സമുദ്ര താപനില',
    chlOnly: 'ക്ലോറോഫിൽ-എ',
    dataProvenance: 'ഡാറ്റ ഉറവിടങ്ങൾ',
    provenanceSub: 'എല്ലാ തീരുമാനങ്ങളും പരിശോധിച്ചുറപ്പിച്ചതാണ്',
    offlineNotice: 'നിങ്ങൾ ഓഫ്‌ലൈനിലാണ് — സംരക്ഷിച്ച ഡാറ്റ കാണിക്കുന്നു.'
  },

  te: {
    dashboard: 'డాష్‌బోర్డ్',
    dashboardSub: 'భద్రతా నిర్ణయం (Go / No-Go)',
    oceanMap: 'సముద్ర పటం',
    oceanMapSub: 'PFZ · IMBL · ప్రమాదాలు',
    askOrca: 'ORCA ని అడగండి',
    askOrcaSub: 'AI సలహాదారు',
    research: 'పరిశోధన & విశ్లేషణ',
    researchSub: 'ధోరణులు · బులెటిన్లు',
    location: 'ప్రాంతం',
    language: 'భాష',

    searchPlaceholder: 'ఈరోజు మీరు ఏమి శోధించాలనుకుంటున్నారు?',
    listening: 'వింటున్నాము… ఏ భాషలోనైనా మాట్లాడండి',
    converting: 'మాటను వచనంగా మారుస్తున్నాము…',
    voiceNotSupported: 'ఈ బ్రౌజర్‌లో వాయిస్ గుర్తింపు మద్దతు లేదు.',
    voiceListening: 'వింటున్నాము…',
    speakClear: 'స్పష్టంగా వినిపించలేదు. దయచేసి మళ్ళీ ప్రయత్నించండి.',
    voiceTooltip: 'వాయిస్ సెర్చ్ — ఏ భాషలోనైనా మాట్లాడండి',
    maximize: 'పెద్దది చేయి',
    pfzScienceNote: 'Oceansat-3 OCM/SSTM ప్రాక్సీ INCOIS PFZ బేస్‌లైన్‌తో కలిపి. SST ఫ్రంట్లు + క్లోరోఫిల్ హాట్‌స్పాట్లపై PFZ ఏర్పడుతుంది.',
    riskWord: 'ప్రమాదం',
    adviceWord: 'సలహా',
    evidenceTrail: 'ఆధారాల ట్రయల్ · ఆడిట్',

    weatherWind: 'గాలి వేగం',
    weatherWaves: 'అలలు',
    oceanSST: 'సముద్ర ఉష్ణోగ్రత (SST)',
    oceanChla: 'క్లోరోఫిల్-ఎ',
    from: 'నుండి',
    swell: 'స్వెల్',
    upwellingLikely: 'అప్‌వెల్లింగ్ అవకాశం',
    upwellingWeak: 'అప్‌వెల్లింగ్ తక్కువ',
    fishingOpportunity: 'చేపల వేట అవకాశం (PFZ)',
    fishingOppSub: 'సంభావ్య మత్స్య ప్రాంతం',
    openMap: 'పటాన్ని తెరవండి',
    navigate: 'నావిగేట్ చేయండి',
    geofenceWatch: 'సరిహద్దు భద్రత (Geofence)',
    kmToImbl: 'కి.మీ IMBL సరిహద్దుకు',
    clearBoundary: 'అంతర్జాతీయ సరిహద్దు నుండి సురక్షిత దూరంలో ఉంది.',
    insideMpaWarning: 'సముద్ర రక్షిత ప్రాంతం — చేపల వేట నిషేధించబడింది.',
    viewImblMap: 'IMBL & MPA పటాన్ని చూడండి',
    liveBulletins: 'తాజా బులెటిన్లు',
    active: 'యాక్టివ్',
    agentPipeline: 'సిస్టమ్ స్థితి',
    fullEvidence: 'పూర్తి ఆధారాలు & ధోరణులు',
    whyVerdict: 'ఈ నిర్ణయానికి కారణం ఏమిటి? — ఆధారాలు',
    whyEvidenceSub: 'ప్రతి సమాచారం అధికారిక మూలాల ఆధారంగా ఉంటుంది',
    disclaimerText: 'సాగర్‌సాథి ఒక నిర్ణయ మద్దతు వ్యవస్థ. సముద్రంలోకి వెళ్లే ముందు INCOIS మరియు IMD బులెటిన్లను ధృవీకరించుకోండి.',
    respondsInText: 'స్పందన భాష:',
    serviceUnreachable: 'సర్వర్‌ను చేరుకోలేకపోయాము',
    retry: 'మళ్ళీ ప్రయత్నించండి',
    dangerPrecedence: 'PFZ ప్రాంతం ఉన్నప్పటికీ ప్రమాదం (DANGER) ఉంది — వేటకు వెళ్ళవద్దు.',

    mapTitle: 'సముద్ర పటం',
    standardLayer: 'ప్రామాణిక పటం',
    satelliteLayer: 'ఉపగ్రహం (Satellite)',
    pfzZones: 'PFZ ప్రాంతాలు',
    hazardBuffers: 'ప్రమాద / IMBL ప్రాంతాలు',
    imblLines: 'IMBL సరిహద్దులు & MPA',
    pfzLikely: 'PFZ (చేపలు ఎక్కువగా ఉండే ప్రాంతం)',
    hazardBuffer: 'ప్రమాద ప్రాంతం',
    imblBoundary: 'IMBL సరిహద్దు',
    yourVessel: 'మీ పడవ',
    clickZonePrompt: 'వివరాల కోసం మ్యాప్‌లోని ప్రాంతాన్ని క్లిక్ చేయండి',
    avoidArea: 'ఈ ప్రాంతాన్ని నివారించండి. సరిహద్దులు సుమారుగా ఉన్నాయి.',
    pfzScore: 'PFZ స్కోరు',
    distance: 'దూరం',
    wave: 'అల',

    askHeaderTitle: 'ORCA · సాగర్‌సాథి AI',
    askHeaderSubtitle: 'ఆన్‌లైన్ · మీ భాషలో సమాధానం ఇస్తుంది',
    askWelcome: 'నమస్కారం! నేను ORCA · సాగర్‌సాథిని. భద్రత, PFZ, IMBL, తుఫాను గురించి ఏ భాషలోనైనా అడగండి.',
    listenBtn: 'వినండి',
    whyRiskScore: 'కారణం',
    hideWhy: 'దాచు',
    allChecksNominal: 'అన్ని తనిఖీలు సాధారణంగా ఉన్నాయి — ప్రమాదం లేదు.',
    advisoryDisclaimer: 'సలహా మాత్రమే — వేటకు వెళ్లే ముందు INCOIS/IMD నివేదికలను ధృవీకరించుకోండి.',
    suggestions: [
      'ఈరోజు చేపల వేటకు వెళ్లడం సురక్షితమేనా?',
      'సమీపంలోని PFZ ఎక్కడ ఉంది?',
      'IMBL సరిహద్దు ఎంత దూరంలో ఉంది?',
      'తుఫాను హెచ్చరిక ఉందా?',
      'అత్యవసర సమయంలో ఏమి చేయాలి?'
    ],

    analyticsTitle: 'పరిశోధన & విశ్లేషణ',
    analyticsSubtitle: 'పర్యావరణ ధోరణులు, SST & క్లోరోఫిల్ గణాంకాలు',
    anomalyDetected: 'అసాధారణత గుర్తించబడింది',
    sevenDayTrends: '7-రోజుల పర్యావరణ ధోరణులు',
    bothMetrics: 'SST + క్లోరోఫిల్',
    sstOnly: 'సముద్ర ఉష్ణోగ్రత',
    chlOnly: 'క్లోరోఫిల్-ఎ',
    dataProvenance: 'డేటా మూలాలు',
    provenanceSub: 'ప్రతి నిర్ణయం ధృవీకరించబడింది',
    offlineNotice: 'మీరు ఆఫ్‌లైన్‌లో ఉన్నారు — మునుపటి డేటా చూపబడుతోంది.'
  },

  gu: {
    dashboard: 'ડેશબોર્ડ',
    dashboardSub: 'સુરક્ષા નિર્ણય (Go / No-Go)',
    oceanMap: 'દરિયાઈ નકશો',
    oceanMapSub: 'PFZ · IMBL · જોખમો',
    askOrca: 'ORCA ને પૂછો',
    askOrcaSub: 'AI સલાહકાર',
    research: 'સંશોધન અને વિશ્લેષણ',
    researchSub: 'વલણો · બુલેટિન',
    location: 'સ્થળ',
    language: 'ભાષા',

    searchPlaceholder: 'આજે તમે શું શોધવા માંગો છો?',
    listening: 'સાંભળી રહ્યા છીએ… કોઈપણ ભાષામાં બોલો',
    converting: 'વાણીને ટેક્સ્ટમાં ફેરવી રહ્યા છીએ…',
    voiceNotSupported: 'આ બ્રાઉઝરમાં વૉઇસ ઓળખ સમર્થિત નથી.',
    voiceListening: 'સાંભળી રહ્યા છીએ…',
    speakClear: 'સ્પષ્ટ અવાજ સંભળાયો નથી. કૃપા કરીને ફરી પ્રયાસ કરો.',
    voiceTooltip: 'વૉઇસ શોધ — કોઈપણ ભાષામાં બોલો',
    maximize: 'મોટું કરો',
    pfzScienceNote: 'Oceansat-3 OCM/SSTM પ્રોક્સી INCOIS PFZ બેઝલાઇન સાથે. SST ફ્રન્ટ + ક્લોરોફિલ હોટસ્પોટ પર PFZ બને છે.',
    riskWord: 'જોખમ',
    adviceWord: 'સલાહ',
    evidenceTrail: 'પુરાવા ટ્રેઇલ · ઓડિટ',

    weatherWind: 'પવનની ગતિ',
    weatherWaves: 'મોજાં',
    oceanSST: 'દરિયાઈ તાપમાન (SST)',
    oceanChla: 'ક્લોરોફિલ-એ',
    from: 'તરફથી',
    swell: 'સ્વેલ',
    upwellingLikely: 'અપવેલિંગ શક્ય',
    upwellingWeak: 'અપવેલિંગ ઓછું',
    fishingOpportunity: 'માછીમારીની તક (PFZ)',
    fishingOppSub: 'સંભવિત મત્સ્ય ઝોન',
    openMap: 'નકશો ખોલો',
    navigate: 'નેવિગેટ',
    geofenceWatch: 'સીમા સુરક્ષા (Geofence)',
    kmToImbl: 'કિમી IMBL સીમાથી',
    clearBoundary: 'આંતરરાષ્ટ્રીય સરહદથી સુરક્ષિત અંતરે.',
    insideMpaWarning: 'દરિયાઈ સંરક્ષિત વિસ્તાર — માછીમારી પર પ્રતિબંધ છે.',
    viewImblMap: 'IMBL અને MPA નકશો જુઓ',
    liveBulletins: 'લાઈવ બુલેટિન',
    active: 'સક્રિય',
    agentPipeline: 'સિસ્ટમ સ્થિતિ',
    fullEvidence: 'સંપૂર્ણ પુરાવા અને વલણો',
    whyVerdict: 'આ નિર્ણય કેમ? — પુરાવા',
    whyEvidenceSub: 'દરેક માહિતી સત્તાવાર સ્ત્રોતો પર આધારિત છે',
    disclaimerText: 'સાગરસાથી એક નિર્ણય-સહાયક સલાહકાર છે. દરિયામાં જતા પહેલા હંમેશા INCOIS અને IMD ના બુલેટિનની પુષ્ટિ કરો.',
    respondsInText: 'જવાબ ભાષા:',
    serviceUnreachable: 'સર્વર સાથે જોડાણ થઈ શક્યું નથી',
    retry: 'ફરી પ્રયાસ કરો',
    dangerPrecedence: 'PFZ ઉપલબ્ધ છે પરંતુ જોખમ (DANGER) મુખ્ય છે — દરિયામાં ન જાઓ.',

    mapTitle: 'દરિયાઈ નકશો',
    standardLayer: 'સામાન્ય નકશો',
    satelliteLayer: 'સેટેલાઇટ (Satellite)',
    pfzZones: 'PFZ ઝોન',
    hazardBuffers: 'જોખમી / IMBL ઝોન',
    imblLines: 'IMBL સીમાઓ અને MPA',
    pfzLikely: 'PFZ (માછલી મળવાની શક્યતા)',
    hazardBuffer: 'જોખમી વિસ્તાર',
    imblBoundary: 'IMBL સીમા',
    yourVessel: 'તમારી બોટ',
    clickZonePrompt: 'વિગત જાણવા માટે નકશા પર ક્લિક કરો',
    avoidArea: 'આ વિસ્તાર ટાળો. સીમાઓ અંદાજિત છે.',
    pfzScore: 'PFZ સ્કોર',
    distance: 'અંતર',
    wave: 'મોજું',

    askHeaderTitle: 'ORCA · સાગરસાથી AI',
    askHeaderSubtitle: 'ઓનલાઈન · તમારી ભાષામાં જવાબ આપે છે',
    askWelcome: 'નમસ્તે! હું ORCA · સાગરસાથી છું. સુરક્ષા, PFZ, IMBL, વાવાઝોડું વિશે કોઈપણ ભાષામાં પૂછો.',
    listenBtn: 'સાંભળો',
    whyRiskScore: 'કારણ',
    hideWhy: 'છુપાવો',
    allChecksNominal: 'બધી તપાસ સામાન્ય છે — કોઈ જોખમ નથી.',
    advisoryDisclaimer: 'માત્ર સલાહ માટે — દરિયામાં જતા પહેલા INCOIS/IMD સાથે પુષ્ટિ કરો.',
    suggestions: [
      'શું આજે માછીમારી કરવી સુરક્ષિત છે?',
      'નજીકનું PFZ ક્યાં છે?',
      'IMBL સરહદ કેટલી દૂર છે?',
      'શું વાવાઝોડાની ચેતવણી છે?',
      'કટોકટીમાં શું કરવું?'
    ],

    analyticsTitle: 'સંશોધન અને વિશ્લેષણ',
    analyticsSubtitle: 'પર્યાવરણીય વલણો, SST અને ક્લોરોફિલ ડેટા',
    anomalyDetected: 'અસામાન્યતા મળી',
    sevenDayTrends: '7-દિવસીય પર્યાવરણીય વલણો',
    bothMetrics: 'SST + ક્લોરોફિલ',
    sstOnly: 'દરિયાઈ તાપમાન',
    chlOnly: 'ક્લોરોફિલ-એ',
    dataProvenance: 'ડેટા સ્ત્રોત',
    provenanceSub: 'દરેક નિર્ણય પ્રમાણિત છે',
    offlineNotice: 'તમે ઑફલાઇન છો — જૂનો ડેટા દર્શાવવામાં આવી રહ્યો છે.'
  },

  mr: {
    dashboard: 'डॅशबोर्ड',
    dashboardSub: 'सुरक्षा निर्णय (Go / No-Go)',
    oceanMap: 'सागरी नकाशा',
    oceanMapSub: 'PFZ · IMBL · धोके',
    askOrca: 'ORCA ला विचारा',
    askOrcaSub: 'AI सल्लागार',
    research: 'संशोधन व विश्लेषण',
    researchSub: 'कल · बुलेटिन · ऑडिट',
    location: 'स्थान',
    language: 'भाषा',

    searchPlaceholder: 'आज तुम्हाला काय शोधायचे आहे?',
    listening: 'ऐकत आहे… कोणत्याही भाषेत बोला',
    converting: 'बोलीचे मजकुरात रूपांतर…',
    voiceNotSupported: 'या ब्राउझरमध्ये आवाज ओळख समर्थित नाही.',
    voiceListening: 'ऐकत आहे…',
    speakClear: 'आवाज स्पष्ट ऐकू आला नाही. कृपया पुन्हा प्रयत्न करा.',
    voiceTooltip: 'व्हॉइस सर्च — कोणत्याही भाषेत बोला',
    maximize: 'मोठे करा',
    pfzScienceNote: 'Oceansat-3 OCM/SSTM प्रॉक्सी व INCOIS बेसलाइन. SST फ्रंट व क्लोरोफिल हॉटस्पॉटवर PFZ तयार होते.',
    riskWord: 'धोका',
    adviceWord: 'सल्ला',
    evidenceTrail: 'पुरावा · ऑडिट नोंद',

    weatherWind: 'वाऱ्याचा वेग',
    weatherWaves: 'लाटा',
    oceanSST: 'सागरी तापमान (SST)',
    oceanChla: 'क्लोरोफिल-ए',
    from: 'कडून',
    swell: 'स्वेल',
    upwellingLikely: 'अपवेलिंग शक्य',
    upwellingWeak: 'अपवेलिंग कमी',
    fishingOpportunity: 'मासेमारीची संधी (PFZ)',
    fishingOppSub: 'संभाव्य मत्स्य क्षेत्र',
    openMap: 'नकाशा उघडा',
    navigate: 'नेव्हिगेट करा',
    geofenceWatch: 'सीमा सुरक्षा (Geofence)',
    kmToImbl: 'किमी IMBL सीमेपर्यंत',
    clearBoundary: 'आंतरराष्ट्रीय सीमेपासून सुरक्षित अंतरावर.',
    insideMpaWarning: 'सागरी संरक्षित क्षेत्र — मासेमारीस मनाई आहे.',
    viewImblMap: 'IMBL व MPA नकाशा पहा',
    liveBulletins: 'थेट बुलेटिन',
    active: 'सक्रिय',
    agentPipeline: 'प्रणाली स्थिती',
    fullEvidence: 'संपूर्ण पुरावे व कल',
    whyVerdict: 'हा निर्णय का? — पुरावे',
    whyEvidenceSub: 'प्रत्येक मुद्दा अधिकृत स्रोतांवर आधारित आहे',
    disclaimerText: 'सागरसाथी ही एक निर्णय-सहाय्य प्रणाली आहे. समुद्रात जाण्यापूर्वी नेहमी INCOIS आणि IMD च्या अधिकृत बुलेटिनची पुष्टी करा.',
    respondsInText: 'प्रतिसाद भाषा:',
    serviceUnreachable: 'सर्व्हरशी संपर्क होऊ शकला नाही',
    retry: 'पुन्हा प्रयत्न करा',
    dangerPrecedence: 'PFZ उपलब्ध आहे परंतु धोका (DANGER) अधिक महत्त्वाचा आहे — समुद्रात जाऊ नका.',

    mapTitle: 'सागरी नकाशा',
    standardLayer: 'मानक नकाशा',
    satelliteLayer: 'उपग्रह (Satellite)',
    pfzZones: 'PFZ क्षेत्रे',
    hazardBuffers: 'धोका / IMBL क्षेत्र',
    imblLines: 'IMBL सीमा व संरक्षित क्षेत्र',
    pfzLikely: 'PFZ (मासे मिळण्याची शक्यता)',
    hazardBuffer: 'धोका क्षेत्र',
    imblBoundary: 'IMBL सीमा',
    yourVessel: 'तुमची बोट',
    clickZonePrompt: 'तपशीलासाठी नकाशावरील क्षेत्रावर क्लिक करा',
    avoidArea: 'हे क्षेत्र टाळा. सीमा अंदाजे आहेत.',
    pfzScore: 'PFZ गुण',
    distance: 'अंतर',
    wave: 'लाट',

    askHeaderTitle: 'ORCA · सागरसाथी AI',
    askHeaderSubtitle: 'ऑनलाइन · तुमच्या भाषेत उत्तर देते',
    askWelcome: 'नमस्कार! मी ORCA · सागरसाथी आहे. सुरक्षा, PFZ, IMBL, वादळाबद्दल कोणत्याही भाषेत विचारा.',
    listenBtn: 'ऐका',
    whyRiskScore: 'कारण',
    hideWhy: 'लपवा',
    allChecksNominal: 'सर्व तपासण्या सामान्य आहेत — कोणताही धोका नाही.',
    advisoryDisclaimer: 'केवळ मार्गदर्शनासाठी — समुद्रात जाण्यापूर्वी INCOIS/IMD शी खात्री करा.',
    suggestions: [
      'आज मासेमारी करणे सुरक्षित आहे का?',
      'जवळचे PFZ कुठे आहे?',
      'IMBL आंतरराष्ट्रीय सीमा किती दूर आहे?',
      'वादळाचा इशारा आहे का?',
      'आणीबाणीच्या वेळी काय करावे?'
    ],

    analyticsTitle: 'संशोधन व विश्लेषण',
    analyticsSubtitle: 'पर्यावरणीय कल, SST व क्लोरोफिल आकडेवारी',
    anomalyDetected: 'विसंगती आढळली',
    sevenDayTrends: '7-दिवसीय पर्यावरणीय कल',
    bothMetrics: 'SST + क्लोरोफिल',
    sstOnly: 'सागरी तापमान',
    chlOnly: 'क्लोरोफिल-ए',
    dataProvenance: 'डेटा स्रोत',
    provenanceSub: 'प्रत्येक निर्णय प्रमाणित आहे',
    offlineNotice: 'तुम्ही ऑफलाइन आहात — जुना डेटा दाखवला जात आहे.'
  },

  bn: {
    dashboard: 'ড্যাশবোর্ড',
    dashboardSub: 'নিরাপত্তা সিদ্ধান্ত (Go / No-Go)',
    oceanMap: 'সমুদ্র মানচিত্র',
    oceanMapSub: 'PFZ · IMBL · বিপদ',
    askOrca: 'ORCA কে জিজ্ঞাসা করুন',
    askOrcaSub: 'এআই উপদেষ্টা',
    research: 'গবেষণা ও বিশ্লেষণ',
    researchSub: 'প্রবণতা · বুলেটিন',
    location: 'অবস্থান',
    language: 'ভাষা',

    searchPlaceholder: 'আজ আপনি কি খুঁজতে চান?',
    listening: 'শুনছি… যে কোনো ভাষায় বলুন',
    converting: 'কথা টেক্সটে রূপান্তর করা হচ্ছে…',
    voiceNotSupported: 'এই ব্রাউজারে ভয়েস সনাক্তকরণ সমর্থিত নয়।',
    voiceListening: 'শুনছি…',
    speakClear: 'স্পষ্টভাবে শোনা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।',
    voiceTooltip: 'ভয়েস অনুসন্ধান — যেকোনো ভাষায় বলুন',
    maximize: 'বড় করুন',
    pfzScienceNote: 'Oceansat-3 OCM/SSTM প্রক্সি INCOIS PFZ বেসলাইনের সাথে। SST ফ্রন্ট + ক্লোরোফিল হটস্পটে PFZ গঠিত হয়।',
    riskWord: 'ঝুঁকি',
    adviceWord: 'পরামর্শ',
    evidenceTrail: 'প্রমাণ ট্রেইল · অডিট',

    weatherWind: 'বাতাসের গতি',
    weatherWaves: 'ঢেউ',
    oceanSST: 'সমুদ্রের তাপমাত্রা (SST)',
    oceanChla: 'ক্লোরোফিল-এ',
    from: 'থেকে',
    swell: 'সোয়েল',
    upwellingLikely: 'আপওয়েলিং সম্ভাব্য',
    upwellingWeak: 'আপওয়েলিং কম',
    fishingOpportunity: 'মৎস্য শিকারের সুযোগ (PFZ)',
    fishingOppSub: 'সম্ভাব্য মাছ ধরার অঞ্চল',
    openMap: 'মানচিত্র খুলুন',
    navigate: 'নেভিগেট',
    geofenceWatch: 'সীমানা নজরদারি',
    kmToImbl: 'কিমি IMBL সীমানা পর্যন্ত',
    clearBoundary: 'আন্তর্জাতিক সীমানা থেকে নিরাপদ দূরত্বে।',
    insideMpaWarning: 'সামুদ্রিক সংরক্ষিত অঞ্চল — মাছ ধরা নিষিদ্ধ।',
    viewImblMap: 'IMBL ও MPA মানচিত্র দেখুন',
    liveBulletins: 'সরাসরি বুলেটিন',
    active: 'সক্রিয়',
    agentPipeline: 'সিস্টেম স্থিতি',
    fullEvidence: 'সম্পূর্ণ প্রমাণ ও প্রবণতা',
    whyVerdict: 'এই সিদ্ধান্তের কারণ কি? — প্রমাণ',
    whyEvidenceSub: 'প্রতিটি তথ্য সরকারি সূত্রের উপর ভিত্তি করে',
    disclaimerText: 'সাগরসাথী একটি সিদ্ধান্ত-সহায়তা ব্যবস্থা। সমুদ্রে যাওয়ার আগে সর্বদা INCOIS এবং IMD বুলেটিন নিশ্চিত করুন।',
    respondsInText: 'উত্তর ভাষা:',
    serviceUnreachable: 'সার্ভারে সংযোগ করা যায়নি',
    retry: 'আবার চেষ্টা করুন',
    dangerPrecedence: 'PFZ বিদ্যমান কিন্তু বিপদ (DANGER) অগ্রাধিকার পায় — সমুদ্রে যাবেন না।',

    mapTitle: 'সমুদ্র মানচিত্র',
    standardLayer: 'মানক মানচিত্র',
    satelliteLayer: 'স্যাটেলাইট (Satellite)',
    pfzZones: 'PFZ অঞ্চল',
    hazardBuffers: 'বিপদ / IMBL বাফার',
    imblLines: 'IMBL সীমানা ও MPA',
    pfzLikely: 'PFZ (মাছ পাওয়ার সম্ভাবনা)',
    hazardBuffer: 'বিপদ অঞ্চল',
    imblBoundary: 'IMBL সীমানা',
    yourVessel: 'আপনার নৌকা',
    clickZonePrompt: 'বিস্তারিত জানার জন্য মানচিত্রে ক্লিক করুন',
    avoidArea: 'এই এলাকাটি এড়িয়ে চলুন। সীমানা আনুমানিক।',
    pfzScore: 'PFZ স্কোর',
    distance: 'দূরত্ব',
    wave: 'ঢেউ',

    askHeaderTitle: 'ORCA · সাগরসাথী AI',
    askHeaderSubtitle: 'অনলাইন · আপনার ভাষায় উত্তর দেয়',
    askWelcome: 'নমস্কার! আমি ORCA · সাগরসাথী। নিরাপত্তা, PFZ, IMBL, ঘূর্ণিঝড় সম্পর্কে যেকোনো ভাষায় জিজ্ঞাসা করুন।',
    listenBtn: 'শুনুন',
    whyRiskScore: 'কারণ',
    hideWhy: 'লুকান',
    allChecksNominal: 'সকল পরীক্ষা স্বাভাবিক — কোনো বিপদ নেই।',
    advisoryDisclaimer: 'শুধুমাত্র পরামর্শ — সমুদ্রে যাওয়ার আগে INCOIS/IMD নিশ্চিত করুন।',
    suggestions: [
      'আজ মাছ ধরা কি নিরাপদ?',
      'নিকটতম PFZ কোথায়?',
      'IMBL সীমানা কত দূরে?',
      'কোনো ঘূর্ণিঝড়ের সতর্কতা আছে কি?',
      'জরুরী পরিস্থিতিতে কি করতে হবে?'
    ],

    analyticsTitle: 'গবেষণা ও বিশ্লেষণ',
    analyticsSubtitle: 'পরিবেশগত প্রবণতা, SST ও ক্লোরোফিল তথ্য',
    anomalyDetected: 'অস্বাভাবিকতা সনাক্ত হয়েছে',
    sevenDayTrends: '৭ দিনের পরিবেশগত প্রবণতা',
    bothMetrics: 'SST + ক্লোরোফিল',
    sstOnly: 'সমুদ্রের তাপমাত্রা',
    chlOnly: 'ক্লোরোফিল-এ',
    dataProvenance: 'তথ্যের উৎস',
    provenanceSub: 'প্রতিটি সিদ্ধান্ত যাচাইকৃত',
    offlineNotice: 'আপনি অফলাইনে আছেন — সংরক্ষিত তথ্য দেখানো হচ্ছে।'
  },

  kn: {
    dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
    dashboardSub: 'ಸುರಕ್ಷತಾ ನಿರ್ಧಾರ (Go / No-Go)',
    oceanMap: 'ಸಮುದ್ರ ನಕ್ಷೆ',
    oceanMapSub: 'PFZ · IMBL · ಅಪಾಯಗಳು',
    askOrca: 'ORCA ಗೆ ಕೇಳಿ',
    askOrcaSub: 'AI ಸಲಹೆಗಾರ',
    research: 'ಸಂಶೋಧನೆ & ವಿಶ್ಲೇಷಣೆ',
    researchSub: 'ಪ್ರವೃತ್ತಿಗಳು · ಬುಲೆಟಿನ್',
    location: 'ಸ್ಥಳ',
    language: 'ಭಾಷೆ',

    searchPlaceholder: 'ಇಂದು ನೀವು ಏನನ್ನು ಹುಡುಕಲು ಬಯಸುತ್ತೀರಿ?',
    listening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ… ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ',
    converting: 'ಮಾತನ್ನು ಪಠ್ಯಕ್ಕೆ ಪರಿವರ್ತಿಸಲಾಗುತ್ತಿದೆ…',
    voiceNotSupported: 'ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಧ್ವನಿ ಗುರುತಿಸುವಿಕೆ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ.',
    voiceListening: 'ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದ್ದೇವೆ…',
    speakClear: 'ಸ್ಪಷ್ಟವಾಗಿ ಕೇಳಿಸಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
    voiceTooltip: 'ಧ್ವನಿ ಹುಡುಕಾಟ — ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ಮಾತನಾಡಿ',
    maximize: 'ದೊಡ್ಡದಾಗಿ',
    pfzScienceNote: 'Oceansat-3 OCM/SSTM ಪ್ರಾಕ್ಸಿ INCOIS PFZ ಬೇಸ್‌ಲೈನ್‌ನೊಂದಿಗೆ. SST ಫ್ರಂಟ್‌ಗಳು + ಕ್ಲೋರೋಫಿಲ್ ಹಾಟ್‌ಸ್ಪಾಟ್‌ಗಳಲ್ಲಿ PFZ ರೂಪುಗೊಳ್ಳುತ್ತದೆ.',
    riskWord: 'ಅಪಾಯ',
    adviceWord: 'ಸಲಹೆ',
    evidenceTrail: 'ಸಾಕ್ಷ್ಯ ಟ್ರಯಲ್ · ಆಡಿಟ್',

    weatherWind: 'ಗಾಳಿಯ ವೇಗ',
    weatherWaves: 'ಅಲೆಗಳು',
    oceanSST: 'ಸಮುದ್ರ ತಾಪಮಾನ (SST)',
    oceanChla: 'ಕ್ಲೋರೊಫಿಲ್-ಎ',
    from: 'ಇಂದ',
    swell: 'ಸ್ವೆಲ್',
    upwellingLikely: 'ಅಪ್‌ವೆಲ್ಲಿಂಗ್ ಸಾಧ್ಯತೆ',
    upwellingWeak: 'ಅಪ್‌ವೆಲ್ಲಿಂಗ್ ಕಡಿಮೆ',
    fishingOpportunity: 'ಮೀನುಗಾರಿಕೆ ಅವಕಾಶ (PFZ)',
    fishingOppSub: 'ಸಂಭಾವ್ಯ ಮೀನುಗಾರಿಕೆ ವಲಯ',
    openMap: 'ನಕ್ಷೆ ತೆರೆಯಿರಿ',
    navigate: 'ನ್ಯಾವಿಗೇಟ್',
    geofenceWatch: 'ಗಡಿ ಭದ್ರತೆ (Geofence)',
    kmToImbl: 'ಕಿ.ಮೀ IMBL ಗಡಿಗೆ',
    clearBoundary: 'ಅಂತರರಾಷ್ಟ್ರೀಯ ಗಡಿಯಿಂದ ಸುರಕ್ಷಿತ ದೂರದಲ್ಲಿದೆ.',
    insideMpaWarning: 'ಸಮುದ್ರ ಸಂರಕ್ಷಿತ ಪ್ರದೇಶ — ಮೀನುಗಾರಿಕೆ ನಿಷೇಧಿಸಲಾಗಿದೆ.',
    viewImblMap: 'IMBL & MPA ನಕ್ಷೆ ವೀಕ್ಷಿಸಿ',
    liveBulletins: 'ಲೈವ್ ಬುಲೆಟಿನ್‌ಗಳು',
    active: 'ಸಕ್ರಿಯ',
    agentPipeline: 'ವ್ಯವಸ್ಥೆಯ ಸ್ಥಿತಿ',
    fullEvidence: 'ಸಂಪೂರ್ಣ ಪುರಾವೆಗಳು ಮತ್ತು ಪ್ರವೃತ್ತಿಗಳು',
    whyVerdict: 'ಈ ನಿರ್ಧಾರಕ್ಕೆ ಕಾರಣವೇನು? — ಸಾಕ್ಷ್ಯಾಧಾರಗಳು',
    whyEvidenceSub: 'ಪ್ರತಿ ಮಾಹಿತಿಯು ಅಧಿಕೃತ ಮೂಲಗಳನ್ನು ಆಧರಿಸಿದೆ',
    disclaimerText: 'ಸಾಗರಸಾಥಿ ಒಂದು ನಿರ್ಧಾರ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆಯಾಗಿದೆ. ಸಮುದ್ರಕ್ಕೆ ಹೋಗುವ ಮುನ್ನ INCOIS ಮತ್ತು IMD ಬುಲೆಟಿನ್‌ಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.',
    respondsInText: 'ಪ್ರತಿಕ್ರಿಯೆ ಭಾಷೆ:',
    serviceUnreachable: 'ಸರ್ವರ್ ತಲುಪಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ',
    retry: 'ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ',
    dangerPrecedence: 'PFZ ಲಭ್ಯವಿದೆ ಆದರೆ ಅಪಾಯ (DANGER) ಮುಖ್ಯವಾಗಿದೆ — ಸಮುದ್ರಕ್ಕೆ ಹೋಗಬೇಡಿ.',

    mapTitle: 'ಸಮುದ್ರ ನಕ್ಷೆ',
    standardLayer: 'ಸಾಮಾನ್ಯ ನಕ್ಷೆ',
    satelliteLayer: 'ಉಪಗ್ರಹ (Satellite)',
    pfzZones: 'PFZ ವಲಯಗಳು',
    hazardBuffers: 'ಅಪಾಯ / IMBL ವಲಯಗಳು',
    imblLines: 'IMBL ಗಡಿಗಳು & MPA',
    pfzLikely: 'PFZ (ಮೀನು ಸಿಗುವ ಸಾಧ್ಯತೆ)',
    hazardBuffer: 'ಅಪಾಯ ವಲಯ',
    imblBoundary: 'IMBL ಗಡಿ',
    yourVessel: 'ನಿಮ್ಮ ದೋಣಿ',
    clickZonePrompt: 'ವಿವರಗಳಿಗಾಗಿ ನಕ್ಷೆಯಲ್ಲಿ ಕ್ಲಿಕ್ ಮಾಡಿ',
    avoidArea: 'ಈ ಪ್ರದೇಶವನ್ನು ತಪ್ಪಿಸಿ. ಗಡಿಗಳು ಅಂದಾಜು.',
    pfzScore: 'PFZ ಸ್ಕೋರ್',
    distance: 'ದೂರ',
    wave: 'ಅಲೆ',

    askHeaderTitle: 'ORCA · ಸಾಗರಸಾಥಿ AI',
    askHeaderSubtitle: 'ಆನ್‌ಲೈನ್ · ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಉತ್ತರಿಸುತ್ತದೆ',
    askWelcome: 'ನಮಸ್ಕಾರ! ನಾನು ORCA · ಸಾಗರಸಾಥಿ. ಸುರಕ್ಷತೆ, PFZ, IMBL, ಚಂಡಮಾರುತದ ಬಗ್ಗೆ ಯಾವುದೇ ಭಾಷೆಯಲ್ಲಿ ಕೇಳಿ.',
    listenBtn: 'ಆಲಿಸಿ',
    whyRiskScore: 'ಕಾರಣ',
    hideWhy: 'ಮರೆಮಾಡಿ',
    allChecksNominal: 'ಎಲ್ಲಾ ಪರಿಶೀಲನೆಗಳು ಸಾಮಾನ್ಯ — ಯಾವುದೇ ಅಪಾಯವಿಲ್ಲ.',
    advisoryDisclaimer: 'ಸಲಹೆ ಮಾತ್ರ — ಸಮುದ್ರಕ್ಕೆ ಹೋಗುವ ಮುನ್ನ INCOIS/IMD ಪರಿಶೀಲಿಸಿ.',
    suggestions: [
      'ಇಂದು ಮೀನುಗಾರಿಕೆಗೆ ಹೋಗುವುದು ಸುರಕ್ಷಿತವೇ?',
      'ಹತ್ತಿರದ PFZ ಎಲ್ಲಿದೆ?',
      'IMBL ಗಡಿ ಎಷ್ಟು ದೂರದಲ್ಲಿದೆ?',
      'ಚಂಡಮಾರುತದ ಮುನ್ನೆಚ್ಚರಿಕೆ ಇದೆಯೇ?',
      'ತುರ್ತು ಸಂದರ್ಭದಲ್ಲಿ ಏನು ಮಾಡಬೇಕು?'
    ],

    analyticsTitle: 'ಸಂಶೋಧನೆ & ವಿಶ್ಲೇಷಣೆ',
    analyticsSubtitle: 'ಪರಿಸರ ಪ್ರವೃತ್ತಿಗಳು, SST & ಕ್ಲೋರೊಫಿಲ್ ಡೇಟಾ',
    anomalyDetected: 'ವ್ಯತ್ಯಾಸ ಪತ್ತೆಯಾಗಿದೆ',
    sevenDayTrends: '7-ದಿನಗಳ ಪರಿಸರ ಪ್ರವೃತ್ತಿಗಳು',
    bothMetrics: 'SST + ಕ್ಲೋರೊಫಿಲ್',
    sstOnly: 'ಸಮುದ್ರ ತಾಪಮಾನ',
    chlOnly: 'ಕ್ಲೋರೊಫಿಲ್-ಎ',
    dataProvenance: 'ಡೇಟಾ ಮೂಲಗಳು',
    provenanceSub: 'ಪ್ರತಿ ನಿರ್ಧಾರವನ್ನು ಪರಿಶೀಲಿಸಲಾಗಿದೆ',
    offlineNotice: 'ನೀವು ಆಫ್‌ಲೈನ್‌ನಲ್ಲಿದ್ದೀರಿ — ಹಳೆಯ ಡೇಟಾವನ್ನು ತೋರಿಸಲಾಗುತ್ತಿದೆ.'
  }
};

export function getTranslations(lang: string): Translations {
  const code = (lang in TRANSLATIONS ? lang : 'en') as LanguageCode;
  return TRANSLATIONS[code];
}
