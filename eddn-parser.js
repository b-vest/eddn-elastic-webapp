const { Client } = require('@elastic/elasticsearch')
const zlib = require('zlib');
const zmq = require('zeromq');

const SOURCE_URL = 'tcp://eddn.edcd.io:9500';
const esClient = new Client({
  node: 'http://localhost:9200', // Elasticsearch node URL
  auth: null, // No authentication required
});

async function run() {
  const sock = new zmq.Subscriber;

  sock.connect(SOURCE_URL);
  sock.subscribe('');
  console.log('EDDN listener connected to:', SOURCE_URL);

  for await (const [src] of sock) {
    const msg = JSON.parse(zlib.inflateSync(src));
    if(msg.message.event === "Scan" || msg.message.event === "FSDJump"){
      //We need to clean up the message a bit
      //We need to extract the star
      //console.log(JSON.stringify(msg.message));
      ingestDocument("stellar_body_index", msg.message);
    }
  }
}

run();

async function ingestDocument(index, readyDocument){
  try {
    // Index the document
    const { body } = await esClient.index({
      index,
      body: readyDocument,
    });

    //console.log('Document indexed successfully:', body);
  } catch (error) {
    console.error('Error indexing document:', error);
  }
}