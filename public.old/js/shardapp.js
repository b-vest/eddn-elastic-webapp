import * as THREE from '../three.module.js';
import Stats from '../stats.module.js';
import { OrbitControls } from '../OrbitControls.js';

const numNodes = 4; // Number of nodes
const numShards = 2; // Number of shards per node
const numDataPoints = numNodes * numShards; // Total number of data points
const shardData = [];

// Generate sequential shard data
for (let nodeId = 1; nodeId <= numNodes; nodeId++) {
  for (let shardId = 0; shardId < numShards; shardId++) {
    shardData.push({ nodeId, shardId });
  }
}

let camera, scene, renderer, cameraCtrl;
let nodeObjects = [];
let shardObjects = [];
let dataObjects = [];
let trails = [];
let particleSystem;
let rotationSpeed = 0.001;
let uniforms;

const conf = {
  el: 'shardRotation',
  fov: 75,
  cameraZ: 140,
  background: 0x00001a,
  brightness: 2
};

initScene();

function initScene() {
  camera = new THREE.PerspectiveCamera(conf.fov, window.innerWidth / window.innerHeight, 2, 20000);
  camera.position.z = conf.cameraZ;

  scene = new THREE.Scene();
  scene.background = new THREE.Color(conf.background);
  scene.fog = new THREE.FogExp2(0x000000, 0.01);

  renderer = new THREE.WebGLRenderer({ canvas: document.getElementById(conf.el) });
  renderer.setSize(window.innerWidth, window.innerHeight);
  cameraCtrl = new OrbitControls(camera, renderer.domElement);
  cameraCtrl.autoRotate = false;
  cameraCtrl.enableDamping = true;
  cameraCtrl.autoRotateSpeed = 0.1;

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  window.addEventListener('resize', onWindowResize);

  createNodeObjects();
  createShardObjects();
  createDataObjects();
  createTrails();

  createParticleSystem();

  animate();
}

function createNodeObjects() {
  const nodeSize = 10;
  const nodeColor = 0x00ff00;

  for (let nodeId = 1; nodeId <= numNodes; nodeId++) {
    const geometry = new THREE.BoxGeometry(nodeSize, nodeSize, nodeSize);
    const material = new THREE.MeshBasicMaterial({ color: nodeColor });
    const nodeObject = new THREE.Mesh(geometry, material);
    scene.add(nodeObject);
    nodeObjects.push(nodeObject);
  }
}

function createShardObjects() {
  const shardSize = 5;
  const shardColor = 0xff0000;

  shardData.forEach((shard) => {
    const geometry = new THREE.BoxGeometry(shardSize, shardSize, shardSize);
    const material = new THREE.MeshBasicMaterial({ color: shardColor });
    const shardObject = new THREE.Mesh(geometry, material);
    scene.add(shardObject);
    shardObjects.push(shardObject);
  });
}

function createDataObjects() {
  const dataSize = 2;
  const dataColor = 0x0000ff;

  for (let i = 0; i < numDataPoints; i++) {
    const geometry = new THREE.BoxGeometry(dataSize, dataSize, dataSize);
    const material = new THREE.MeshBasicMaterial({ color: dataColor });
    const dataObject = new THREE.Mesh(geometry, material);
    scene.add(dataObject);
    dataObjects.push(dataObject);
  }
}

function createTrails() {
  const trailLength = 30;
  const trailOpacity = 1;
  const trailFadeOutDuration = 2;
  const trailFadeOutStart = trailLength - trailFadeOutDuration;

  const trailGeometry = new THREE.BufferGeometry();
  const trailMaterial = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: trailOpacity, transparent: true });
  const trailPositions = new Float32Array(trailLength * 3); // Each vertex has 3 coordinates (x, y, z)

  trailGeometry.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));

  for (let i = 0; i < numDataPoints; i++) {
    const trail = new THREE.Line(trailGeometry, trailMaterial.clone());
    trail.update = function () {
      const dataObject = dataObjects[i];
      const trailPositions = this.geometry.attributes.position.array;

      for (let j = trailLength - 1; j >= 3; j--) {
        const currentIndex = j * 3;
        const prevIndex = (j - 3) * 3;

        trailPositions[currentIndex] = trailPositions[prevIndex];
        trailPositions[currentIndex + 1] = trailPositions[prevIndex + 1];
        trailPositions[currentIndex + 2] = trailPositions[prevIndex + 2];
      }

      trailPositions[0] = dataObject.position.x;
      trailPositions[1] = dataObject.position.y;
      trailPositions[2] = dataObject.position.z;

      this.geometry.attributes.position.needsUpdate = true;

      if (trail.material.opacity > 0 && trail.material.opacity <= 1) {
        const time = (trailLength - index) / trailLength;

        if (time < trailFadeOutStart / trailLength) {
          trail.material.opacity -= trailFadeOutDuration / trailLength;
        }
      }
    };

    scene.add(trail);
    trails.push(trail);
  }
}

function createParticleSystem() {
  uniforms = {
    pointTexture: { value: new THREE.TextureLoader().load('../star.png') }
  };

  const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: document.getElementById('vertexshader').textContent,
    fragmentShader: document.getElementById('fragmentshader').textContent,
    depthTest: false,
    transparent: true,
    vertexColors: true
  });

  const vertices = [];
  const colors = [];
  const sizes = [];

  shardData.forEach((shard) => {
    const positionX = (shard.nodeId - 2.5) * 10;
    const positionY = shard.shardId * 10;
    vertices.push(positionX, positionY, 0);
    colors.push(Math.random(), Math.random(), Math.random());
    sizes.push(10);
  });

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  particleSystem = new THREE.Points(geometry, shaderMaterial);
  scene.add(particleSystem);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);

  const time = Date.now() * 0.001;
  const radius = 50;
  const height = 20;
  const speed = 0.01;

  shardData.forEach((shard, index) => {
    const angle = (time * speed) + (index * (Math.PI * 2) / shardData.length);
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = Math.sin(angle) * height;

    const shardObject = shardObjects[index];
    shardObject.position.set(x, y, z);

    // Randomly change the shard color and size
    if (Math.random() < 0.02) {
      const newColor = new THREE.Color(Math.random(), Math.random(), Math.random());
      shardObject.material.color = newColor;

      const newSize = Math.random() * 5 + 5;
      shardObject.scale.set(newSize, newSize, newSize);
    }
  });

  dataObjects.forEach((dataObject, index) => {
    const shardIndex = index % shardData.length;
    const shardObject = shardObjects[shardIndex];
    const targetPosition = shardObject.position.clone();

    if (index >= numDataPoints) {
      const prevDataObject = dataObjects[index - numDataPoints];
      targetPosition.copy(prevDataObject.position);
    }

    dataObject.position.lerp(targetPosition, 0.1);
    trails[index].update(index);
  });

  renderer.render(scene, camera);
}

