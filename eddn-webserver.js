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

fetchAndStore();

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
    if(fromClient.function === "sendRawData"){
    	const sendObject = {
    		function: "renderRawData",
    		rawData: runtimeObject.rawData
    	}
    	ws.send(JSON.stringify(sendObject));
    }
    if(fromClient.function === "sendEventHistogram"){
    	const sendObject = {
    		function: "renderEventHistogram",
    		lineGraphData: runtimeObject.eventLineHistogram
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
	console.log("Running Fetch and Store")
  const healthStatus = await getClusterHealth();
  if (healthStatus) {
  	runtimeObject['health'] = healthStatus;
  }
  runtimeObject['rawData'] = await getRawData("",100);
  //console.log(rawData.hits);
  runtimeObject["eventLineHistogram"] = await getEventLineGraph();

  runtimeObject["starMap"] = await getStarMap();
  console.log(runtimeObject);
}


async function getStarMap(){
	const starQuery = {
		"index": 'stellar_body_index',
		"body":{
  "track_total_hits": false,
  "sort": [
    {
      "timestamp": {
        "order": "desc",
        "unmapped_type": "boolean"
      }
    }
  ],
  "fields": [
    {
      "field": "*",
      "include_unmapped": "true"
    },
    {
      "field": "timestamp",
      "format": "strict_date_optional_time"
    }
  ],
  "size": 5000,
  "version": true,
  "script_fields": {},
  "stored_fields": [
    "*"
  ],
  "runtime_mappings": {},
  "_source": false,
  "query": {
    "bool": {
      "must": [],
      "filter": [
        {
          "bool": {
            "filter": [
              {
                "bool": {
                  "should": [
                    {
                      "match": {
                        "event": "Scan"
                      }
                    }
                  ],
                  "minimum_should_match": 1
                }
              },
              {
                "bool": {
                  "should": [
                    {
                      "exists": {
                        "field": "StarType"
                      }
                    }
                  ],
                  "minimum_should_match": 1
                }
              },
              {
                "bool": {
                  "should": [
                    {
                      "match": {
                        "DistanceFromArrivalLS": "0.0"
                      }
                    }
                  ],
                  "minimum_should_match": 1
                }
              }
            ]
          }
        }
      ],
      "should": [],
      "must_not": []
    }
  }
}
};
	try{
		const rawData = await esClient.search(
  			starQuery
		);
		return rawData.body;

	} catch(error){
		console.log(error)
	}
	return;

}


async function getEventLineGraph(){
	const lineQuery =	{
		"index": 'stellar_body_index',
		"body":{
  		"aggs": {
    		"Timestamp": {
      			"date_histogram": {
        			"field": "timestamp",
        			"calendar_interval": "1m",
        			"time_zone": "America/New_York",
        			"min_doc_count": 1
      			},
      			"aggs": {
        			"Event": {
          				"terms": {
            				"field": "event",
            				"order": {
              					"_count": "desc"
            				},
            				"size": 5
          				}
      				}
      			}
    		}
  		},
  		"size": 0,
  		"script_fields": {},
  		"stored_fields": [
    		"*"
  		],
  		"runtime_mappings": {},
  		"query": {
    		"bool": {
      			"must": [],
      			"filter": [
      				{
          				"range": {
            				"timestamp": {
              					"format": "strict_date_optional_time",
              					"gte": "now-1h/h",
              					"lte": "now/h"
            				}
          				}
        			}
      			],
      			"should": [],
      			"must_not": []
    		}
  		}
	}
};


console.log(lineQuery);

	try{
		const rawData = await esClient.search(
  			lineQuery
		);
		return rawData.body;

	} catch(error){
		console.log(error)
	}
	return;
}


// Schedule the function to run every 5 seconds
setInterval(fetchAndStore, 5000);
