const app = require('./lib/app');

// Start the server only when this file is run directly (for local development)
if (require.main === module) {
  const port = 3001;
  app.listen(port, () => {
    console.log(`Server with AI analysis endpoint running on http://localhost:${port}`);
  });
}
