const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const { Client } = require('@elastic/elasticsearch')


const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

const esClient = new Client({
  node: 'http://localhost:9200', // Elasticsearch node URL
  auth: null, // No authentication required
});


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



// Function to get the Elasticsearch health status
async function getClusterHealth() {
  try {
    const { body } = await esClient.cluster.health();
    return body;
  } catch (error) {
    console.error('Error getting cluster health:', error);
    return null;
  }
}

// Function to send data to all connected WebSocket clients
function broadcastData(data) {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
}

// Function to continuously fetch Elasticsearch health status and broadcast to WebSocket clients
async function fetchHealthAndBroadcast() {
  const healthStatus = await getClusterHealth();
  if (healthStatus) {
    broadcastData({ health: healthStatus });
  }
}

// Schedule the function to run every 5 seconds
setInterval(fetchHealthAndBroadcast, 5000);
