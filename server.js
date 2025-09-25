const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- AI Analysis Endpoint ---

// Initialize Google Generative AI
// Make sure your GOOGLE_API_KEY is set in your .env file
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

app.post('/analyze', async (req, res) => {
  // Expect a 'history' array from the frontend
  const { history } = req.body;

  if (!history || !Array.isArray(history)) {
    return res.status(400).json({ error: 'A "history" array is required.' });
  }

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' });

    // The history from the client already includes the latest user message.
    // We need to separate the last message from the rest of the history
    // to use the startChat method correctly.
    const lastUserMessage = history.pop().parts[0].text;
    const chat = model.startChat({ history });

    // Send the last message to the ongoing chat session that has the previous context.
    const result = await chat.sendMessage(lastUserMessage);
    const response = await result.response;
    const text = response.text();

    res.json({ summary: text });
  } catch (error) {
    console.error('Error with Generative AI:', error);
    res.status(500).json({ error: 'Failed to generate AI analysis.' });
  }
});


// Start server
// We will no longer start the server directly.
// Instead, we'll export the app for our serverless function wrapper.
module.exports = app;

const port = 3000;
app.listen(port, () => {
  console.log(`Server with AI analysis endpoint running on http://localhost:${port}`);
});