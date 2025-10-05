// Load environment variables from .env file
require('dotenv').config();

// --- Centralized Configuration ---
// Read the API key from the environment.
const openWeatherApiKey = process.env.OPENWEATHER_API_KEY;

// Verify that the key was loaded correctly.
if (!openWeatherApiKey) {
  console.error('FATAL ERROR: OPENWEATHER_API_KEY is not defined in the .env file.');
  process.exit(1); // Exit the application if the key is missing.
}

// Pass the configuration to the main application logic.
// This assumes your app factory in './lib/app' can accept the key.
// Note: The app loads API keys from environment variables directly.
const app = require('./lib/app');

// Start the server only when this file is run directly (for local development)
if (require.main === module) {
  const port = 3001;
  app.listen(port, () => {
    console.log(`Server with AI analysis endpoint running on http://localhost:${port}`);
  });
}
