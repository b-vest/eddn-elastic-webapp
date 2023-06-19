  const INTERVAL_TIME = 10000; // 10 seconds

  let ctxCPU = document.getElementById('canvasSystemCPU');
  let cpuChart;

  let ctxLoad = document.getElementById('canvasSystemLoad');
  let loadChart;
socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');
  // You can send data to the server using socket.send()
    var sendToServer = {
    function:"sendSystemStats"
  }
  socket.send(JSON.stringify(sendToServer));
});



socket.addEventListener('message', function (event) {
  //console.log('Message from server:', event);
  const serverData = JSON.parse(event.data);
  console.log(serverData);
  if(serverData.function === "rendrSystemStats"){
    if(!cpuChart){
      renderSystemCPUHistogram(serverData.systemMetrics.systemCPU);
    }else{
      updateSystemCPUHistogram(serverData.systemMetrics.systemCPU);
    }
    if(!loadChart){
      renderSystemLoadHistogram(serverData.systemMetrics.systemLoad);
    }else{
      updateSystemLoadHistogram(serverData.systemMetrics.systemLoad);
    }

  }
});


function randomRgbColor() {

    let r = randomInteger(255);

    let g = randomInteger(255);

    let b = randomInteger(255);

    return [r,g,b];

}
function renderSystemCPUHistogram(trafficArrays){
  trafficArrays.labels = trafficArrays.labels.map(convertToLocalTime);

  console.log("Creating Chart");
  cpuChart = new Chart(ctxCPU, {
    type: 'line',
    data: trafficArrays,
    options: {
      scales: {
        xAxes: [{
          position: 'bottom',
          min: 0, // My use case requires starting at zero
          beginAtZero: true,
          ticks: {
            maxTicksLimit: 4,
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



function renderSystemLoadHistogram(trafficArrays){
  trafficArrays.labels = trafficArrays.labels.map(convertToLocalTime);

  console.log("Creating Chart");
  loadChart = new Chart(ctxLoad, {
    type: 'line',
    data: trafficArrays,
    options: {
      scales: {
        xAxes: [{
          position: 'bottom',
          min: 0, // My use case requires starting at zero
          beginAtZero: true,
          ticks: {
            maxTicksLimit: 4,
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

function updateSystemCPUHistogram(preprocessedData){
    // First clear old data
    cpuChart.data.labels.length = 0;
    cpuChart.data.datasets.length = 0;
    preprocessedData.labels = preprocessedData.labels.map(convertToLocalTime);
    // Then add new data 
    preprocessedData.labels.forEach(label => cpuChart.data.labels.push(label));
    preprocessedData.datasets.forEach(dataset => cpuChart.data.datasets.push(dataset));
    
    // Lastly, update the chart
    cpuChart.update();
}

function updateSystemLoadHistogram(preprocessedData){
    // First clear old data
    loadChart.data.labels.length = 0;
    loadChart.data.datasets.length = 0;
    preprocessedData.labels = preprocessedData.labels.map(convertToLocalTime);
    // Then add new data 
    preprocessedData.labels.forEach(label => loadChart.data.labels.push(label));
    preprocessedData.datasets.forEach(dataset => loadChart.data.datasets.push(dataset));
    
    // Lastly, update the chart
    loadChart.update();
}

function convertToLocalTime(utcTimestamp) {
  console.log("Converting Time");
  const timePieces = new Date(utcTimestamp).toLocaleString();
  const timeArray = timePieces.split(",");
  return timeArray[1];
}



function sendSystemResourceData() {
  const sendToServer = {
    function: "sendSystemStats"
  }
  socket.send(JSON.stringify(sendToServer));
}


const button = document.getElementById("updateButton");

button.addEventListener("click", function() {
  if (button.innerText === "Enable Realtime Updates") {
    button.classList.replace("btn-primary", "btn-success");
    button.innerText = "Realtime Updates Running";
    intervalTimer = setInterval(sendSystemResourceData, INTERVAL_TIME);
  } else {
    button.classList.replace("btn-success", "btn-primary");
    button.innerText = "Enable Realtime Updates";
    clearInterval(intervalTimer);
  }
});
