// viewer-planete-3d.js – Visualiseur 3D sphérique immersif

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

let scene, camera, renderer, sphere, animateId;
const canvas = document.getElementById('planet-viewer-canvas');
const container = document.getElementById('widget-planet-viewer');

// 🔄 Appelle cette fonction avec le nom d'une planète (ex : 'mars')
export function loadPlanet3D(name = 'terre') {
  cleanupViewer();

  // Init scene
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 2.5;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(200, 200);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lumière douce
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 3, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  // Texture de la planète
  const textureLoader = new THREE.TextureLoader();
  const texturePath = `/img/planets/${name.toLowerCase()}.jpg`;

  textureLoader.load(
    texturePath,
    (texture) => {
      const geometry = new THREE.SphereGeometry(1, 64, 64);
      const material = new THREE.MeshPhongMaterial({ map: texture });
      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      animate();
    },
    undefined,
    (err) => {
      console.warn(`⚠️ Texture non trouvée pour ${name} → fallback`);
      const geometry = new THREE.SphereGeometry(1, 64, 64);
      const material = new THREE.MeshStandardMaterial({ color: '#444' });
      sphere = new THREE.Mesh(geometry, material);
      scene.add(sphere);
      animate();
    }
  );
}

function animate() {
  animateId = requestAnimationFrame(animate);
  if (sphere) sphere.rotation.y += 0.003;
  renderer.render(scene, camera);
}

export function cleanupViewer() {
  cancelAnimationFrame(animateId);
  if (renderer) {
    renderer.dispose();
    renderer.forceContextLoss();
    renderer.domElement = null;
  }
  if (scene && sphere) {
    scene.remove(sphere);
    sphere.geometry.dispose();
    if (sphere.material.map) sphere.material.map.dispose();
    sphere.material.dispose();
    sphere = null;
  }
}
