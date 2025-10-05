const express = require('express');
const cors = require('cors');
const serverless = require('serverless-http');
const bodyParser = require('body-parser');
const OpenAI = require('openai');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

let openai;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
if (OPENAI_API_KEY) {
  openai = new OpenAI({ apiKey: OPENAI_API_KEY });
}
const OPENWEATHER_API_KEY = process.env.OPENWEATHER_API_KEY;

// --- Diagnostic Logging ---
// This will help verify if the API keys are loaded correctly.
// It shows 'undefined' if the key is missing or just the first few characters if it's present.
console.log(`OpenAI API Key loaded: ${OPENAI_API_KEY ? 'Yes, starts with ' + OPENAI_API_KEY.substring(0, 4) : 'No (undefined)'}`);
console.log(`OpenWeather API Key loaded: ${OPENWEATHER_API_KEY ? 'Yes, starts with ' + OPENWEATHER_API_KEY.substring(0, 4) : 'No (undefined)'}`);
// --------------------------

app.post('/analyze', async (req, res) => {
  // Expect a 'history' array from the frontend
  const { history } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'A "history" array is required.' });
  }

  // Add a check to ensure the API key is loaded before proceeding
  if (!OPENAI_API_KEY) {
    console.error('OpenAI API Key is missing. Cannot process AI request.');
    return res.status(500).json({ error: 'Server is missing the OpenAI API Key configuration.' });
  }

  try {
    console.log('Attempting AI analysis with OpenAI...');

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
  } catch (error) {
    console.error('Error with OpenAI:', error.message);
    res.status(500).json({ error: `Failed to generate AI analysis. Details: ${error.message}` });
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


// Test route for debugging
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running', timestamp: new Date().toISOString() });
});

// Wrap the app for serverless deployment
module.exports.handler = serverless(app);
