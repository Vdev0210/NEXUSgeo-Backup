const serverless = require('serverless-http');
// It needs to go UP one directory to find server.js in the root
const app = require('../server'); 

// Wrap the app for serverless execution
const handler = serverless(app);
module.exports.handler = handler;