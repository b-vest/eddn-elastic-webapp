const socket = new WebSocket('ws://172.16.1.252:3000');

// Connection opened
socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');
  // You can send data to the server using socket.send()
    var sendToServer = {
    function:"bootstrapStarMap"
  }
  socket.send(JSON.stringify(sendToServer));
});

// Listen for messages from the server
socket.addEventListener('message', function (event) {
  console.log('Message from server:', event);
  const serverData = JSON.parse(event.data);
  
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
