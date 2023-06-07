const socket = new WebSocket('ws://172.16.1.252:3000');

// Connection opened
socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');
  // You can send data to the server using socket.send()
    var sendToServer = {
    function:"sendEventHistogram"
  }
  socket.send(JSON.stringify(sendToServer));
});

// Listen for messages from the server
socket.addEventListener('message', function (event) {
  console.log('Message from server:', event);
  const serverData = JSON.parse(event.data);
   if(serverData.function === "renderEventHistogram"){
    renderEventHistogram(serverData.lineGraphData.aggregations);
  }
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


function renderEventHistogram(histogramData) {
  const fsdJumpData = [];
  const scanData = [];
  const timestamps = [];

  for (const bucket of histogramData.Timestamp.buckets) {
    const timestamp = new Date(bucket.key_as_string);
    const timestampValue = timestamp.getTime();
    timestamps.push(timestampValue);

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

  // Set the dimensions for the SVG container
  const margin = { top: 20, right: 20, bottom: 30, left: 50 };
  const width = 800 - margin.left - margin.right;
  const height = 400 - margin.top - margin.bottom;

  // Select the existing SVG element by its ID
  const svg = d3.select("#eventHistogram");

  // Define the legend data
const legendData = ["FSDJump", "Scan"];

// Append the legend
const legend = svg.append("g")
  .attr("class", "legend")
  .attr("transform", `translate(${width - margin.right - 10}, ${margin.top})`);

// Add legend items
const legendItems = legend.selectAll("g")
  .data(legendData)
  .enter()
  .append("g")
  .attr("transform", (d, i) => `translate(0, ${i * 20})`);

// Add colored rectangles to represent events
legendItems.append("rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", 10)
  .attr("height", 10)
  .style("fill", (d) => (d === "FSDJump" ? "blue" : "green"));

// Add text labels to the legend
legendItems.append("text")
  .attr("x", 20)
  .attr("y", 10)
  .text((d) => d)
  .style("font-size", "12px")
  .style("fill", "black");

  // Set the dimensions of the SVG element
  svg.attr("width", width + margin.left + margin.right)
     .attr("height", height + margin.top + margin.bottom);

  // Append a group element and set its dimensions
  const g = svg.append("g")
               .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set the scales for x and y axes
  const xScale = d3.scaleLinear()
                   .domain([0, timestamps.length - 1])
                   .range([0, width]);

  const yScale = d3.scaleLinear()
                   .domain([0, d3.max([...fsdJumpData, ...scanData])])
                   .range([height, 0]);

  // Define the line generator for FSDJump events
  const fsdLine = d3.line()
                    .x((d, i) => xScale(i))
                    .y(d => yScale(d))
                    .curve(d3.curveMonotoneX);

  // Define the line generator for Scan events
  const scanLine = d3.line()
                     .x((d, i) => xScale(i))
                     .y(d => yScale(d))
                     .curve(d3.curveMonotoneX);

  // Append the FSDJump line to the SVG
  g.append("path")
   .datum(fsdJumpData)
   .attr("class", "line")
   .style("stroke", "blue")
    .style("fill", "none")
   .attr("d", fsdLine);

  // Append the Scan line to the SVG
  g.append("path")
   .datum(scanData)
   .attr("class", "line")
   .style("stroke", "green")
    .style("fill", "none")
   .attr("d", scanLine);

  // Add the x-axis
  g.append("g")
   .attr("transform", "translate(0," + height + ")")
   .call(d3.axisBottom(xScale));

  // Add the y-axis
  g.append("g")
   .call(d3.axisLeft(yScale));

  // Add the x-axis label
  g.append("text")
   .attr("class", "x-label")
   .attr("x", width / 2)
   .attr("y", height + margin.bottom - 5)
   .style("text-anchor", "middle")
   .text("Timestamp");

  // Add the y-axis label
  g.append("text")
   .attr("class", "y-label")
   .attr("transform", "rotate(-90)")
   .attr("x", -height / 2)
   .attr("y", -margin.left + 15)
   .style("text-anchor", "middle")
   .text("Count");
}
