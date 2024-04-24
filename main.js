import * as THREE from "three";
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

import {
  BloomEffect,
  EffectComposer,
  EffectPass,
  RenderPass,
} from "postprocessing";

const vertexShader = `
uniform float pointMultiplier;
attribute float scale;

void main() {
  vec4 mvPosition = modelViewMatrix * vec(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = pointMultiplier * 1500.0 * scale / gl_Position.w;
}
`;

const fragmentShader = `
uniform sampler2D diffuseTexture;

void main() {
  gl_FragColor = texture2D(diffuseTexture, gl_PointCoord);
}
`;

// SCENE
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x002aaa, 0.001);

/* //////////////////////////////////////// */

// CAMERA
const camera = new THREE.PerspectiveCamera(
  95,
  window.innerWidth / window.innerHeight,
  1,
  2000
);
camera.position.z = 10;
camera.rotation.x = 1.16;
camera.rotation.y = -0.12;
camera.rotation.z = 0.27;
camera.position.set(0, 0, 15);

/* //////////////////////////////////////// */

// RENDERER
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(devicePixelRatio);
renderer.setClearColor(scene.fog.color);

document.body.appendChild(renderer.domElement);

const listener = new THREE.AudioListener();
camera.add(listener);

const audioLoader = new THREE.AudioLoader();

const backgroundSound = new THREE.Audio(listener);

audioLoader.load("/music.mp3", function (buffer) {
  backgroundSound.setBuffer(buffer);
  backgroundSound.setLoop(true);
  backgroundSound.setVolume(0.4);
  backgroundSound.play();
});

/* //////////////////////////////////////// */

// Composer
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));

/* //////////////////////////////////////// */

// Ambient Ligth to Scene
let ambient = new THREE.AmbientLight(0x999999, 1.5);
scene.add(ambient);

/* //////////////////////////////////////// */

// DirectionalLight to Scene
let directionalLight = new THREE.DirectionalLight(0x44348b);
directionalLight.position.set(0, 0, 1);
scene.add(directionalLight);

/* //////////////////////////////////////// */

//  PointLight to Scene
let purpleLight = new THREE.PointLight(0x351c75, 50, 450, 1.7);
purpleLight.position.set(200, 300, 100);
scene.add(purpleLight);
let redLight = new THREE.PointLight(0x674ea7, 50, 450, 1.7);
redLight.position.set(100, 300, 100);
scene.add(redLight);
let blueLight = new THREE.PointLight(0x351c75, 50, 450, 1.7);
blueLight.position.set(300, 300, 200);
scene.add(blueLight);

/* //////////////////////////////////////// */

//  Stars
const starGeo = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({
  color: 0xffffff,
});

const starVertices = [];
for (let i = 0; i < 10000; i++) {
  const x = (Math.random() - 0.5) * 2000;
  const y = (Math.random() - 0.5) * 2000;
  const z = (Math.random() - 0.5) * 2000;
  starVertices.push(x, y, z);
}

starGeo.setAttribute(
  "position",
  new THREE.Float32BufferAttribute(starVertices, 3)
);

const stars = new THREE.Points(starGeo, starMaterial);

scene.add(stars);

const cloudParticles = [];

// Smoke Loaders
let loader = new THREE.TextureLoader();
loader.load(
  "https://raw.githubusercontent.com/navin-navi/codepen-assets/master/images/smoke.png",
  function (texture) {
    const cloudGeo = new THREE.PlaneBufferGeometry(500, 500);
    const cloudMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      transparent: true,
    });

    for (let p = 0; p < 50; p++) {
      let cloud = new THREE.Mesh(cloudGeo, cloudMaterial);
      cloud.position.set(
        Math.random() * 1000 - 400,
        250,
        Math.random() * 1000 - 500
      );
      cloud.rotation.x = 1.16;
      cloud.rotation.y = -0.12;
      cloud.rotation.z = Math.random() * 2 * Math.PI;
      cloud.material.opacity = 0.55;
      cloudParticles.push(cloud);
      scene.add(cloud);
    }
  }
);

const ballGeo = new THREE.SphereGeometry(1, 1, 1);
const ballMaterial = new THREE.MeshPhongMaterial({
  color: 0xffff00,
  transparent: true,
  opacity: 0.001,
});
const ball = new THREE.Mesh(ballGeo, ballMaterial);
scene.add(ball);
ball.position.y = 25;
ball.position.z = 1;
ball.position.x = 1;
ball.rotation.z = 0.27;
ball.rotation.y = -0.15;
ball.rotation.x = 1.1;

let ball2Loader = new THREE.TextureLoader();
const texture = ball2Loader.load("./Fire.png");
const ballGeo2 = new THREE.ConeGeometry(35, 75, 65);
const ballMaterial2 = new THREE.MeshPhongMaterial({
  map: texture,
  color: 0xffffff,
  opacity: 1,
  shininess: 0.1,
  emissiveIntensity: 1,
});
const ball2 = new THREE.Mesh(ballGeo2, ballMaterial2);
scene.add(ball2);
ball2.position.y = -95;
ball2.position.z = 1;
ball2.position.x = 1;
ball2.rotation.z = 0;
ball2.rotation.y = 0;
ball2.rotation.x = -380.1;

let rocketLoader = new GLTFLoader();
rocketLoader.load("./rocket.gltf", (gltf) => {
  const rocket = gltf.scene;
  gltf.scene = rocket;
  gltf.scene.scale.multiplyScalar(7 / 250);
  rocket.position.x = 26;
  rocket.position.y = 2;
  rocket.rotation.x = Math.PI / -2;
  ball.add(rocket);
  rocket.add(ball2);
});

// Logo Plane

let logoLoader = new THREE.TextureLoader();
logoLoader.load("./logo1.png", function (texture) {
  const planeGeo = new THREE.PlaneGeometry(45, 30, 30, 30);
  const planeMaterial = new THREE.MeshLambertMaterial({
    color: 0xffffff,
    map: texture,
    transparent: true,
  });

  const planeMesh = new THREE.Mesh(planeGeo, planeMaterial);
  scene.add(planeMesh);
  planeMaterial.useAlphaFromDiffuseTexture = true;
  // vertices position randomization
  // const { array } = planeMesh.geometry.attributes.position;
  // const randomValues = [];
  // for (let i = 0; i < array.length; i++) {
  //   if (i % 3 === 0) {
  //     const x = array[i];
  //     const y = array[i + 1];
  //     const z = array[i + 2];

  //     array[i] = x + -0.5;
  //     array[i + 1] = y + -0.5;
  //     array[i + 2] = z + -0.5;
  //   }
  //   randomValues.push(Math.random() - 0.5);
  // }

  planeMesh.position.y = 15;
  planeMesh.position.z = 10.5;
  planeMesh.position.x = 1;
  planeMesh.rotation.z = 0.262;
  planeMesh.rotation.y = -0.15;
  planeMesh.rotation.x = 1.1;

  // planeMesh.geometry.attributes.position.randomValues = randomValues;

  planeMesh.geometry.attributes.position.originalPosition =
    planeMesh.geometry.attributes.position.array;

  const clock = new THREE.Clock();
  let v = new THREE.Vector3();
  let pos = planeMesh.geometry.attributes.position;

  // Logo Plane

  /* //////////////////////////////////////// */

  // Render animation on every rendering phase
  let frame = 0;
  function animate() {
    requestAnimationFrame(animate);

    renderer.render(scene, camera);
    frame += 0.01;
    // Post Processing Render
    composer.render(0.1);
    ball.rotateY(0.006);
    ball2.rotateY(0.9);
    const t = clock.getElapsedTime();

    // for (let i = 0; i < pos.count; i++) {
    //   v.fromBufferAttribute(pos, i);
    //   const wavex1 = 0.1 * Math.sin(v.x + 1 + t);
    //   const wavex2 = 0.1 * Math.sin(v.x + 2 + t + 2);
    //   const wavex3 = 0.1 * Math.sin(v.y + t);

    //   pos.setZ(i, wavex1 + wavex2 + wavex3);
    // }
    // pos.needsUpdate = true;

    // const { array, originalPosition, randomValues } =
    //   planeMesh.geometry.attributes.position;
    // for (let i = 0; i < array.length; i += 3) {
    //   // x
    //   array[i] =
    //     originalPosition[i] + Math.cos(frame + randomValues[i]) * 0.002;
    //   // y
    //   array[i + 1] =
    //     originalPosition[i + 1] + Math.sin(frame + randomValues[i + 1]) * 0.002;
    // }

    // planeMesh.geometry.attributes.position.needsUpdate = true;

    // Cloud rotation
    cloudParticles.forEach((p) => {
      p.rotation.z -= 0.001;
    });

    stars.rotation.x += 0.0005;
    stars.rotation.y += 0.0005;
    stars.rotation.z += 0.0005;
  }

  animate();
});

/* //////////////////////////////////////// */

// Update Camera Aspect Ratio and Renderer ScreenSize on Window resize
window.addEventListener(
  "resize",
  function () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  },
  false
);
