//since nearly all parts of this site use the WebSocket we will load it in the global site.js
var socket;
if (window.location.protocol === "https:") {
   console.log("HTTPS");
   socket = new WebSocket('wss://'+window.location.hostname+'/ws');
}else{
  console.log("HTTP");
  socket = new WebSocket('ws://'+window.location.hostname+':3000');
}
// Connection opened


function loadMenu() {
    var menuContainer = document.getElementById('menuContainer');
    var xhr = new XMLHttpRequest();
    var currentPage = window.location.href;
    xhr.open('GET', './objects/main-menu.html?v='+(new Date()).getTime(), true);
    console.log('./objects/main-menu.html?v='+(new Date()).getTime());
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            menuContainer.innerHTML = xhr.responseText;

            // Reinitialize Feather Icons after setting the content
            feather.replace();

            var fileName = location.pathname.split("/").slice(-1)
            console.log(fileName[0]);
            if(!fileName[0]){
                console.log("No File");
                fileName[0] = "index.html"
            }
            var sidebarItem = document.getElementById(fileName[0]);
            sidebarItem.className += ' active';

            if (fileName[0] != 'eddn-webapp.html' && fileName[0] != 'eddn-2d.html' 
                && fileName[0] != 'eddn-3d.html' && fileName[0] != 'eddn-rawdata.html'
                && fileName[0] != 'eddn-stats.html') {
                // Get all elements with the "eddn-submenu" class
                var submenus = document.getElementsByClassName('eddn-submenu');
                console.log("Collapsing menu");
                // Loop through each submenu and hide it
                for (var i = 0; i < submenus.length; i++) {
                    console.log(submenus[i]);
                    submenus[i].style.display = 'none';
                }
            }
            if (fileName[0] != 'metrics-deepdive.html' && fileName[0] != 'metrics-dd-filebeat.html' 
                && fileName[0] != 'metrics-dd-metricbeat.html') {
                // Get all elements with the "eddn-submenu" class
                var submenus = document.getElementsByClassName('metricsdd-submenu');
                console.log("Collapsing menu");
                // Loop through each submenu and hide it
                for (var i = 0; i < submenus.length; i++) {
                    console.log(submenus[i]);
                    submenus[i].style.display = 'none';
                }
            }
        }
    }
    xhr.send();
}

function loadFooter(){
    var footerContainer = document.getElementById('mainFooter');
    var xhr = new XMLHttpRequest();
    var currentPage = window.location.href;
    xhr.open('GET', './objects/footer.html?v='+(new Date()).getTime(), true);
    //console.log('./objects/main-menu.html?v='+(new Date()).getTime());
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            footerContainer.innerHTML = xhr.responseText;

            // Reinitialize Feather Icons after setting the content
            feather.replace();
        }
    }
    xhr.send();    
}