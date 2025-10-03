const functions = require('firebase-functions');

// Set environment variables from Firebase config for compatibility
const config = functions.config();
if (config.openai && config.openai.api_key) {
  process.env.OPENAI_API_KEY = config.openai.api_key;
}
if (config.openweather && config.openweather.api_key) {
  process.env.OPENWEATHER_API_KEY = config.openweather.api_key;
}

// It needs to go to lib directory
const app = require('./lib/app');

exports.analyze = functions.https.onRequest(app);
