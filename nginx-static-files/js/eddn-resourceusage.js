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
    renderSystemLoadHistogram(serverData.systemMetrics.systemLoad.aggregations);
  }
});


function randomRgbColor() {

    let r = randomInteger(255);

    let g = randomInteger(255);

    let b = randomInteger(255);

    return [r,g,b];

}



function renderSystemLoadHistogram(systemLoadData){
  const ctx = document.getElementById('canvasSystemLoad');

  const systemLoad1 = [];
  const systemLoad2 = [];
  const systemLoad3 = [];
  const timeStamps = [];

  for (const bucket of systemLoadData.Timestamp.buckets) {
    console.log(bucket);
    const dateObject = new Date(bucket.key_as_string);
    var dateHours = dateObject.getHours();
    var dateMinutes = dateObject.getMinutes();
    var dateSeconds = dateObject.getSeconds();
    if (dateMinutes <= 9) {
      dateMinutes = "0" + dateMinutes;
    }
    if (dateHours <= 9) {
      dateHours = "0" + dateSeconds;
    }
    if (dateSeconds <= 9) {
      dateSeconds = "0" + dateSeconds;
    }
    const thisTimesatamp = dateHours + ":" + dateMinutes + ":" + dateSeconds;

    timeStamps.push(thisTimesatamp);
    systemLoad1.push(bucket.Load1.value);
    systemLoad2.push(bucket.Load5.value);
    systemLoad3.push(bucket.Load15.value)
  }

  console.log(systemLoad1);
    const data = {
    labels: timeStamps,
    datasets: [{
        label: 'Load 1 Minute',
        data: systemLoad1,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'Load 5 Minutes',
        data: systemLoad2,
        fill: false,
        borderColor: 'rgb(175, 92, 92)',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2,
      }, 
      {
        label: 'Load 15 Minutes',
        data: systemLoad3,
        fill: false,
        borderColor: 'rgb(175, 92, 92)',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2,
      }
    ]
  };



  const config = {
    type: 'line',
  };
  console.log("Creating Chart");
  new Chart(ctx, {
    type: 'line',
    data: data,
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
      }
    }
  });

}

