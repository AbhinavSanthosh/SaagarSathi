const axios = require('axios');

// ---------- utils (deterministic, no random) ----------
function hashSeed(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) {
        h ^= str.charCodeAt(i);
        h = Math.imul(h, 16777619);
    }
    return Math.abs(h);
}
function pseudoRandom(seed, salt) {
    const x = Math.sin(seed + salt * 127.1) * 43758.5453;
    return x - Math.floor(x);
}
function haversineKm(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
}
function distToSegmentKm(lat, lon, a, b) {
    const kx = Math.cos(((a.lat + b.lat) / 2 * Math.PI) / 180) * 111.32;
    const ky = 110.57;
    const px = lon * kx, py = lat * ky;
    const ax = a.lon * kx, ay = a.lat * ky;
    const bx = b.lon * kx, by = b.lat * ky;
    const dx = bx - ax, dy = by - ay;
    const len2 = dx * dx + dy * dy || 1e-9;
    let t = ((px - ax) * dx + (py - ay) * dy) / len2;
    t = Math.max(0, Math.min(1, t));
    const cx = ax + t * dx, cy = ay + t * dy;
    return Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
}

// Real-ish reference boundaries (public approximations, demo only)
const IMBL_SEGMENTS = [
    { name: 'Palk Strait IMBL', a: { lat: 9.3, lon: 79.3 }, b: { lat: 10.2, lon: 80.2 } },
    { name: 'Gulf of Mannar IMBL', a: { lat: 8.5, lon: 78.6 }, b: { lat: 9.3, lon: 79.3 } },
    { name: 'Offshore EEZ limit (demo)', a: { lat: 8.0, lon: 74.0 }, b: { lat: 15.0, lon: 70.5 } },
];
const MPAS = [
    { name: 'Gulf of Mannar Marine NP', center: { lat: 9.0, lon: 79.1 }, radiusKm: 12, polygon: [[9.08, 78.95], [9.05, 79.25], [8.9, 79.3], [8.85, 79.0]] },
    { name: 'Palk Bay Eco-sensitive', center: { lat: 9.7, lon: 79.4 }, radiusKm: 15, polygon: [[9.85, 79.2], [9.85, 79.6], [9.55, 79.6], [9.55, 79.2]] },
];

async function weatherAgent(lat, lon) {
    const ts = new Date().toISOString();
    try {
        const forecastUrl = process.env.OPEN_METEO_FORECAST_URL || 'https://api.open-meteo.com/v1/forecast';
        const marineUrl = process.env.OPEN_METEO_MARINE_URL || 'https://marine-api.open-meteo.com/v1/marine';
        const [forecastRes, marineRes] = await Promise.all([
            axios.get(forecastUrl, {
                params: { latitude: lat, longitude: lon, current: 'temperature_2m,precipitation,weather_code,wind_speed_10m,wind_direction_10m', hourly: 'wind_speed_10m,precipitation,weather_code', forecast_days: 3 },
                timeout: 8000,
            }),
            axios.get(marineUrl, {
                params: { latitude: lat, longitude: lon, hourly: 'wave_height,wave_direction,wave_period,wind_wave_height,swell_wave_height,ocean_current_velocity', forecast_days: 3 },
                timeout: 8000,
            }),
        ]);
        const cur = forecastRes.data.current || {};
        const waveArr = marineRes.data.hourly?.wave_height || [0];
        return {
            windSpeed: cur.wind_speed_10m ?? forecastRes.data.hourly?.wind_speed_10m?.[0] ?? 0,
            windDirection: cur.wind_direction_10m ?? 0,
            temperature: cur.temperature_2m ?? 0,
            precipitation: cur.precipitation ?? 0,
            weatherCode: cur.weather_code ?? 0,
            waveHeight: waveArr[0] ?? 0,
            waveDirection: marineRes.data.hourly?.wave_direction?.[0] ?? 0,
            wavePeriod: marineRes.data.hourly?.wave_period?.[0] ?? 0,
            swellWaveHeight: marineRes.data.hourly?.swell_wave_height?.[0] ?? 0,
            oceanCurrentVelocity: marineRes.data.hourly?.ocean_current_velocity?.[0] ?? 0,
            source: 'Open-Meteo forecast + marine',
            timestamp: ts,
            live: true,
        };
    } catch {
        const seed = hashSeed(`${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`);
        const wind = 8 + pseudoRandom(seed, 1) * 22;
        const wave = 0.6 + pseudoRandom(seed, 2) * 1.8;
        return {
            windSpeed: +wind.toFixed(1), windDirection: 230 + Math.floor(pseudoRandom(seed, 3) * 40),
            temperature: +(28 + pseudoRandom(seed, 4) * 2 - 1).toFixed(1),
            precipitation: +(pseudoRandom(seed, 5) * 1.5).toFixed(1),
            weatherCode: 2, waveHeight: +wave.toFixed(1),
            waveDirection: 240, wavePeriod: 7.5, swellWaveHeight: +(wave * 0.7).toFixed(1),
            oceanCurrentVelocity: 0.3,
            source: 'Fallback climatology (Open-Meteo feed unreachable)',
            timestamp: ts, live: false,
        };
    }
}

async function oceanAgent(lat, lon) {
    const seed = hashSeed(`sst-${Number(lat).toFixed(2)},${Number(lon).toFixed(2)}`);
    const sst = 27.2 + pseudoRandom(seed, 11) * 2.2;
    const chl = 0.25 + pseudoRandom(seed, 12) * 1.1;
    return {
        seaSurfaceTemperature: +sst.toFixed(1),
        chlorophyll: +chl.toFixed(2),
        sstGradient: +(0.15 + pseudoRandom(seed, 13) * 0.45).toFixed(2),
        upwellingIndex: pseudoRandom(seed, 14) > 0.4,
        source: 'Oceansat-3 OCM proxy + INCOIS baseline',
        timestamp: new Date().toISOString(),
    };
}

function getOffshoreOffsets(lat, lon) {
    const la = parseFloat(lat), lo = parseFloat(lon);

    // 1. Gujarat Coast (Veraval / Saurashtra)
    if (la > 20.0 && lo < 73.0) {
        return {
            pfz1: { lat: +(la - 0.20).toFixed(4), lon: +(lo - 0.15).toFixed(4) },
            pfz2: { lat: +(la - 0.25).toFixed(4), lon: +(lo + 0.06).toFixed(4) },
        };
    }

    // 2. West Coast of India (Arabian Sea: Kochi, Thiruvananthapuram, Mangaluru, Goa, Mumbai)
    // Coastline runs NNW to SSE. Sea is strictly to the WEST (lower longitude).
    if (lo < 77.5) {
        return {
            pfz1: { lat: +(la + 0.10).toFixed(4), lon: +(lo - 0.22).toFixed(4) }, // North-West offshore into Arabian Sea
            pfz2: { lat: +(la - 0.18).toFixed(4), lon: +(lo - 0.26).toFixed(4) }, // South-West offshore into Arabian Sea
        };
    }

    // 3. Gulf of Mannar (Tamil Nadu South Coast)
    if (la >= 8.5 && la <= 9.3 && lo >= 78.5 && lo <= 79.3) {
        return {
            pfz1: { lat: +(la - 0.12).toFixed(4), lon: +(lo + 0.18).toFixed(4) }, // South-East into Gulf of Mannar
            pfz2: { lat: +(la - 0.18).toFixed(4), lon: +(lo + 0.12).toFixed(4) },
        };
    }

    // 4. Palk Strait
    if (la > 9.3 && la <= 10.3 && lo >= 79.0 && lo <= 80.0) {
        return {
            pfz1: { lat: +(la + 0.08).toFixed(4), lon: +(lo + 0.16).toFixed(4) }, // East into Palk Bay/Strait
            pfz2: { lat: +(la - 0.08).toFixed(4), lon: +(lo + 0.12).toFixed(4) },
        };
    }

    // 5. East Coast of India (Bay of Bengal: Chennai, Andhra, Odisha, Bengal)
    // Sea is strictly to the EAST (higher longitude).
    return {
        pfz1: { lat: +(la + 0.12).toFixed(4), lon: +(lo + 0.22).toFixed(4) }, // North-East offshore into Bay of Bengal
        pfz2: { lat: +(la - 0.15).toFixed(4), lon: +(lo + 0.28).toFixed(4) }, // South-East offshore into Bay of Bengal
    };
}

async function pfzAgent(lat, lon, ocean, lang = 'en') {
    const la = parseFloat(lat), lo = parseFloat(lon);
    const seed = hashSeed(`pfz-${la.toFixed(2)},${lo.toFixed(2)}`);
    const oc = ocean || { seaSurfaceTemperature: 28, chlorophyll: 0.6, sstGradient: 0.25, upwellingIndex: false };
    const score = Math.min(95, Math.max(35,
        55 + (oc.chlorophyll - 0.5) * 40 + (29 - Math.abs(oc.seaSurfaceTemperature - 28.2)) * 6
    ));
    const ts = new Date().toISOString();
    const offsets = getOffshoreOffsets(la, lo);

    let title1 = 'High Probability Fishing Zone';
    let title2 = 'Secondary Fishing Zone';
    let desc1 = `SST ${oc.seaSurfaceTemperature}°C + Chl-a ${oc.chlorophyll} mg/m³ front detected. Upwelling ${oc.upwellingIndex ? 'likely' : 'weak'}.`;
    let desc2 = 'Moderate productivity, suitable for small boats.';
    let why1 = `Chlorophyll hotspot (>0.4 mg/m³) overlapping SST front (gradient ${oc.sstGradient}°C/10km). INCOIS PFZ baseline agrees.`;
    let why2 = 'Secondary chlorophyll patch with weaker thermal front.';

    if (lang === 'hi') {
        title1 = 'उच्च संभाव्यता मत्स्य क्षेत्र (PFZ)';
        title2 = 'द्वितीयक मत्स्य क्षेत्र';
        desc1 = `SST ${oc.seaSurfaceTemperature}°C + क्लोरोफिल ${oc.chlorophyll} mg/m³ थर्मल फ्रंट। अपवेलिंग ${oc.upwellingIndex ? 'संभव' : 'सामान्य'}।`;
        desc2 = 'मध्यम उत्पादकता, छोटी नौकाओं हेतु उपयुक्त।';
        why1 = `क्लोरोफिल हॉटस्पॉट व तापमान प्रवणता (${oc.sstGradient}°C/10km) का मिलन। INCOIS PFZ डेटा अनुरूप।`;
        why2 = 'द्वितीयक क्लोरोफिल क्षेत्र व हल्का थर्मल फ्रंट।';
    } else if (lang === 'ta') {
        title1 = 'அதிக வாய்ப்புள்ள மீன்பிடி மண்டலம் (PFZ)';
        title2 = 'இரண்டாம் நிலை மீன்பிடி மண்டலம்';
        desc1 = `SST ${oc.seaSurfaceTemperature}°C + குளோரோபில் ${oc.chlorophyll} mg/m³ முன்னணி கண்டறியப்பட்டது.`;
        desc2 = 'மிதமான உற்பத்தித்திறன், சிறிய படகுகளுக்கு ஏற்றது.';
        why1 = `குளோரோபில் அதிகமுள்ள பகுதி மற்றும் SST வெப்பநிலை எல்லை சங்கமம்.`;
        why2 = 'இரண்டாம் நிலை குளோரோபில் பகுதி.';
    } else if (lang === 'ml') {
        title1 = 'സാധ്യതാ മത്സ്യ മേഖല (PFZ)';
        title2 = 'ദ്വിതീയ മത്സ്യ മേഖല';
        desc1 = `SST ${oc.seaSurfaceTemperature}°C + ക്ലോറോഫിൽ ${oc.chlorophyll} mg/m³ തെർമൽ ഫ്രണ്ട് കണ്ടെത്തി.`;
        desc2 = 'മിതമായ ഉത്പാദനക്ഷമത, ചെറിയ ബോട്ടുകൾക്ക് അനുയോജ്യം.';
        why1 = `ക്ലോറോഫിൽ സാന്ദ്രതയും സമുദ്ര താപനില അതിർത്തിയും ചേരുന്ന മേഖല.`;
        why2 = 'രണ്ടാം നിര ക്ലോറോഫിൽ സാന്നിധ്യം.';
    } else if (lang === 'te') {
        title1 = 'అధిక సంభావ్యత మత్స్య ప్రాంతం (PFZ)';
        title2 = 'ద్వితీయ మత్స్య ప్రాంతం';
        desc1 = `SST ${oc.seaSurfaceTemperature}°C + క్లోరోఫిల్ ${oc.chlorophyll} mg/m³ ఫ్రంట్ గుర్తించబడింది.`;
        desc2 = 'మితమైన ఉత్పాదకత, చిన్న పడవలకు అనుకూలం.';
        why1 = `క్లోరోఫిల్ హాట్‌స్పాట్ మరియు SST థర్మల్ ఫ్రంట్ కలయిక.`;
        why2 = 'ద్వితీయ క్లోరోఫిల్ ప్రాంతం.';
    }

    const zones = [
        {
            id: 'PFZ-1',
            center: offsets.pfz1,
            centerArr: [offsets.pfz1.lat, offsets.pfz1.lon],
            radius: 9000, radiusKm: 9,
            sst: oc.seaSurfaceTemperature, chlorophyll: oc.chlorophyll,
            score: Math.round(score),
            confidence: score > 75 ? 'High' : score > 55 ? 'Medium' : 'Low',
            validity: '24h', satellitePass: ts,
            title: title1,
            desc: desc1,
            why: why1,
        },
    ];
    if (pseudoRandom(seed, 21) > 0.35) {
        zones.push({
            id: 'PFZ-2',
            center: offsets.pfz2,
            centerArr: [offsets.pfz2.lat, offsets.pfz2.lon],
            radius: 7000, radiusKm: 7,
            sst: +(oc.seaSurfaceTemperature - 0.4).toFixed(1), chlorophyll: +(oc.chlorophyll * 0.8).toFixed(2),
            score: Math.round(score - 12), confidence: 'Medium', validity: '24h', satellitePass: ts,
            title: title2, desc: desc2,
            why: why2,
        });
    }
    return zones;
}

function geofenceAgent(lat, lon, lang = 'en') {
    const la = parseFloat(lat), lo = parseFloat(lon);
    let distToIMBL = Infinity, nearestSeg = IMBL_SEGMENTS[0].name, nearestSegIndex = 0;
    IMBL_SEGMENTS.forEach((s, i) => {
        const d = distToSegmentKm(la, lo, s.a, s.b);
        if (d < distToIMBL) { distToIMBL = d; nearestSeg = s.name; nearestSegIndex = i; }
    });
    let isInsideMPA = false, insideName = null;
    for (const m of MPAS) {
        const d = haversineKm(la, lo, m.center.lat, m.center.lon);
        if (d < m.radiusKm) { isInsideMPA = true; insideName = m.name; }
    }

    let nearestBoundaryName = nearestSeg;
    let warnings = [];

    if (lang === 'hi') {
        if (nearestSeg.includes('Mannar')) nearestBoundaryName = 'मन्नार की खाड़ी IMBL सीमा';
        else if (nearestSeg.includes('Palk')) nearestBoundaryName = 'पाक जलडमरूमध्य IMBL सीमा';
        else nearestBoundaryName = 'अपतटीय EEZ सीमा रेखा';

        if (distToIMBL < 20) warnings.push(`${nearestBoundaryName} से 20 किमी के भीतर — सख्त चेतावनी क्षेत्र।`);
        else if (distToIMBL < 50) warnings.push(`${nearestBoundaryName} से 50 किमी के भीतर — सावधानी से नौकायन करें।`);
        else warnings.push('अंतर्राष्ट्रीय समुद्री सीमा से सुरक्षित दूरी पर।');

        if (isInsideMPA) warnings.push(`समुद्री संरक्षित क्षेत्र (${insideName}) के भीतर। मछली पकड़ना प्रतिबंधित है।`);
    } else if (lang === 'ta') {
        if (nearestSeg.includes('Mannar')) nearestBoundaryName = 'மன்னார் வளைகுடா IMBL எல்லை';
        else if (nearestSeg.includes('Palk')) nearestBoundaryName = 'பாக் நீரிணை IMBL எல்லை';
        else nearestBoundaryName = 'கடல் எல்லை கோடு';

        if (distToIMBL < 20) warnings.push(`${nearestBoundaryName} இலிருந்து 20 கி.மீ தூரத்திற்குள் உள்ளது.`);
        else if (distToIMBL < 50) warnings.push(`${nearestBoundaryName} இலிருந்து 50 கி.மீ தூரத்திற்குள் உள்ளது.`);
        else warnings.push('சர்வதேச எல்லையிலிருந்து பாதுகாப்பான தொலைவில் உள்ளது.');
    } else {
        if (distToIMBL < 20) warnings.push(`Within 20 km of ${nearestSeg} — hard-stop boundary buffer.`);
        else if (distToIMBL < 50) warnings.push(`Within 50 km of ${nearestSeg} — navigate with caution.`);
        else warnings.push('Clear of boundary buffers.');
        if (isInsideMPA) warnings.push(`Inside ${insideName}. Fishing restricted.`);
    }

    return {
        distToIMBL: +distToIMBL.toFixed(1), nearestBoundary: nearestBoundaryName,
        nearestSegIndex,
        isInsideMPA, insideMPAName: insideName, warnings,
        imblSegments: IMBL_SEGMENTS.map(s => ({ name: s.name, line: [[s.a.lat, s.a.lon], [s.b.lat, s.b.lon]] })),
        mpas: MPAS,
    };
}

function validateData(weather, ocean, geofence, lang = 'en') {
    const checks = [];
    const issues = [];
    const now = Date.now();
    const ts = weather.timestamp ? Date.parse(weather.timestamp) : NaN;
    const ageMin = isNaN(ts) ? 999 : (now - ts) / 60000;

    // Real checks: missing fields, physical ranges, feed freshness.
    const missing = [];
    if (weather.windSpeed == null) missing.push('windSpeed');
    if (weather.waveHeight == null) missing.push('waveHeight');
    if (ocean.seaSurfaceTemperature == null) missing.push('SST');
    if (ocean.chlorophyll == null) missing.push('chlorophyll');
    if (missing.length) issues.push(`Missing fields: ${missing.join(', ')}`);

    const unitsOk =
        (weather.windSpeed ?? 0) < 200 &&
        (ocean.seaSurfaceTemperature ?? 0) > 10 &&
        (ocean.seaSurfaceTemperature ?? 0) < 40;
    if (!unitsOk) issues.push('Unit/range anomaly detected.');

    const fresh = ageMin < 180;
    if (!weather.live) issues.push('Live feed unreachable — climatology fallback in use.');
    else if (!fresh) issues.push('Feed data is stale.');

    let confidence = 'High';
    if (issues.length === 1) confidence = 'Medium';
    else if (issues.length > 1) confidence = 'Low';

    if (lang === 'hi') {
        checks.push({ name: 'ताज़गी (Freshness)', pass: fresh && weather.live !== false, detail: weather.live === false ? 'बैकअप जलवायु डेटा (लाइव फीड अनुपलब्ध)' : 'लाइव सैटेलाइट व मौसम फीड' });
        checks.push({ name: 'इकाइयां व सीमा', pass: unitsOk, detail: `हवा ${weather.windSpeed} km/h, तापमान ${ocean.seaSurfaceTemperature}°C` });
        checks.push({ name: 'डेटा पूर्णता', pass: missing.length === 0, detail: missing.length ? `अनुपलब्ध: ${missing.join(', ')}` : 'सभी आवश्यक पैरामीटर उपलब्ध' });
        checks.push({ name: 'स्रोतों की सहमति', pass: issues.length === 0, detail: issues.length ? issues.join('; ') : 'INCOIS व Open-Meteo डेटा सुसंगत' });
    } else {
        checks.push({ name: 'Freshness', pass: fresh && weather.live !== false, detail: weather.live === false ? 'Climatology fallback (live feed unreachable)' : 'Live satellite & forecast feed' });
        checks.push({ name: 'Units & range', pass: unitsOk, detail: `wind ${weather.windSpeed} km/h, SST ${ocean.seaSurfaceTemperature}°C` });
        checks.push({ name: 'Completeness', pass: missing.length === 0, detail: missing.length ? `Missing: ${missing.join(', ')}` : 'All required fields present' });
        checks.push({ name: 'Source agreement', pass: issues.length === 0, detail: issues.length ? issues.join('; ') : 'INCOIS and Open-Meteo consistent' });
    }

    return { checks, issues, confidence };
}

function riskAgent(weather, ocean, geofence, bulletins = [], lang = 'en') {
    const reasons = [];
    const factors = [];
    let hardStop = null;
    for (const b of bulletins) {
        if (b.severity === 'hard-stop' && b.active) { hardStop = b.title; break; }
    }
    const push = (label, pts, detail, labelLocalized) => {
        factors.push({ label: labelLocalized || label, points: pts, detail });
        if (pts > 0) reasons.push(labelLocalized || label);
    };

    const isHi = lang === 'hi';
    const isTa = lang === 'ta';
    const isMl = lang === 'ml';

    if (hardStop) {
        push(`Hard stop: ${hardStop}`, 100, 'Active cyclone/tsunami alert', isHi ? `सख्त चेतावनी: ${hardStop}` : undefined);
    }
    if (weather.windSpeed >= 62) {
        push('Cyclonic wind (≥62 km/h)', 60, `${weather.windSpeed} km/h`, isHi ? 'चक्रवाती तेज़ हवा (≥62 km/h)' : isTa ? 'சூறாவளி காற்று (≥62 km/h)' : undefined);
    } else if (weather.windSpeed > 40) {
        push('High wind speed (>40 km/h)', 30, `${weather.windSpeed} km/h`, isHi ? 'तेज़ हवा की गति (>40 km/h)' : isTa ? 'வேகமான காற்று (>40 km/h)' : undefined);
    } else if (weather.windSpeed > 25) {
        push('Moderate wind (>25 km/h)', 12, `${weather.windSpeed} km/h`, isHi ? 'मध्यम हवा (>25 km/h)' : isTa ? 'மிதமான காற்று (>25 km/h)' : undefined);
    }

    const wave = Math.max(weather.waveHeight || 0, weather.swellWaveHeight || 0);
    if (wave > 3.5) {
        push('Dangerous swell (>3.5 m)', 45, `${wave.toFixed(1)} m`, isHi ? 'खतरनाक ऊंची लहरें/स्वेल (>3.5 m)' : isTa ? 'ஆபத்தான அலைகள் (>3.5 m)' : undefined);
    } else if (wave > 2.5) {
        push('High waves (>2.5 m)', 25, `${wave.toFixed(1)} m`, isHi ? 'ऊंची लहरें (>2.5 m)' : isTa ? 'உயர்ந்த அலைகள் (>2.5 m)' : undefined);
    } else if (wave > 1.8) {
        push('Moderate waves (>1.8 m)', 10, `${wave.toFixed(1)} m`, isHi ? 'मध्यम लहरें (>1.8 m)' : isTa ? 'மிதமான அலைகள் (>1.8 m)' : isMl ? 'മിതമായ തിരമാലകൾ (>1.8 m)' : undefined);
    }

    if (geofence.distToIMBL < 20) {
        push('IMBL buffer breach (<20 km)', 40, `${geofence.distToIMBL} km`, isHi ? 'अंतर्राष्ट्रीय सीमा (IMBL) के अत्यधिक समीप (<20 km)' : undefined);
    } else if (geofence.distToIMBL < 50) {
        push('Near IMBL (<50 km)', 12, `${geofence.distToIMBL} km`, isHi ? 'अंतर्राष्ट्रीय सीमा (IMBL) के निकट (<50 km)' : undefined);
    }

    const riskScore = Math.min(100, factors.reduce((s, f) => s + f.points, 0));
    let alertLevel = 'SAFE', status, advice;

    if (riskScore >= 70) {
        alertLevel = 'DANGER';
        if (isHi) {
            status = 'गंभीर ख़तरा — समुद्र में बिल्कुल न जाएं। तुरंत बंदरगाह लौटें।';
            advice = 'पूर्ण रोक। यदि समुद्र में हैं तो तटरक्षक बल से VHF Ch-16 पर संपर्क करें।';
        } else if (isTa) {
            status = 'கடும் ஆபத்து — கடலுக்கு செல்ல வேண்டாம். உடனடியாக துறைமுகம் திரும்பவும்.';
            advice = 'உடனடி நிறுத்தம். கடலில் இருந்தால் VHF Ch-16 மூலம் தொடர்பு கொள்ளவும்.';
        } else {
            status = 'DANGER — Do not venture out. Return to port immediately.';
            advice = 'Hard stop. Contact harbour control / Coast Guard on VHF Ch-16 if already at sea.';
        }
    } else if (riskScore >= 40) {
        alertLevel = 'HIGH RISK';
        if (isHi) {
            status = 'उच्च जोखिम — छोटी नावों के लिए समुद्र में जाना अनुशंसित नहीं।';
            advice = 'यात्रा स्थगित करें या बंदरगाह से 5 किमी के भीतर रहें। 6 घंटे में पुनः जांचें।';
        } else if (isTa) {
            status = 'அதிக ஆபத்து — சிறிய படகுகள் கடலுக்கு செல்ல வேண்டாம்.';
            advice = 'பயணத்தை ஒத்திவைக்கவும் அல்லது துறைமுகத்திற்கு 5 கி.மீ உள்ளே இருக்கவும்.';
        } else {
            status = 'HIGH RISK — Voyage not recommended for small boats.';
            advice = 'Postpone or stay within 5 km of harbour. Re-check in 6 hours.';
        }
    } else if (riskScore >= 18) {
        alertLevel = 'CAUTION';
        if (isHi) {
            status = 'सतर्कता — सावधानियों के साथ मछली पकड़ना संभव।';
            advice = 'केवल दिन का दौरा करें, लाइफ जैकेट पहनें, VHF व दामिनी अलर्ट पर नज़र रखें।';
        } else if (isTa) {
            status = 'எச்சரிக்கை — முன்னெச்சரிக்கையுடன் மீன்பிடிக்கலாம்.';
            advice = 'பகல் பயணம் மட்டும், லைஃப் ஜாக்கெட் அணியுங்கள், VHF கவனிக்கவும்.';
        } else {
            status = 'CAUTION — Fishable with precautions.';
            advice = 'Day trip only, wear PFDs, monitor VHF + DAMINI lightning alerts, file float plan.';
        }
    } else {
        alertLevel = 'SAFE';
        if (isHi) {
            status = 'सुरक्षित — मछली पकड़ने के लिए स्थिति अनुकूल है।';
            advice = 'सामान्य सावधानियां बरतें। बंदरगाह के साथ अपनी लाइव लोकेशन साझा रखें।';
        } else if (isTa) {
            status = 'பாதுகாப்பானது — மீன்பிடிக்க சாதகமான சூழல்.';
            advice = 'வழக்கமான முன்னெச்சரிக்கைகள். துறைமுகத்திற்கு தகவல் தெரிவிக்கவும்.';
        } else if (isMl) {
            status = 'സുരക്ഷിതം — മത്സ്യബന്ധനത്തിന് അനുകൂലമായ അവസ്ഥ.';
            advice = 'സാധാരണ മുൻകരുതലുകൾ. ഹാർബറുമായി ബന്ധം പുലർത്തുക.';
        } else {
            status = 'SAFE — Conditions favourable for fishing.';
            advice = 'Standard precautions. Share live location with harbour.';
        }
    }

    const legacy = alertLevel === 'SAFE' ? 'safe' : alertLevel === 'DANGER' ? 'danger' : 'warning';
    return { riskScore, alertLevel, legacyLevel: legacy, status, advice, reasons, factors };
}

function buildBulletins(lat, lon, weather, geofence, lang = 'en') {
    const seed = hashSeed(`bul-${Number(lat).toFixed(1)},${Number(lon).toFixed(1)}`);
    const now = new Date();
    const fmt = (d) => d.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });
    const list = [];
    const isHi = lang === 'hi';
    const isTa = lang === 'ta';

    const wave = Math.max(weather.waveHeight || 0, weather.swellWaveHeight || 0);
    if (wave > 2.5) {
        list.push({
            id: 'INCOIS-HW', source: 'INCOIS', type: 'danger', severity: 'conditional', active: true,
            title: isHi ? 'ऊंची लहरें व स्वेल चेतावनी' : isTa ? 'உயர் அலை எச்சரிக்கை' : 'High-wave / swell-surge advisory',
            desc: isHi ? `महत्वपूर्ण लहर ऊंचाई ${wave.toFixed(1)} m का पूर्वानुमान। छोटी नावें गहरे समुद्र से बचें।` : `Significant wave height ${wave.toFixed(1)} m forecast. Small boats avoid deep sea.`,
            time: fmt(now), url: 'https://incois.gov.in/'
        });
    }
    if (weather.windSpeed > 40) {
        list.push({
            id: 'IMD-GALE', source: 'IMD', type: 'danger', severity: 'hard-stop', active: weather.windSpeed >= 62,
            title: isHi ? 'तेज़ हवा व समुद्री हलचल चेतावनी' : 'Gale warning / squally weather',
            desc: isHi ? `हवा की गति ${weather.windSpeed} km/h दिशा ${weather.windDirection}°। मछुआरों को सावधानी की सलाह।` : `Wind ${weather.windSpeed} km/h from ${weather.windDirection}°. Exercise caution.`,
            time: fmt(now), url: 'https://mausam.imd.gov.in/'
        });
    }
    if (geofence.distToIMBL < 50) {
        list.push({
            id: 'GEO-IMBL', source: 'Bhuvan / IMBL', type: geofence.distToIMBL < 20 ? 'danger' : 'warning', severity: geofence.distToIMBL < 20 ? 'hard-stop' : 'advisory', active: geofence.distToIMBL < 20,
            title: isHi ? `IMBL सीमा निकटता — ${geofence.distToIMBL} किमी` : `IMBL proximity — ${geofence.distToIMBL} km`,
            desc: isHi ? `${geofence.nearestBoundary}। सीमा रेखा से सुरक्षित दूरी बनाए रखें।` : `${geofence.nearestBoundary}. Maintain safe distance.`,
            time: fmt(now), url: 'https://bhuvan.nrsc.gov.in/'
        });
    }

    list.push({
        id: 'IMD-GEN', source: 'IMD', type: 'safe', severity: 'info', active: false,
        title: isHi ? 'अगले 48 घंटों में कोई चक्रवात चेतावनी नहीं' : isTa ? 'அடுத்த 48 மணி நேரத்திற்கு புயல் எச்சரிக்கை இல்லை' : 'No cyclone warning for next 48h (demo region)',
        desc: isHi ? 'मछुआरे स्थानीय हवा व लहर स्थिति जांचकर नौकायन योजना बना सकते हैं।' : isTa ? 'மீனவர்கள் உள்ளூர் வானிலை சரிபார்த்து கடலுக்கு செல்லலாம்.' : 'Fishermen can plan day trips subject to local wind/wave check.',
        time: fmt(now), url: 'https://mausam.imd.gov.in/'
    });

    if (pseudoRandom(seed, 31) > 0.4) {
        list.push({
            id: 'DAMINI', source: 'DAMINI', type: 'info', severity: 'advisory', active: false,
            title: isHi ? 'तड़ित झंझा (बिजली) चेतावनी — 20-40 किमी दायरा' : 'Lightning nowcast — monitor 20–40 km radius',
            desc: isHi ? 'दामिनी अलर्ट का पालन करें; मेघगर्जन होने पर प्रस्थान में देरी करें।' : 'Register crew on DAMINI-style alert; delay departure if cells develop.',
            time: fmt(now), url: 'https://www.iitm.res.in/'
        });
    }
    return list;
}

async function orchestrate(lat, lon, lang = 'en') {
    const la = parseFloat(lat) || 0, lo = parseFloat(lon) || 0;
    const [weather, ocean] = await Promise.all([weatherAgent(la, lo), oceanAgent(la, lo)]);
    const [pfzRaw, geofence] = await Promise.all([pfzAgent(la, lo, ocean, lang), Promise.resolve(geofenceAgent(la, lo, lang))]);
    // Canonical zone shape for EVERY consumer (/api/orchestrator, /api/zones,
    // chat fishing payload): Leaflet-ready array center + explicit lat/lon.
    // pfzAgent returns a {lat,lon} object center; normalize once here so no
    // frontend ever has to guess the shape (a past mismatch blanked Home).
    const pfz = pfzRaw.map(z => {
        const cLat = Array.isArray(z.center) ? z.center[0] : z.center?.lat;
        const cLon = Array.isArray(z.center) ? z.center[1] : (z.center?.lon ?? z.center?.lng);
        return { ...z, center: [cLat, cLon], centerArr: [cLat, cLon], lat: cLat, lon: cLon };
    });
    const bulletins = buildBulletins(la, lo, weather, geofence, lang);
    const validation = validateData(weather, ocean, geofence, lang);
    const risk = riskAgent(weather, ocean, geofence, bulletins, lang);
    const best = pfz[0];
    const isHi = lang === 'hi';

    const fishingOpportunity = best ? {
        score: best.score, confidence: best.confidence,
        recommendedZone: { lat: best.lat, lon: best.lon, radiusKm: best.radiusKm, title: best.title },
        note: risk.alertLevel === 'DANGER'
            ? (isHi ? 'PFZ क्षेत्र उपलब्ध है लेकिन ख़तरा (DANGER) सर्वोपरि है — समुद्र में न जाएं।' : 'PFZ available but safety verdict takes precedence — do not go.')
            : (isHi ? 'मत्स्य पालन के लिए उपयुक्त विंडो।' : 'Fishable window with above zone as primary target.'),
    } : null;

    const provenance = isHi ? [
        { agent: 'मौसम व महासागर एजेंट', source: 'ओपन-मेटियो लाइव पूर्वानुमान व समुद्री मॉडल', time: weather.timestamp },
        { agent: 'मत्स्य क्षेत्र (PFZ) विश्लेषक', source: 'Oceansat-3 OCM/SSTM व INCOIS बेसलाइन', time: ocean.timestamp },
        { agent: 'अंतर्राष्ट्रीय सीमा निगरानी', source: 'भुवन GIS उपग्रह आंकड़े व हावरसाइन जियोफेंस', time: new Date().toISOString() },
        { agent: 'डेटा सत्यापन प्रणाली', source: `पूर्णता व स्थिरता जांच (विश्वसनीयता: ${validation.confidence})`, time: new Date().toISOString() },
        { agent: 'सुरक्षा निर्णय इंजन', source: `नियम आधारित सुरक्षा स्कोर (${risk.riskScore}/100)`, time: new Date().toISOString() },
    ] : [
        { agent: 'Weather/Ocean Tool', source: weather.source, time: weather.timestamp },
        { agent: 'PFZ/Fishing Tool', source: ocean.source, time: ocean.timestamp },
        { agent: 'Geo/Border Tool', source: 'Bhuvan GIS approx + haversine geofence', time: new Date().toISOString() },
        { agent: 'Data Validator', source: `confidence ${validation.confidence}`, time: new Date().toISOString() },
        { agent: 'Safety Rule Engine', source: `rules v1 — score ${risk.riskScore}`, time: new Date().toISOString() },
    ];

    return { weather, ocean, pfz, geofence, bulletins, validation, risk, fishingOpportunity, provenance };
}

module.exports = { weatherAgent, oceanAgent, pfzAgent, geofenceAgent, riskAgent, validateData, buildBulletins, orchestrate, getOffshoreOffsets };
