var ctx;
var responseChart;
socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');
  // You can send data to the server using socket.send()
    var sendToServer = {
    function:"sendWebTrafficData"
  }
  socket.send(JSON.stringify(sendToServer));
});


socket.addEventListener('message', function (event) {
  //console.log('Message from server:', event);
  const serverData = JSON.parse(event.data);
  //console.log(serverData);
  if(serverData.function === "renderWebTrafficmetrics"){
  	if(!ctx){
    	renderHTTPResponseChart(serverData.httpResponseMetrics);
  	}else{
  		updateHTTPResponseChart(serverData.httpResponseMetrics);
  	}
  }
});


function updateHTTPResponseChart(preprocessedData){
    // First clear old data
    responseChart.data.labels.length = 0;
    responseChart.data.datasets.length = 0;
	preprocessedData.labels = preprocessedData.labels.map(convertToLocalTime);
    // Then add new data 
    preprocessedData.labels.forEach(label => responseChart.data.labels.push(label));
    preprocessedData.datasets.forEach(dataset => responseChart.data.datasets.push(dataset));
    
    // Lastly, update the chart
    responseChart.update();
}

async function renderHTTPResponseChart(trafficArrays){
  	ctx = document.getElementById('webTraffic');
  	trafficArrays.labels = trafficArrays.labels.map(convertToLocalTime);

  	console.log(trafficArrays.labels);
  	responseChart = new Chart(ctx, {
    type: 'line',
    data: trafficArrays,
    options: {
      scales: {
        xAxes: [{
          position: 'bottom',
          min: 0, // My use case requires starting at zero
          beginAtZero: true,
          ticks: {
            maxTicksLimit: 6,
            maxRotation: 0,
            minRotation: 0
          }
        }]
      },
      animation: {
            duration: 0 // Disable animations
        }
    }
  });
}


function randomIntBetween(min,max){
  var thisRandom = Math.floor(Math.random()*(max - min + 1)) + min
  return thisRandom;
}  


function convertToLocalTime(utcTimestamp) {
	console.log("Converting Time");
  const timePieces = new Date(utcTimestamp).toLocaleString();
  const timeArray = timePieces.split(",");
  return timeArray[1];
}

// Get the button element
var button = document.getElementById("updateButton");

// Define the interval timer
var intervalTimer;

// Add the click event listener
button.addEventListener("click", function() {
    if (button.innerText === "Enable Realtime Updates") {
        // If updates were not running, start them

        // Change the button color to green
        button.classList.remove("btn-primary");
        button.classList.add("btn-success");

        // Change the button text
        button.innerText = "Realtime Updates Running";

        // Start the interval timer
        intervalTimer = setInterval(function() {
            // Code to be executed every interval goes here
            console.log("Interval triggered");
                var sendToServer = {
    				function:"sendWebTrafficData"
  				}
  				socket.send(JSON.stringify(sendToServer));
        }, 5000); // This interval is set to 5 seconds (5000 milliseconds). Adjust this number to your preference.
    } else {
        // If updates were running, stop them

        // Change the button color back to primary
        button.classList.remove("btn-success");
        button.classList.add("btn-primary");

        // Change the button text
        button.innerText = "Enable Realtime Updates";

        // Clear the interval timer
        clearInterval(intervalTimer);
    }
});