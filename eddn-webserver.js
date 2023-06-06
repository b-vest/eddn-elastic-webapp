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

//In this version of the script we will store cache data in a global variable
var runtimeObject = {
	health: {}
};

fetchHealthAndStore();

// Serve static files
app.use(express.static('public'));

// WebSocket connection handling
wss.on('connection', (ws) => {
  // Handle WebSocket events
  ws.on('message', (message) => {
    // Process WebSocket messages
    console.log(`Received message: ${message}`);
    const fromClient = JSON.parse(message);
    console.log(fromClient);
    console.log(runtimeObject);
    if(fromClient.function === "sendHealth"){
    	const sendObject = {
    		function: "renderHealth",
    		health: runtimeObject.health
    	}
    	ws.send(JSON.stringify(sendObject));
    }
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
async function fetchHealthAndStore() {
  const healthStatus = await getClusterHealth();
  if (healthStatus) {
  	//Prcess Data for Print
    //broadcastData({ health: healthStatus });
  	runtimeObject['health'] = healthStatus;
  	//console.log(runtimeObject);
  }
}

// Schedule the function to run every 5 seconds
setInterval(fetchHealthAndStore, 5000);
