socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');
  // You can send data to the server using socket.send()
    var sendToServer = {
    function:"sendInitial2dDataload"
  }
  socket.send(JSON.stringify(sendToServer));
});



socket.addEventListener('message', function (event) {
  //console.log('Message from server:', event);
  const serverData = JSON.parse(event.data);
  console.log(serverData);
  if(serverData.function === "renderAllEDDN2D"){
    renderEventHistogram(serverData.eddn2d.eventLineHistogram.aggregations);
    renderStarTypeBarChart(serverData.eddn2d.starTypeBarChart.aggregations);
  }
});

function renderStarTypeBarChart(starChartData){
    const ctx = document.getElementById('eddn2dBarChartStarTypes');

  const labels = [];
  const values = [];
  const backgroundColors = [];
  const borderColors = [];
    for (const bucket of starChartData.StarType.buckets) {
      console.log(bucket);
      labels.push(bucket.key)
      values.push(bucket.doc_count);
      const randomColor = randomRgbColor;
      backgroundColors.push('rgba(['+randomColor+'], 0.2)');
      borderColors.push('rgb(['+randomColor+'])')
    }

const config = {
  options: {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  },
};

const data = {
  labels: labels,
  datasets: [{
    label: 'Star Type Bar Chart',
    data: values,
    backgroundColor: backgroundColors,
    borderColor: borderColors,
    borderWidth: 1
  }]
};

  new Chart(ctx, {
    type: 'bar',
    config,
    data: data,
  });

    console.log(labels);

}

function randomRgbColor() {

    let r = randomInteger(255);

    let g = randomInteger(255);

    let b = randomInteger(255);

    return [r,g,b];

}



function renderEventHistogram(histogramData) {
  const ctx = document.getElementById('eddn2DEventsLineChart');

  const fsdJumpData = [];
  const scanData = [];
  const timestamps = [];

  for (const bucket of histogramData.Timestamp.buckets) {

    //const timestamp = new Date(bucket.key_as_string);
    const timestampValue = bucket.key_as_string;
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

    timestamps.push(thisTimesatamp);

    for (const eventBucket of bucket.Event.buckets) {
      const eventName = eventBucket.key;
      const eventCount = eventBucket.doc_count;

      if (eventName === "FSDJump") {
        fsdJumpData.push(eventCount);
      } else if (eventName === "Scan") {
        scanData.push(eventCount);
      }
    }
  }
  console.log(scanData);
  console.log(timestamps);
  const data = {
    labels: timestamps,
    datasets: [{
        label: 'FSD Jump Events',
        data: fsdJumpData,
        fill: false,
        borderColor: 'rgb(75, 192, 192)',
        tension: 0.1,
        pointRadius: 0,
        borderWidth: 2
      },
      {
        label: 'Scan Events',
        data: scanData,
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