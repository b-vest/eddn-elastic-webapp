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
  console.log(serverData);
  if(serverData.function === "renderWebTrafficmetrics"){
    renderHTTPResponseChart(serverData.httpResponseMetrics);
  }
});


function renderHTTPResponseChart(trafficArrays){
	var datasets = [];
  	const ctx = document.getElementById('webTraffic');
  	const timestamps = trafficArrays.timestamps;
  	delete trafficArrays.timestamps;
	for (const response in trafficArrays) {  
		var thisDataset = {
  	    	label: response,
        	data: trafficArrays[response],
        	fill: false,
        	borderColor: 'rgb('+randomIntBetween(128, 254)+', '+randomIntBetween(128, 254)+','+randomIntBetween(128, 254)+')',
        	tension: 0.1,
        	pointRadius: 0,
        	borderWidth: 2
    	};
    	datasets.push(thisDataset);
	}
   console.log(datasets);
     const data = {
    	labels: timestamps,
    	datasets: datasets
	}
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


function randomIntBetween(min,max){
  var thisRandom = Math.floor(Math.random()*(max - min + 1)) + min
  return thisRandom;
}  

