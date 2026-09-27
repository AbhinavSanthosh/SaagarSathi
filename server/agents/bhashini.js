const { detectSpokenLang } = require('./langDetect');

const supportedLanguages = ['en', 'hi', 'ta', 'ml', 'te', 'gu', 'mr', 'bn', 'kn'];

const LANG_NAMES = {
    en: 'English',
    hi: 'Hindi (हिंदी)',
    ta: 'Tamil (தமிழ்)',
    ml: 'Malayalam (മലയാളം)',
    te: 'Telugu (తెలుగు)',
    gu: 'Gujarati (ગુજરાતી)',
    mr: 'Marathi (मराठी)',
    bn: 'Bengali (বাংলা)',
    kn: 'Kannada (ಕನ್ನಡ)',
};

function detectLanguageFromText(text) {
    // Shared disambiguator: Devanagari -> hi/mr split (was: always 'hi').
    return detectSpokenLang(text);
}

function localizeAdvice(advice, lang) {
    if (!advice) {
        if (lang === 'hi') return 'मानक सुरक्षा सावधानियां बरतें। बंदरगाह के साथ लाइव लोकेशन साझा करें।';
        if (lang === 'ta') return 'வழக்கமான பாதுகாப்பு நடைமுறைகளை பின்பற்றவும். துறைமுகத்துடன் இருப்பிடத்தை பகிரவும்.';
        if (lang === 'ml') return 'സാധാരണ സുരക്ഷാ മുൻകരുതലുകൾ പാലിക്കുക. ലൊക്കേഷൻ പങ്കിടുക.';
        if (lang === 'te') return 'ప్రామాణిక భద్రతా జాగ్రత్తలు పాటించండి. పోర్ట్‌తో లొకేషన్ పంచుకోండి.';
        if (lang === 'gu') return 'માનક સુરક્ષા સાવચેતીઓ રાખો.';
        if (lang === 'mr') return 'योग्य सुरक्षा खबरदारी बाळगा.';
        if (lang === 'bn') return 'স্ট্যান্ডার্ড সতর্কতা অবলম্বন করুন।';
        if (lang === 'kn') return 'ಮುನ್ನೆಚ್ಚರಿಕೆ ಕ್ರಮಗಳನ್ನು ಅನುಸರಿಸಿ.';
        return 'Standard precautions. Share live location with harbour.';
    }

    const a = advice.toLowerCase();
    if (a.includes('do not sail') || a.includes('avoid sail')) {
        if (lang === 'hi') return 'समुद्र में न जाएं — बंदरगाह में ही सुरक्षित रहें!';
        if (lang === 'ta') return 'கடலுக்கு செல்ல வேண்டாம் — துறைமுகத்திலேயே பாதுகாப்பாக இருக்கவும்!';
        if (lang === 'ml') return 'കടലിൽ പോകരുത് — തുറമുഖത്ത് സുരക്ഷിതമായി തുടരുക!';
        if (lang === 'te') return 'సముద్రంలోకి వెళ్లవద్దు — రేవు వద్దనే సురక్షితంగా ఉండండి!';
        if (lang === 'gu') return 'દરિયામાં જવું નહીં — બંદરે સુરક્ષિત રહો!';
        if (lang === 'mr') return 'समुद्रात जाऊ नका — बंदरावरच सुरक्षित राहा!';
        if (lang === 'bn') return 'সমুদ্রে যাবেন না — বন্দরে নিরাপদ থাকুন!';
        if (lang === 'kn') return 'ಸಮುದ್ರಕ್ಕೆ ಹೋಗಬೇಡಿ — ಬಂದರಿನಲ್ಲೇ ಸುರಕ್ಷಿತವಾಗಿರಿ!';
    }
    if (a.includes('standard precautions') || a.includes('favourable')) {
        if (lang === 'hi') return 'सामान्य सावधानियां बरतें। बंदरगाह के साथ अपनी लाइव लोकेशन साझा रखें।';
        if (lang === 'ta') return 'சாதாரண முன்னெச்சரிக்கைகள். துறைமுகத்திற்கு தகவல் தெரிவிக்கவும்.';
        if (lang === 'ml') return 'സാധാരണ മുൻകരുതലുകൾ. ഹാർബറുമായി ബന്ധം പുലർത്തുക.';
        if (lang === 'te') return 'సాధారణ జాగ్రత్తలు. లైవ్ లొకేషన్ పంచుకోండి.';
        if (lang === 'gu') return 'સામાન્ય સાવચેતી રાખો. સ્થાન શેર કરો.';
        if (lang === 'mr') return 'नेहमीची काळजी घ्या. स्थान शेअर करा.';
        if (lang === 'bn') return 'স্বাভাবিক সতর্কতা বজায় রাখুন।';
        if (lang === 'kn') return 'ಸಾಮಾನ್ಯ ಮುನ್ನೆಚ್ಚರಿಕೆ ವಹಿಸಿ.';
    }

    return advice;
}

function localizeReasons(reasons, lang) {
    if (!reasons || reasons.length === 0) {
        if (lang === 'hi') return 'कोई बड़ा ख़तरा नहीं';
        if (lang === 'ta') return 'பெரிய ஆபத்துகள் இல்லை';
        if (lang === 'ml') return 'പ്രത്യേക അപകടങ്ങളൊന്നുമില്ല';
        if (lang === 'te') return 'ప్రధాన ప్రమాదాలు లేవు';
        if (lang === 'gu') return 'કોઈ મોટું જોખમ નથી';
        if (lang === 'mr') return 'कोणताही धोका नाही';
        if (lang === 'bn') return 'কোনো বড় বিপদ নেই';
        if (lang === 'kn') return 'ಯಾವುದೇ ಅಪಾಯವಿಲ್ಲ';
        return 'No major hazards';
    }

    return reasons.map(r => {
        const text = r.toLowerCase();
        if (text.includes('wave')) {
            if (lang === 'hi') return 'लहरों की मध्यम/ऊंची स्थिति';
            if (lang === 'ta') return 'மிதமான/உயர்ந்த அலைகள்';
            if (lang === 'ml') return 'മിതമായ/ഉയർന്ന തിരമാലകൾ';
            if (lang === 'te') return 'మితమైన లేదా ఎత్తైన అలలు';
            if (lang === 'gu') return 'મધ્યમ અથવા ઊંચા મોજાં';
            if (lang === 'mr') return 'मध्यम किंवा उंच लाटा';
            if (lang === 'bn') return 'মাঝারি বা উঁচু ঢেউ';
            if (lang === 'kn') return 'ಮಧ್ಯಮ ಅಥವಾ ಎತ್ತರದ ಅಲೆಗಳು';
        }
        if (text.includes('wind')) {
            if (lang === 'hi') return 'तेज़ हवा की गति';
            if (lang === 'ta') return 'வேகமான காற்று';
            if (lang === 'ml') return 'വേഗതയേറിയ കാറ്റ്';
            if (lang === 'te') return 'తీవ్రమైన గాలి వేగం';
            if (lang === 'gu') return 'ઝડપી પવન';
            if (lang === 'mr') return 'वेगवान वारा';
            if (lang === 'bn') return 'ঝড়ো বাতাস';
            if (lang === 'kn') return 'ವೇಗದ ಗಾಳಿ';
        }
        if (text.includes('imbl')) {
            if (lang === 'hi') return 'अंतर्राष्ट्रीय समुद्री सीमा (IMBL) के समीप';
            if (lang === 'ta') return 'சர்வதேச கடல் எல்லை (IMBL) அருகில்';
            if (lang === 'ml') return 'അന്താരാഷ്ട്ര സമുദ്ര അതിർത്തി (IMBL) സമീപം';
            if (lang === 'te') return 'అంతర్జాతీయ సముద్ర సరిహద్దు (IMBL) సమీపంలో';
            if (lang === 'gu') return 'આંતરરાષ્ટ્રીય સરહદ નજીક';
            if (lang === 'mr') return 'आंतरराष्ट्रीय सागरी सीमेजवळ';
            if (lang === 'bn') return 'আন্তর্জাতিক সমুদ্র সীমানার কাছাকাছি';
            if (lang === 'kn') return 'ಅಂತರರಾಷ್ಟ್ರೀಯ ಗಡಿಯ ಹತ್ತಿರ';
        }
        if (text.includes('mpa')) {
            if (lang === 'hi') return 'समुद्री संरक्षित क्षेत्र (मछली पकड़ना वर्जित)';
            if (lang === 'ta') return 'கடல் பாதுகாக்கப்பட்ட பகுதி (மீன்பிடிக்க தடை)';
            if (lang === 'ml') return 'സംരക്ഷിത മേഖല (മത്സ്യബന്ധന നിരോധനം)';
            if (lang === 'te') return 'రక్షిత సముద్ర ప్రాంతం (వేట నిషేధం)';
            if (lang === 'gu') return 'સંરક્ષિત વિસ્તાર';
            if (lang === 'mr') return 'संरक्षित सागरी क्षेत्र';
            if (lang === 'bn') return 'সংরক্ষিত সামুদ্রিক অঞ্চল';
            if (lang === 'kn') return 'ಸಂರಕ್ಷಿತ ಪ್ರದೇಶ';
        }
        return r;
    }).join('; ');
}

// Localized deterministic marine advisories for offline & rule-based engine
function buildLocalizedAdvisory(lang, o, lat, lon) {
    const l = supportedLanguages.includes(lang) ? lang : 'en';
    const r = o.risk;
    const f = o.fishingOpportunity;
    const w = o.weather;
    const oc = o.ocean;
    const g = o.geofence;

    const latStr = lat.toFixed(2);
    const lonStr = lon.toFixed(2);

    const adviceText = localizeAdvice(r.advice, l);
    const reasonsText = localizeReasons(r.reasons, l);

    if (l === 'hi') {
        const statusHi = r.alertLevel === 'SAFE' ? 'मछली पकड़ने के लिए स्थिति अनुकूल व सुरक्षित है।'
            : r.alertLevel === 'CAUTION' ? 'सतर्कता आवश्यक — मौसम में हल्का बदलाव।'
            : r.alertLevel === 'HIGH RISK' ? 'उच्च जोखिम — केवल तट के समीप रहें।'
            : 'गंभीर खतरा — समुद्र में बिल्कुल न जाएं!';

        const fishText = f
            ? `संभावित मत्स्य क्षेत्र (PFZ): ${f.recommendedZone.title} (${f.recommendedZone.lat.toFixed(2)}, ${f.recommendedZone.lon.toFixed(2)}) — स्कोर ${f.score}/100।`
            : 'आज कोई सक्रिय PFZ नहीं है।';

        return `सागरसाथी समुद्री सलाह (${latStr}, ${lonStr}):

सुरक्षा स्थिति: ${r.alertLevel} (जोखिम स्कोर: ${r.riskScore}/100)
${statusHi}
मुख्य कारक: ${reasonsText}
सलाह: ${adviceText}

मत्स्य पालन अवसर:
${fishText}

समुद्री मौसम:
तापमान (SST) ${oc.seaSurfaceTemperature}°C, क्लोरोफिल ${oc.chlorophyll} mg/m³ | हवा ${w.windSpeed} km/h, लहरें ${w.waveHeight} m (सीमा दूरी: ${g.distToIMBL} किमी)।

हमेशा नौकायन से पूर्व INCOIS और IMD के आधिकारिक बुलेटिन की पुष्टि अवश्य करें।`;
    }

    if (l === 'ta') {
        const statusTa = r.alertLevel === 'SAFE' ? 'மீன்பிடிக்க சாதகமான மற்றும் பாதுகாப்பான சூழல்.'
            : r.alertLevel === 'CAUTION' ? 'எச்சரிக்கை தேவை — லேசான வானிலை மாற்றம்.'
            : r.alertLevel === 'HIGH RISK' ? 'அதிக ஆபத்து — ஆழ்கடலுக்கு செல்ல வேண்டாம்.'
            : 'கடும் ஆபத்து — கடலுக்கு செல்ல வேண்டாம்!';

        const fishText = f
            ? `சாத்தியமான மீன்பிடி மண்டலம் (PFZ): ${f.recommendedZone.title} (${f.recommendedZone.lat.toFixed(2)}, ${f.recommendedZone.lon.toFixed(2)}) — மதிப்பீடு ${f.score}/100.`
            : 'இன்று செயலில் உள்ள PFZ இல்லை.';

        return `சாகர்சாதி கடல்சார் ஆலோசனை (${latStr}, ${lonStr}):

பாதுகாப்பு நிலை: ${r.alertLevel} (ஆபத்து மதிப்பீடு: ${r.riskScore}/100)
${statusTa}
காரணிகள்: ${reasonsText}
ஆலோசனை: ${adviceText}

மீன்பிடி வாய்ப்பு:
${fishText}

கடல் சூழல்:
வெப்பநிலை (SST) ${oc.seaSurfaceTemperature}°C, குளோரோபில் ${oc.chlorophyll} mg/m³ | காற்று ${w.windSpeed} km/h, அலைகள் ${w.waveHeight} m (எல்லை தூரம்: ${g.distToIMBL} கி.மீ).

கடலுக்கு செல்லும் முன் INCOIS மற்றும் IMD அதிகாரப்பூர்வ அறிவிப்புகளை உறுதிப்படுத்தவும்.`;
    }

    if (l === 'ml') {
        const statusMl = r.alertLevel === 'SAFE' ? 'മത്സ്യബന്ധനത്തിന് അനുകൂലവും സുരക്ഷിതവുമായ അവസ്ഥ.'
            : r.alertLevel === 'CAUTION' ? 'ജാഗ്രത പാലിക്കുക — കാലാവസ്ഥയിൽ നേരിയ മാറ്റം.'
            : r.alertLevel === 'HIGH RISK' ? 'ഉയർന്ന അപകടസാധ്യത — ആഴക്കടലിൽ പോകരുത്.'
            : 'ഗുരുതരമായ അപകടം — കടലിൽ പോകരുത്!';

        const fishText = f
            ? `സാധ്യതാ മത്സ്യ മേഖല (PFZ): ${f.recommendedZone.title} (${f.recommendedZone.lat.toFixed(2)}, ${f.recommendedZone.lon.toFixed(2)}) — സ്കോർ ${f.score}/100.`
            : 'ഇന്ന് സജീവമായ PFZ ലഭ്യമല്ല.';

        return `സാഗർസാഥി സമുദ്രോപദേശം (${latStr}, ${lonStr}):

സുരക്ഷാ നില: ${r.alertLevel} (അപകട സ്കോർ: ${r.riskScore}/100)
${statusMl}
ഘടകങ്ങൾ: ${reasonsText}
നിർദ്ദേശം: ${adviceText}

മത്സ്യബന്ധന അവസരം:
${fishText}

സമുദ്ര വിവരങ്ങൾ:
താപനില (SST) ${oc.seaSurfaceTemperature}°C, ക്ലോറോഫിൽ ${oc.chlorophyll} mg/m³ | കാറ്റ് ${w.windSpeed} km/h, തിരമാലകൾ ${w.waveHeight} m (അതിർത്തി ദൂരം: ${g.distToIMBL} കി.മീ).

കടലിൽ പോകുന്നതിന് മുൻപ് INCOIS, IMD അറിയിപ്പുകൾ സ്ഥിരീകരിക്കുക.`;
    }

    if (l === 'te') {
        const statusTe = r.alertLevel === 'SAFE' ? 'చేపల వేటకు అనుకూలమైన మరియు సురక్షితమైన పరిస్థితులు.'
            : r.alertLevel === 'CAUTION' ? 'జాగ్రత్త అవసరం — వాతావరణంలో స్వల్ప మార్పు.'
            : r.alertLevel === 'HIGH RISK' ? 'అధిక ప్రమాదం — తీరం వద్దనే ఉండండి.'
            : 'తీవ్ర ప్రమాదం — సముద్రంలోకి వెళ్లవద్దు!';

        const fishText = f
            ? `చేపల వేట ప్రాంతం (PFZ): ${f.recommendedZone.title} (${f.recommendedZone.lat.toFixed(2)}, ${f.recommendedZone.lon.toFixed(2)}) — స్కోర్ ${f.score}/100.`
            : 'ఈరోజు చురుకైన PFZ లేదు.';

        return `సాగర్‌సాథి సముద్ర సలహా (${latStr}, ${lonStr}):

భద్రతా స్థితి: ${r.alertLevel} (ప్రమాద స్కోర్: ${r.riskScore}/100)
${statusTe}
కారణాలు: ${reasonsText}
సలహా: ${adviceText}

మత్స్య సంపద అవకాశం:
${fishText}

సముద్ర వాతావరణం:
ఉష్ణోగ్రత (SST) ${oc.seaSurfaceTemperature}°C, క్లోరోఫిల్ ${oc.chlorophyll} mg/m³ | గాలి ${w.windSpeed} km/h, అలలు ${w.waveHeight} m (సరిహద్దు దూరం: ${g.distToIMBL} కి.మీ).

సముద్రంలోకి వెళ్లే ముందు INCOIS మరియు IMD నివేదికలను సరిచూసుకోండి.`;
    }

    if (l === 'gu') {
        const statusGu = r.alertLevel === 'SAFE' ? 'માછીમારી માટે સ્થિતિ અનુકૂળ અને સુરક્ષિત છે.'
            : r.alertLevel === 'CAUTION' ? 'સાવચેતી જરૂરી — હવામાનમાં થોડો ફેરફાર.'
            : r.alertLevel === 'HIGH RISK' ? 'ઉચ્ચ જોખમ — દરિયામાં ઊંડે ન જવું.'
            : 'ગંભીર જોખમ — દરિયામાં જવું નહીં!';

        return `સાગરસાથી દરિયાઈ સલાહ (${latStr}, ${lonStr}):

સુરક્ષા સ્થિતિ: ${r.alertLevel} (જોખમ સ્કોર: ${r.riskScore}/100)
${statusGu}
મુખ્ય પરિબળો: ${reasonsText}
સલાહ: ${adviceText}

દરિયાઈ સ્થિતિ:
SST ${oc.seaSurfaceTemperature}°C, ક્લોરોફિલ ${oc.chlorophyll} mg/m³ | પવન ${w.windSpeed} km/h, મોજાં ${w.waveHeight} m (સીમા અંતર: ${g.distToIMBL} કિમી).

દરિયામાં જતા પહેલા INCOIS અને IMD ની પુષ્ટિ અવશ્ય કરો.`;
    }

    if (l === 'mr') {
        const statusMr = r.alertLevel === 'SAFE' ? 'मासेमारीसाठी अनुकूल व सुरक्षित परिस्थिती.'
            : r.alertLevel === 'CAUTION' ? 'सावधगिरी बाळगा — हवामानात हलका बदल.'
            : r.alertLevel === 'HIGH RISK' ? 'उच्च धोका — खोल समुद्रात जाऊ नका.'
            : 'गंभीर धोका — समुद्रात जाऊ नका!';

        return `सागरसाथी सागरी सल्ला (${latStr}, ${lonStr}):

सुरक्षा स्थिती: ${r.alertLevel} (धोका गुण: ${r.riskScore}/100)
${statusMr}
घटक: ${reasonsText}
सल्ला: ${adviceText}

सागरी स्थिती:
SST ${oc.seaSurfaceTemperature}°C, क्लोरोफिल ${oc.chlorophyll} mg/m³ | वारा ${w.windSpeed} km/h, लाटा ${w.waveHeight} m (सीमा अंतर: ${g.distToIMBL} किमी).

समुद्रात जाण्यापूर्वी INCOIS व IMD बुलेटिनची खात्री करा.`;
    }

    if (l === 'bn') {
        const statusBn = r.alertLevel === 'SAFE' ? 'মাছ ধরার জন্য অনুকূল ও নিরাপদ পরিস্থিতি।'
            : r.alertLevel === 'CAUTION' ? 'সতর্কতা প্রয়োজন — আবহাওয়ায় সামান্য পরিবর্তন।'
            : r.alertLevel === 'HIGH RISK' ? 'উচ্চ ঝুঁকি — গভীর সমুদ্রে যাবেন না।'
            : 'মারাত্মক বিপদ — সমুদ্রে যাবেন না!';

        return `সাগরসাথী সমুদ্র পরামর্শ (${latStr}, ${lonStr}):

নিরাপত্তা স্তর: ${r.alertLevel} (ঝুঁকি স্কোর: ${r.riskScore}/100)
${statusBn}
কারণ: ${reasonsText}
পরামর্শ: ${adviceText}

সমুদ্রের অবস্থা:
SST ${oc.seaSurfaceTemperature}°C, ক্লোরোফিল ${oc.chlorophyll} mg/m³ | বাতাস ${w.windSpeed} km/h, ঢেউ ${w.waveHeight} m (সীমানা দূরত্ব: ${g.distToIMBL} কিমি)।

সমুদ্রে যাওয়ার আগে INCOIS এবং IMD বুলেটিন নিশ্চিত করুন।`;
    }

    if (l === 'kn') {
        const statusKn = r.alertLevel === 'SAFE' ? 'ಮೀನುಗಾರಿಕೆಗೆ ಅನುಕೂಲಕರ ಮತ್ತು ಸುರಕ್ಷಿತ ವಾತಾವರಣ.'
            : r.alertLevel === 'CAUTION' ? 'ಎಚ್ಚರಿಕೆ ಅಗತ್ಯ — ಹವಾಮಾನದಲ್ಲಿ ಸಣ್ಣ ಬದಲಾವಣೆ.'
            : r.alertLevel === 'HIGH RISK' ? 'ಹೆಚ್ಚಿನ ಅಪಾಯ — ಆಳ ಸಮುದ್ರಕ್ಕೆ ಹೋಗಬೇಡಿ.'
            : 'ಗಂಭೀರ ಅಪಾಯ — ಸಮುದ್ರಕ್ಕೆ ಹೋಗಬೇಡಿ!';

        return `ಸಾಗರಸಾಥಿ ಸಮುದ್ರ ಸಲಹೆ (${latStr}, ${lonStr}):

ಸುರಕ್ಷತಾ ಸ್ಥಿತಿ: ${r.alertLevel} (ಅಪಾಯ ಸ್ಕೋರ್: ${r.riskScore}/100)
${statusKn}
ಅಂಶಗಳು: ${reasonsText}
ಸಲಹೆ: ${adviceText}

ಸಮುದ್ರ ಮಾಹಿತಿ:
SST ${oc.seaSurfaceTemperature}°C, ಕ್ಲೋರೊಫಿಲ್ ${oc.chlorophyll} mg/m³ | ಗಾಳಿ ${w.windSpeed} km/h, ಅಲೆಗಳು ${w.waveHeight} m (ಗಡಿ ದೂರ: ${g.distToIMBL} ಕಿ.ಮೀ).

ಸಮುದ್ರಕ್ಕೆ ಹೋಗುವ ಮುನ್ನ INCOIS ಮತ್ತು IMD ಬುಲೆಟಿನ್‌ಗಳನ್ನು ಖಚಿತಪಡಿಸಿಕೊಳ್ಳಿ.`;
    }

    // Default English
    return `SaagarSathi advisory for (${latStr}, ${lonStr}).

SAFETY: ${r.alertLevel} (score ${r.riskScore}/100).
${r.status}
Factors: ${reasonsText}.
Advice: ${adviceText}

FISHING: ${f ? `${f.recommendedZone.title} near ${f.recommendedZone.lat.toFixed(2)}, ${f.recommendedZone.lon.toFixed(2)} — score ${f.score}/100 (${f.confidence} confidence). ${f.note}` : 'No PFZ today.'}

Ocean: SST ${oc.seaSurfaceTemperature}°C, Chl-a ${oc.chlorophyll} mg/m³ | Wind ${w.windSpeed} km/h, waves ${w.waveHeight} m (IMBL ${g.distToIMBL} km away).

Always confirm with official INCOIS/IMD bulletins before sailing.`;
}

module.exports = {
    detectLanguageFromText,
    buildLocalizedAdvisory,
    supportedLanguages,
    LANG_NAMES,
};
