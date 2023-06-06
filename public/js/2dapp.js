const socket = new WebSocket('ws://172.16.1.252:3000');

// Connection opened
socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');
  // You can send data to the server using socket.send()
  socket.send('Hello Server!');
});

// Listen for messages from the server
socket.addEventListener('message', function (event) {
  console.log('Message from server:', event);
  const jsonData = JSON.parse(event.data);
 
d = new Date();

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