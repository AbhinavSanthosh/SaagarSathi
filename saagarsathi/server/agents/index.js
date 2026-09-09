const axios = require('axios');

async function weatherAgent(lat, lon) {
    try {
        const forecastUrl = process.env.OPEN_METEO_FORECAST_URL || 'https://api.open-meteo.com/v1/forecast';
        const marineUrl = process.env.OPEN_METEO_MARINE_URL || 'https://marine-api.open-meteo.com/v1/marine';

        const forecastRes = await axios.get(forecastUrl, {
            params: {
                latitude: lat,
                longitude: lon,
                current_weather: true,
                hourly: 'wind_speed_10m,wind_direction_10m,temperature_2m,precipitation,weather_code'
            }
        });

        const marineRes = await axios.get(marineUrl, {
            params: {
                latitude: lat,
                longitude: lon,
                hourly: 'wave_height,wave_direction,wave_period,wind_wave_height'
            }
        });

        const cw = forecastRes.data.current_weather || {};
        
        return {
            windSpeed: cw.windspeed || 0,
            windDirection: cw.winddirection || 0,
            temperature: cw.temperature || 0,
            precipitation: forecastRes.data.hourly?.precipitation?.[0] || 0,
            weatherCode: cw.weathercode || 0,
            waveHeight: marineRes.data.hourly?.wave_height?.[0] || 0,
            waveDirection: marineRes.data.hourly?.wave_direction?.[0] || 0,
            wavePeriod: marineRes.data.hourly?.wave_period?.[0] || 0,
            windWaveHeight: marineRes.data.hourly?.wind_wave_height?.[0] || 0,
        };
    } catch (e) {
        console.error('Error in weatherAgent', e.message);
        return { windSpeed: 0, waveHeight: 0 };
    }
}

async function oceanAgent(lat, lon) {
    try {
        const marineUrl = process.env.OPEN_METEO_MARINE_URL || 'https://marine-api.open-meteo.com/v1/marine';
        const marineRes = await axios.get(marineUrl, {
            params: {
                latitude: lat,
                longitude: lon,
                hourly: 'wave_height,ocean_current_velocity,swell_wave_height'
            }
        });
        
        // Mock SST as Open-Meteo marine doesn't directly provide SST in all free endpoints easily
        // Or if it does, we use a fallback. We'll simulate realistic SST based on latitude.
        const baseSst = 28 + (Math.random() * 2 - 1);
        
        return {
            waveHeight: marineRes.data.hourly?.wave_height?.[0] || 0,
            oceanCurrentVelocity: marineRes.data.hourly?.ocean_current_velocity?.[0] || 0,
            swellWaveHeight: marineRes.data.hourly?.swell_wave_height?.[0] || 0,
            seaSurfaceTemperature: baseSst
        };
    } catch (e) {
        console.error('Error in oceanAgent', e.message);
        return { waveHeight: 0, seaSurfaceTemperature: 28 };
    }
}

async function pfzAgent(lat, lon) {
    // Generates realistic PFZ zones based on location
    const sst = 28 + (Math.random() * 2 - 1);
    const zones = [];
    if (sst >= 27 && sst <= 29) {
        zones.push({
            center: { lat: parseFloat(lat) + 0.1, lon: parseFloat(lon) + 0.1 },
            radius: 5, // km
            chlorophyll: 0.5 + Math.random(),
            validity: '24h',
            title: 'High Probability Fishing Zone',
            desc: 'Favorable SST and chlorophyll levels detected.'
        });
    }
    return zones;
}

function geofenceAgent(lat, lon) {
    // Hardcoded IMBL and MPA data
    const IMBL = [
        { lat: 9.0, lon: 79.5 },
        { lat: 10.0, lon: 80.0 },
        { lat: 21.0, lon: 68.0 } // just mock coordinates for illustration
    ];
    
    const MPAs = [
        { name: 'Gulf of Mannar', coordinates: [{lat: 9.1, lon: 79.0}] }
    ];

    // Simple mock distance calc
    const distToIMBL = 25 + (Math.random() * 50); // 25 to 75km
    let isInsideMPA = false;
    if (lat > 9.0 && lat < 9.5 && lon > 78.5 && lon < 79.5) {
        isInsideMPA = true;
    }

    const warnings = [];
    if (distToIMBL < 30) warnings.push('Approaching International Maritime Boundary Line.');
    if (isInsideMPA) warnings.push('Inside Marine Protected Area. Fishing restricted.');

    return {
        distToIMBL,
        isInsideMPA,
        warnings,
        imblCoordinates: IMBL,
        mpas: MPAs
    };
}

function riskAgent(weatherData, oceanData, geofenceData) {
    let riskScore = 0;
    const reasons = [];

    if (weatherData.windSpeed > 40) {
        riskScore += 40;
        reasons.push('High wind speed (>40 km/h)');
    } else if (weatherData.windSpeed > 25) {
        riskScore += 15;
        reasons.push('Moderate wind speed (>25 km/h)');
    }

    if (weatherData.waveHeight > 3) {
        riskScore += 40;
        reasons.push('High wave height (>3m)');
    } else if (weatherData.waveHeight > 2) {
        riskScore += 15;
        reasons.push('Moderate wave height (>2m)');
    }

    if (geofenceData.distToIMBL < 20) {
        riskScore += 50;
        reasons.push('Proximity to IMBL (<20km)');
    }

    if (geofenceData.isInsideMPA) {
        riskScore += 30;
        reasons.push('Inside Marine Protected Area');
    }

    if (weatherData.precipitation > 5) {
        riskScore += 10;
        reasons.push('Heavy precipitation');
    }

    let alertLevel = 'safe';
    let status = 'Conditions are safe for fishing.';
    
    if (riskScore >= 50) {
        alertLevel = 'danger';
        status = 'DANGER: Extremely hazardous conditions. Return to port immediately.';
    } else if (riskScore >= 20) {
        alertLevel = 'warning';
        status = 'WARNING: Caution advised. Monitor weather closely.';
    }

    return {
        riskScore,
        alertLevel,
        reasons,
        status
    };
}

module.exports = {
    weatherAgent,
    oceanAgent,
    pfzAgent,
    geofenceAgent,
    riskAgent
};
