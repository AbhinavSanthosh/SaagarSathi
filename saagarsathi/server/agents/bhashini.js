const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const supportedLanguages = ['en', 'hi', 'ta', 'ml', 'te', 'gu', 'mr', 'bn', 'kn', 'od'];

async function translateWithBhashini(text, targetLang) {
    if (targetLang === 'en') return text;
    
    const userId = process.env.BHASHINI_USER_ID;
    const apiKey = process.env.BHASHINI_API_KEY;
    const pipelineUrl = process.env.BHASHINI_PIPELINE_URL;

    if (!userId || !apiKey || !pipelineUrl) {
        throw new Error('Bhashini credentials missing');
    }

    // Mock API call structure for Bhashini pipeline
    // In a real scenario, proper payload format mapped to Bhashini specs is required
    try {
        const response = await axios.post(
            pipelineUrl,
            {
                pipelineTasks: [{ taskType: 'translation', config: { language: { sourceLanguage: 'en', targetLanguage: targetLang } } }],
                inputData: { input: [{ source: text }] }
            },
            {
                headers: {
                    'userID': userId,
                    'Authorization': apiKey,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && response.data.pipelineResponse && response.data.pipelineResponse[0]) {
            return response.data.pipelineResponse[0].output[0].target;
        }
        throw new Error('Invalid Bhashini response');
    } catch (error) {
        throw error;
    }
}

async function translateWithGemini(text, targetLang) {
    if (targetLang === 'en') return text;

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Translate the following text to ISO 639-1 language code '${targetLang}'. Provide ONLY the translated text.\n\nText:\n${text}`;
    
    try {
        const result = await model.generateContent(prompt);
        return result.response.text().trim();
    } catch (e) {
        console.error('Gemini translation failed', e);
        return text; // fallback to English
    }
}

async function translateText(text, targetLang) {
    if (!supportedLanguages.includes(targetLang)) {
        targetLang = 'en';
    }

    if (targetLang === 'en') return text;

    try {
        // Try Bhashini first
        return await translateWithBhashini(text, targetLang);
    } catch (error) {
        console.log('Bhashini translation failed or unavailable, falling back to Gemini.');
        // Fallback to Gemini
        return await translateWithGemini(text, targetLang);
    }
}

module.exports = {
    translateText,
    supportedLanguages
};
