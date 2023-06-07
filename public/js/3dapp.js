import * as THREE from '../three.module.js';
import Stats from '../stats.module.js';
//import { GUI } from './dat.gui.module.js';
import { OrbitControls } from '../OrbitControls.js';

var stars = [],vertices = [], colors = [], sizes = [];
var camera,scene,renderer,cameraCtrl;
var raycaster = new THREE.Raycaster(); 
var mouse = new THREE.Vector2(); 

const color = new THREE.Color();
const axesHelper = new THREE.AxesHelper( 5 );
var geometry = new THREE.BufferGeometry();
var particleSystem = new Array();
const conf = {
  el: 'edJumpStars',
  fov: 75,
  cameraZ: 140,
  background: 0x00001a,
  numCircles: 40,
  numPointsPerCircle: 1000,
};

  var rotationSpeed = 0.001;
  var uniforms = {
    pointTexture: { value: new THREE.TextureLoader().load('../star.png')}
  };
  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    //blending: THREE.AdditiveBlending,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,
    depthTest: false,
    transparent: true,
    vertexColors: true
  });

  initScene()

const socket = new WebSocket('ws://'+window.location.hostname+':3000');

// Connection opened
socket.addEventListener('open', function (event) {
  console.log('WebSocket connected');
  // You can send data to the server using socket.send()
    var sendToServer = {
    function:"bootstrapStarMap"
  }
  socket.send(JSON.stringify(sendToServer));
});

// Listen for messages from the server
socket.addEventListener('message', function (event) {
  console.log('Message from server:', event);
  const serverData = JSON.parse(event.data);
  if (serverData.function === "renderStarMap"){
    renderStarMap(serverData.starMapData);

  }
  
});

// Connection closed
socket.addEventListener('close', function (event) {
  console.log('WebSocket connection closed');
});



function renderStarMap(starMapData){
  
  for (const [key, value] of Object.entries(starMapData)) {
    console.log(value);
    if(value === null){
      break
    }
    vertices.push(value.starPosition[0]/100);
    vertices.push(value.starPosition[2]/100);
    vertices.push(value.starPosition[1]/100);
    
    color.setHSL(value.surfaceTemp/3.5,1,0.5)
    colors.push(color.r,color.g,color.b )
    //console.log(value.Radius)
    if(value.starRadius >= 300000000){
      sizes.push(value.starRadius/100000000000)
    }else{
            sizes.push(value.starRadius/100000000)
    }
  }
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
    geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    //console.log(sizes)
    geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes,1));
    particleSystem = new THREE.Points(geometry, shaderMaterial)
    //console.log("END Forloop")
    scene.add(particleSystem)
    animate()
}


function responsive() {
  var x = document.getElementById("myTopnav");
  if (x.className === "topnav") {
    x.className += " responsive";
  } else {
    x.className = "topnav";
  }
}

function initScene(){
  camera = new THREE.PerspectiveCamera( 100, window.innerWidth / window.innerHeight, 2, 20000 );
  camera.position.z = 100; 

  scene = new THREE.Scene();
  scene.background = new THREE.Color(conf.background);
  scene.fog = new THREE.FogExp2( 0x000000, 0.01 );

  renderer = new THREE.WebGLRenderer({ 
    canvas: document.getElementById(conf.el) 
      //logarithmicDepthBuffer: true 
  });
  //set the size of the renderer
  renderer.setSize( window.innerWidth, window.innerHeight);
  cameraCtrl = new OrbitControls(camera, renderer.domElement);
  cameraCtrl.autoRotate = false;
  cameraCtrl.enableDamping = true;
  cameraCtrl.autoRotateSpeed = 0.1;
  var stats = new Stats();
  document.body.appendChild( stats.dom );
  //add the renderer to the html document body
  document.body.appendChild( renderer.domElement );
  window.addEventListener( 'resize', onWindowResize );
  document.addEventListener('mousemove', mouseDown)

}

function onWindowResize() {

  windowHalfX = window.innerWidth / 2;
  windowHalfY = window.innerHeight / 2;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize( window.innerWidth, window.innerHeight );

}

function mouseDown(event){
  //console.log(event)
  mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
  mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
  //console.log(mouse)
  //console.log(scene)
}

function render() {
  const time = Date.now() * 0.005;
  particleSystem.rotation.z = rotationSpeed * time;
  //const sizes = geometry.attributes.size.array;
  //for ( let i = 0; i < particles; i ++ ) {
    //sizes[ i ] = 10 * ( 1 + Math.sin( 0.1 * i + time ) );
  //}
  geometry.attributes.size.needsUpdate = true;
  renderer.clear()
  renderer.render( scene, camera );
}

  function animate () {
    requestAnimationFrame( animate );
    render();
    //stats.update();
  }