const serverless = require('serverless-http');
const app = require('../../server');

// Wrap the app for serverless execution
const handler = serverless(app);
module.exports.handler = handler;