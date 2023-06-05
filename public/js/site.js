
//Key List for Cluster Health Items to Print
const healthKey = {
	cluster_name: "Cluster Name",
	status: "Overall Status",
	number_of_nodes: "# Nodes",
	number_of_data_nodes: "# Data Nodes",
	unassigned_shards: "# Unassigned",
	number_of_pending_tasks: "# Pending Tasks"
}

const socket = new WebSocket('ws://172.16.1.252:3000');

// Connection opened
socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');
  // You can send data to the server using socket.send()
  socket.send('Hello Server!');
});

// Listen for messages from the server
socket.addEventListener('message', function (event) {
  console.log('Message from server:', event.data);
  var table = document.createElement('table');
const jsonData = JSON.parse(event.data);
const healthData = jsonData.health;
for (const key in healthData) {
	if(healthKey[key]){
  		const row = table.insertRow();
  		const cell1 = row.insertCell();
  		const cell2 = row.insertCell();
  		cell1.textContent = healthKey[key];
  		cell2.textContent = healthData[key];
  		console.log(key);
  	}
}
d = new Date();



const nodeStatusCol = document.getElementById('nodeStatusCol');
nodeStatusCol.innerHTML = "";
nodeStatusCol.appendChild(table);
nodeStatusCol.innerHTML += "<p>"+d.toLocaleString()+"<\p>";
});

// Connection closed
socket.addEventListener('close', function (event) {
  console.log('WebSocket connection closed');
});


function responsive() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}