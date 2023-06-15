const fs = require('fs');
const path = require('path');
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
	health: {},
  eddn2d:{},
  systemmetrics: {},
  queries:{}
};

const directoryPath = './es-queries';

fetchAndStore();

// Serve static files
app.use(express.static('public'));

// WebSocket connection handling
wss.on('connection', (ws) => {
  // Handle WebSocket events
  ws.on('message', (message) => {
    // Process WebSocket messages
    const fromClient = JSON.parse(message);
    if(fromClient.function === "sendHealth"){
    	const sendObject = {
    		function: "renderHealth",
    		health: runtimeObject.health
    	}
    	ws.send(JSON.stringify(sendObject));
    }
    if(fromClient.function === "sendRawData"){
    	const sendObject = {
    		function: "renderRawData",
    		rawData: runtimeObject.rawData
    	}
    	ws.send(JSON.stringify(sendObject));
    }
    if(fromClient.function === "sendInitial2dDataload"){
    	const sendObject = {
    		function: "renderAllEDDN2D",
    		eddn2d: runtimeObject.eddn2d
    	}
    	ws.send(JSON.stringify(sendObject));
    }
    if(fromClient.function === "bootstrapStarMap"){
    	const sendObject = {
    		function: "renderStarMap",
    		starMapData: runtimeObject.starMapData
    	}
    	ws.send(JSON.stringify(sendObject));
    }
    if(fromClient.function === "sendSystemStats"){
      const sendObject = {
        function: "rendrSystemStats",
        systemMetrics: runtimeObject.systemmetrics
      }
      ws.send(JSON.stringify(sendObject));
    }
  });

  // Send WebSocket messages
  //ws.send('Connected to WebSocket server');
});

// Start the server
server.listen(3000, () => {
  console.log('Server started on port 3000');
});


async function loadQueries(directoryPath, runtimeObject) {
  // Initialize queries object
  var theseQueries = {};

  try {
    // Read files from the directory
    const files = await fs.promises.readdir(directoryPath);

    // Read and process each file
    for (const file of files) {
      const filePath = path.join(directoryPath, file);
      const fileName = file.split('.')[0]; // Get the first part of the file name

      // Read file content
      const content = await readFile(filePath);

      // Add file content to the queries object
      theseQueries[fileName] = JSON.parse(content);
    }
    return theseQueries;
    console.log('Queries:', runtimeObject.queries);
  } catch (error) {
    console.error('Error loading queries:', error);
  }
}

function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}

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

async function getRawData(body,size){
	try{
		const rawData = await esClient.search({
  			index: 'stellar_body_index',
  			size: size
		});
		return rawData.body;

	} catch(error){
		console.log(error)
	}
	return;
}

// Function to continuously fetch Elasticsearch health status and broadcast to WebSocket clients
async function fetchAndStore() {

  runtimeObject.queries = await loadQueries(directoryPath);
  console.log(runtimeObject.queries);
  
  const healthStatus = await getClusterHealth();
  if (healthStatus) {
  	runtimeObject['health'] = healthStatus;
  }
  runtimeObject['rawData'] = await getRawData("",100);


  runtimeObject.eddn2d["eventLineHistogram"] = await queryElasticsearch(runtimeObject.queries.getEventLineGraph);

  const starMapRawData = await queryElasticsearch(runtimeObject.queries.starMapQuery);
  runtimeObject["starMapData"] = processStarMap(starMapRawData.hits.hits); 
  runtimeObject.eddn2d["starTypeBarChart"] = await queryElasticsearch(runtimeObject.queries.getStarTypeCount);
  runtimeObject.systemmetrics["systemCPU"] = await queryElasticsearch(runtimeObject.queries.systemCPUQuery);
  runtimeObject.httpResponseHistogram = await queryElasticsearch(runtimeObject.queries.httpResponseHistogram);
  runtimeObject.systemmetrics["systemLoad"] = await queryElasticsearch(runtimeObject.queries.systemLoadQuery);

  console.log(runtimeObject.systemmetrics.systemCPU);


}

async function queryElasticsearch(query){

    try{
      const rawData = await esClient.search(query);
      return rawData.body;

    } catch(error){
      console.log(error)
    }
    return;
}


function readFile(filePath) {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, 'utf8', (err, content) => {
      if (err) {
        reject(err);
      } else {
        resolve(content);
      }
    });
  });
}



function processStarMap(starMapData){

	var processedData = [];

	for (const key in starMapData) {
		const thisStar = {
			starPosition: starMapData[key].fields.StarPos,
			surfaceTemp: starMapData[key].fields.SurfaceTemperature[0],
			starRadius: starMapData[key].fields.Radius[0],
		}
		processedData.push(thisStar);
	}
	return processedData;

}


// Schedule the function to run every 5 seconds
setInterval(fetchAndStore, 5000);
