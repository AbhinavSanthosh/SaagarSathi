require('dotenv').config({ path: '.env' });
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const {
    weatherAgent,
    oceanAgent,
    pfzAgent,
    geofenceAgent,
    riskAgent
} = require('./agents/index');

const { translateText } = require('./agents/bhashini');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// GET /api/weather
app.get('/api/weather', async (req, res) => {
    try {
        const lat = req.query.lat || 0;
        const lon = req.query.lon || 0;

        const weatherData = await weatherAgent(lat, lon);
        const oceanData = await oceanAgent(lat, lon);
        const geofenceData = geofenceAgent(lat, lon);
        const riskData = riskAgent(weatherData, oceanData, geofenceData);

        res.json({
            status: riskData.status,
            alertLevel: riskData.alertLevel,
            message: riskData.reasons.join('. ') || 'Safe conditions.',
            waveHeight: oceanData.waveHeight,
            windSpeed: weatherData.windSpeed,
            windDirection: weatherData.windDirection,
            precipitation: weatherData.precipitation,
            temperature: weatherData.temperature
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error fetching weather' });
    }
});

// GET /api/zones
app.get('/api/zones', async (req, res) => {
    try {
        const lat = req.query.lat || 0;
        const lon = req.query.lon || 0;

        const pfz = await pfzAgent(lat, lon);
        const geofenceData = geofenceAgent(lat, lon);
        
        const dangerZones = [];
        if (geofenceData.distToIMBL < 30) {
            dangerZones.push({
                coordinates: geofenceData.imblCoordinates,
                title: 'IMBL Proximity',
                desc: 'Close to International Maritime Boundary Line',
                wave: 0,
                dist: geofenceData.distToIMBL,
                type: 'boundary'
            });
        }
        if (geofenceData.isInsideMPA) {
             dangerZones.push({
                coordinates: geofenceData.mpas[0].coordinates,
                title: 'Marine Protected Area',
                desc: 'Fishing is restricted here',
                wave: 0,
                dist: 0,
                type: 'mpa'
            });
        }

        res.json({
            dangerZones,
            pfz,
            mpas: geofenceData.mpas,
            imbl: geofenceData.imblCoordinates.map(c => ({ coordinates: c }))
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error fetching zones' });
    }
});

// POST /api/chat
app.post('/api/chat', async (req, res) => {
    try {
        const { message, lang = 'en', context = {} } = req.body;
        const lat = context.lat || 0;
        const lon = context.lon || 0;

        // Fetch live context for prompt injection
        const weatherData = await weatherAgent(lat, lon);
        const oceanData = await oceanAgent(lat, lon);
        const geofenceData = geofenceAgent(lat, lon);
        const riskData = riskAgent(weatherData, oceanData, geofenceData);

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemPrompt = `You are SaagarSathi (ORCA), a marine safety advisory assistant for Indian fishermen.
Current context for the user:
- Location: Lat ${lat}, Lon ${lon}
- Weather: Wind ${weatherData.windSpeed} km/h, Temp ${weatherData.temperature}°C, Precipitation ${weatherData.precipitation} mm
- Ocean: Wave Height ${oceanData.waveHeight} m, SST ${oceanData.seaSurfaceTemperature}°C
- Risk Level: ${riskData.alertLevel.toUpperCase()}
- Status: ${riskData.status}
- IMBL Distance: ${geofenceData.distToIMBL.toFixed(2)} km

Answer the user's query safely, accurately, and concisely. Keep it simple as it is for fishermen.`;

        const fullPrompt = `${systemPrompt}\n\nUser Query: ${message}`;
        const result = await model.generateContent(fullPrompt);
        const englishResponse = result.response.text();

        // Translate response
        const translatedResponse = await translateText(englishResponse, lang);

        res.json({
            text: translatedResponse,
            citations: [
                { text: 'Open-Meteo Weather', url: process.env.OPEN_METEO_FORECAST_URL }
            ],
            chips: ['Current Weather', 'Fishing Zones', 'Emergency']
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error in chat' });
    }
});

// GET /api/analytics
app.get('/api/analytics', async (req, res) => {
    try {
        // Returns mock trends and anomalies for demonstration
        const sstTrends = Array.from({length: 7}, (_, i) => ({ day: i+1, value: 27 + Math.random()*2 }));
        const chlTrends = Array.from({length: 7}, (_, i) => ({ day: i+1, value: 0.2 + Math.random()*0.8 }));
        
        res.json({
            sstTrends,
            chlorophyllTrends: chlTrends,
            bulletins: [
                { source: 'IMD', message: 'No cyclone warning for next 48 hours.' },
                { source: 'INCOIS', message: 'High wave alert for coastal regions.' }
            ],
            anomaly: {
                detected: true,
                message: 'SST is 1.2°C higher than 7-day average.'
            }
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error in analytics' });
    }
});

// GET /api/orchestrator
app.get('/api/orchestrator', async (req, res) => {
    try {
        const lat = req.query.lat || 0;
        const lon = req.query.lon || 0;
        const lang = req.query.lang || 'en';

        // Call agents in parallel
        const [weatherData, oceanData, pfzData] = await Promise.all([
            weatherAgent(lat, lon),
            oceanAgent(lat, lon),
            pfzAgent(lat, lon)
        ]);

        const geofenceData = geofenceAgent(lat, lon);
        const riskData = riskAgent(weatherData, oceanData, geofenceData);

        const responseObj = {
            weather: weatherData,
            ocean: oceanData,
            pfz: pfzData,
            geofence: geofenceData,
            risk: riskData
        };

        res.json(responseObj);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error in orchestrator' });
    }
});

app.listen(PORT, () => {
    console.log(`SaagarSathi server listening on port ${PORT}`);
});
