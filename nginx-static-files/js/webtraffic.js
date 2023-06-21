const INTERVAL_TIME = 10000; // 10 seconds

let ctx;
let responseChart;
let intervalTimer;

socket.addEventListener('open', sendWebTrafficData);

socket.addEventListener('message', function (event) {
  const serverData = JSON.parse(event.data);
  if(serverData.function === "renderWebTrafficmetrics"){
    if(!ctx){
      renderHTTPResponseChart(serverData.httpResponseMetrics);
      renderHTTPClientTable(serverData.httpClientTable);
    }else{
      updateHTTPResponseChart(serverData.httpResponseMetrics);
      renderHTTPResponseChart(serverData.httpResponseMetrics);

    }
  }
});


function renderHTTPClientTable(preprocessedData){
  const table = document.getElementById('webTrafficTableBody');

  // Clear existing table rows
  table.innerHTML = '';

  // Iterate over each row of data
  preprocessedData.forEach((row) => {
    // Create a new row element
    const newRow = table.insertRow();

    // Iterate over each value in the row array and create a cell for it
    row.forEach((value, index) => {
      const newCell = newRow.insertCell();
      if (index === 0) {
        newCell.textContent = convertToLocalTime(value);
      }else{
      newCell.textContent = value;
      }
    });
  });

}



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

function sendWebTrafficData() {
  const sendToServer = {
    function: "sendWebTrafficData"
  }
  socket.send(JSON.stringify(sendToServer));
}

function convertToLocalTime(utcTimestamp) {
  console.log("Converting Time");
  const timePieces = new Date(utcTimestamp).toLocaleString();
  const timeArray = timePieces.split(",");
  return timeArray[1];
}

const button = document.getElementById("updateButton");

button.addEventListener("click", function() {
  if (button.innerText === "Enable Realtime Updates") {
    button.classList.replace("btn-primary", "btn-success");
    button.innerText = "Realtime Updates Running";
    intervalTimer = setInterval(sendWebTrafficData, INTERVAL_TIME);
  } else {
    button.classList.replace("btn-success", "btn-primary");
    button.innerText = "Enable Realtime Updates";
    clearInterval(intervalTimer);
  }
});
