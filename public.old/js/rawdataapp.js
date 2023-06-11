var path = window.location.pathname;
var page = path.split("/").pop();
console.log(page);

var socket;
if (window.location.protocol === "https:") {
   console.log("HTTPS");
   socket = new WebSocket('wss://'+window.location.hostname);
}else{
  console.log("HTTP");
  socket = new WebSocket('ws://'+window.location.hostname+':3000');
}

// Connection opened
socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');
  // You can send data to the server using socket.send()
  var sendToServer = {
  	function:"sendRawData"
  }
  socket.send(JSON.stringify(sendToServer));
});

// Listen for messages from the server
socket.addEventListener('message', function (event) {
  //console.log('Message from server:', event.data);
  const serverData = JSON.parse(event.data);
  console.log(serverData);
  if(serverData.function === "renderRawData"){
    renderRawDataTable(serverData.rawData.hits.hits);
  }

});

// Connection closed
socket.addEventListener('close', function (event) {
  console.log('WebSocket connection closed');
});




function renderRawDataTable(tableData){
  console.log("Redner Rad Data Table");
  
  var table = document.createElement('table');
  table.style.width = '100%';
  table.style.borderCollapse = 'collapse';
  table.style.border = '1px solid black';

  // Create the header row
  var headerRow = document.createElement('tr');

  // Add header cells to the header row
  var headerLabels = ['Timestamp', 'Event', 'Star System', 'Star Position'];
  for (var i = 0; i < headerLabels.length; i++) {
    var headerCell = document.createElement('th');
    headerCell.textContent = headerLabels[i];
  
    // Apply CSS styles to the header cells
    headerCell.style.borderBottom = '1px solid black';
    headerCell.style.padding = '10px';
    headerCell.style.textAlign = 'left'; // Shift text to the left
  
    // Append the header cell to the header row
    headerRow.appendChild(headerCell);
  }

  // Append the header row to the table
  table.appendChild(headerRow);
  for (const key in tableData) {

    console.log(`${key}: ${tableData[key]._source.event}`);
    const row = table.insertRow();
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    const cell3 = row.insertCell();
    const cell4 = row.insertCell();

    cell1.textContent = tableData[key]._source.timestamp;    
    cell2.textContent = tableData[key]._source.event;
    cell3.textContent = tableData[key]._source.StarSystem;    
    cell4.textContent = tableData[key]._source.StarPos;

        
    cell1.style.borderBottom = '1px solid black';
    cell2.style.borderBottom = '1px solid black';
    cell3.style.borderBottom = '1px solid black';
    cell4.style.borderBottom = '1px solid black';

    cell1.style.padding = '10px';
    cell2.style.padding = '10px';
    cell3.style.padding = '10px';
    cell4.style.padding = '10px';


  }
  d = new Date();

  const nodeStatusCol = document.getElementById('rawdataCol');
  nodeStatusCol.innerHTML = "";
  nodeStatusCol.appendChild(table);
}