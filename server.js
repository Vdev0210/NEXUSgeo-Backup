const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Serve static files (HTML, CSS, JS) from the root directory
app.use(express.static('public'));

// --- AI Analysis Endpoint ---

// Initialize Google Generative AI
// Make sure your GOOGLE_API_KEY is set in your .env file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);
let openai;
if (process.env.OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// --- Diagnostic Logging ---
// This will help verify if the API keys are loaded correctly.
// It shows 'undefined' if the key is missing or just the first few characters if it's present.
console.log(`Google API Key loaded: ${process.env.GOOGLE_API_KEY ? 'Yes, starts with ' + process.env.GOOGLE_API_KEY.substring(0, 4) : 'No (undefined)'}`);
console.log(`OpenAI API Key loaded: ${process.env.OPENAI_API_KEY ? 'Yes, starts with ' + process.env.OPENAI_API_KEY.substring(0, 4) : 'No (undefined)'}`);
console.log(`OpenWeather API Key loaded: ${OPENWEATHER_API_KEY ? 'Yes, starts with ' + OPENWEATHER_API_KEY.substring(0, 4) : 'No (undefined)'}`);
// --------------------------

app.post('/analyze', async (req, res) => {
  // Expect a 'history' array from the frontend
  const { history } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'A "history" array is required.' });
  }

  // Add a check to ensure the API key is loaded before proceeding
  if (!process.env.GOOGLE_API_KEY) {
    console.error('Google API Key is missing. Cannot process AI request.');
    return res.status(500).json({ error: 'Server is missing the Google API Key configuration.' });
  }

  try {
    console.log('Attempting AI analysis with Gemini...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    // The history from the client already includes the latest user message.
    // We separate the last message to send it, and use the rest as context.
    const lastUserMessage = history[history.length - 1];
    // The history for the model should be all messages *before* the last one.
    const chatHistoryForModel = history.slice(0, history.length - 1);

    const chat = model.startChat({ history: chatHistoryForModel });

    // Ensure we are sending a valid text string to the model.
    if (!lastUserMessage || !lastUserMessage.parts || !lastUserMessage.parts[0] || !lastUserMessage.parts[0].text) {
      throw new Error('Invalid user message format in history.');
    }
    const result = await chat.sendMessage(lastUserMessage.parts[0].text);
    const response = await result.response;
    const text = response.text();

    console.log('Gemini analysis successful.');
    res.json({ summary: text });
  } catch (error) {
    console.error('Error with Gemini:', error.message);
    if (error.status === 429 || error.message.includes('429') || error.message.includes('Too Many Requests')) {
      console.log('Gemini quota exceeded, falling back to OpenAI...');
      if (!process.env.OPENAI_API_KEY) {
        console.error('OpenAI API Key is missing. Cannot fallback.');
        return res.status(500).json({ error: 'AI analysis unavailable: Gemini quota exceeded and OpenAI key not configured.' });
      }
      try {
        // Format history for OpenAI
        const messages = history.map(msg => ({
          role: msg.role === 'model' ? 'assistant' : msg.role,
          content: msg.parts[0].text
        }));

        const completion = await openai.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: messages,
        });

        const text = completion.choices[0].message.content;
        console.log('OpenAI analysis successful.');
        res.json({ summary: text });
      } catch (openaiError) {
        console.error('Error with OpenAI fallback:', openaiError.message);
        res.status(500).json({ error: `Failed to generate AI analysis with both Gemini and OpenAI. Details: ${openaiError.message}` });
      }
    } else {
      res.status(500).json({ error: `Failed to generate AI analysis. Details: ${error.message}` });
    }
  }
});

// --- Weather and Air Quality Endpoints ---

const handleApiError = (error, res, serviceName) => {
  console.error(`Error with ${serviceName}:`, error.response ? error.response.data : error.message);
  const status = error.response ? error.response.status : 500;
  const message = error.response ? error.response.data.message : `Failed to fetch data from ${serviceName}.`;
  res.status(status).json({ error: message });
};

app.get('/weather/current', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude are required.' });
  if (!OPENWEATHER_API_KEY) return res.status(500).json({ error: 'OpenWeather API Key is missing.' });
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, 'OpenWeather Current');
  }
});

app.get('/weather/forecast', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude are required.' });
  if (!OPENWEATHER_API_KEY) return res.status(500).json({ error: 'OpenWeather API Key is missing.' });
  try {
    const apiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, 'OpenWeather Forecast');
  }
});

app.get('/weather/air-quality', async (req, res) => {
  const { lat, lon } = req.query;
  if (!lat || !lon) return res.status(400).json({ error: 'Latitude and longitude are required.' });
  if (!OPENWEATHER_API_KEY) return res.status(500).json({ error: 'OpenWeather API Key is missing.' });
  try {
    // Use the standard API endpoint for air pollution data
    const apiUrl = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
    const response = await axios.get(apiUrl);
    res.json(response.data);
  } catch (error) {
    handleApiError(error, res, 'OpenWeather Air Quality');
  }
});


// Export the app for serverless environments like Netlify
module.exports = app;

// Start the server only when this file is run directly (for local development)
if (require.main === module) {
  const port = 3000;
  app.listen(port, () => {
    console.log(`Server with AI analysis endpoint running on http://localhost:${port}`);
  });
}