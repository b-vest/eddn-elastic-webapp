const express = require('express');
const http = require('http');
const WebSocket = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Serve static files
app.use(express.static('public'));

// WebSocket connection handling
wss.on('connection', (ws) => {
  // Handle WebSocket events
  ws.on('message', (message) => {
    // Process WebSocket messages
    console.log(`Received message: ${message}`);
  });

  // Send WebSocket messages
  ws.send('Connected to WebSocket server');
});

// Start the server
server.listen(3000, () => {
  console.log('Server started on port 3000');
});
