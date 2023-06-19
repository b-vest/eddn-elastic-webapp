const runtimeObject = {
  health: {},
  eddn2d: {},
  systemmetrics: {},
  queries: {},
  renderWebTrafficmetrics: {},
  httpResponseHistogram: {}
};

fetchAndStore();


const getMessages = () => ({
  sendHealth: JSON.stringify({
    function: 'renderHealth',
    health: runtimeObject.health
  }),
  sendRawData: JSON.stringify({
    function: 'renderRawData',
    rawData: runtimeObject.rawData
  }),
  sendInitial2dDataload: JSON.stringify({
    function: 'renderAllEDDN2D',
    eddn2d: runtimeObject.eddn2d
  }),
  bootstrapStarMap: JSON.stringify({
    function: 'renderStarMap',
    starMapData: runtimeObject.starMapData
  }),
  sendSystemStats: JSON.stringify({
    function: 'rendrSystemStats',
    systemMetrics: runtimeObject.systemmetrics
  }),
  sendWebTrafficData: JSON.stringify({
    function: 'renderWebTrafficmetrics',
    httpResponseMetrics: runtimeObject.httpResponseHistogram
  })
});



module.exports = { runtimeObject, getMessages };