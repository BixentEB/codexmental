// viewer-planete-3d.js – Visualiseur 3D avancé avec Three.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

let scene, camera, renderer, sphere, clouds, animateId;
let currentPlanetName = null;
let currentLayer = 'surface';

const canvas = document.getElementById('planet-viewer-canvas');
const warning = document.getElementById('layer-warning');
const selector = document.getElementById('layer-select');

export function loadPlanet3D(name, layer = 'surface') {
  currentPlanetName = name;
  currentLayer = layer;

  cleanupViewer();
  warning?.classList.add('hidden');

  if (!canvas) {
    console.warn("⚠️ Canvas #planet-viewer-canvas introuvable");
    return;
  }

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 3.5;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 3, 5);
  scene.add(light);

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({ color: 0x888888 });

  sphere = new THREE.Mesh(geometry, material);
  sphere.scale.set(0.85, 0.85, 0.85); // réduction pour éviter les débords
  scene.add(sphere);

  const loader = new THREE.TextureLoader();
  const basePath = `/lab/modules/dashboard/img/planets/${name.toLowerCase()}-${layer}.jpg`;

  loader.load(
    basePath,
    texture => {
      material.map = texture;
      material.needsUpdate = true;
    },
    undefined,
    () => {
      console.warn(`❌ Donnée manquante : ${basePath}`);
      warning?.classList.remove('hidden');
    }
  );

  animateId = requestAnimationFrame(animate);
}

function animate() {
  animateId = requestAnimationFrame(animate);
  if (sphere) sphere.rotation.y += 0.002;
  if (clouds) clouds.rotation.y += 0.001;
  renderer?.render(scene, camera);
}

export function cleanupViewer() {
  cancelAnimationFrame(animateId);

  if (renderer) {
    renderer.dispose();
    renderer.domElement = null;
  }

  if (sphere) {
    scene?.remove(sphere);
    sphere.geometry.dispose();
    sphere.material.map?.dispose();
    sphere.material.dispose();
    sphere = null;
  }

  if (clouds) {
    scene?.remove(clouds);
    clouds.geometry.dispose();
    clouds.material.map?.dispose();
    clouds.material.dispose();
    clouds = null;
  }

  scene = null;
  camera = null;
  renderer = null;
}

// Si on a un sélecteur pour changer de couche
if (selector) {
  selector.addEventListener('change', e => {
    const newLayer = e.target.value;
    if (currentPlanetName) {
      loadPlanet3D(currentPlanetName, newLayer);
    }
  });
}
