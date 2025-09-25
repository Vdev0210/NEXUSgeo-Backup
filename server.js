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
    // We separate the last message to send it, and use the rest as context.
    const lastUserMessage = history.pop();
    const chatHistoryForModel = history; // The rest of the array is the history

    const chat = model.startChat({ history: chatHistoryForModel });

    const result = await chat.sendMessage(lastUserMessage.parts[0].text);
    const response = await result.response;
    const text = response.text();

    res.json({ summary: text });
  } catch (error) {
    console.error('Error with Generative AI:', error);
    res.status(500).json({ error: 'Failed to generate AI analysis.' });
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