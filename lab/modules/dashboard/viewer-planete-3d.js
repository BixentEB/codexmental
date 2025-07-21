// viewer-planete-3d.js – Visualiseur 3D avancé avec Three.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

let scene, camera, renderer, sphere, clouds, animateId;
const canvas = document.getElementById('planet-viewer-canvas');

// Chargement dynamique d'une planète
export function loadPlanet3D(name, layer = 'surface') {
  currentPlanetName = name; // Pour rappel lors du changement de couche

  cleanupViewer(); // Nettoyer l'ancien rendu

  const canvas = document.getElementById('planet-canvas');
  const warning = document.getElementById('layer-warning');
  warning?.classList.add('hidden');

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 2.5;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 3, 5);
  scene.add(light);

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({ color: 0x888888 });

  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  const loader = new THREE.TextureLoader();
  const texturePath = `/lab/modules/dashboard/img/planets/${name.toLowerCase()}-${layer}.jpg`;

  loader.load(
    texturePath,
    (texture) => {
      material.map = texture;
      material.needsUpdate = true;
    },
    undefined,
    () => {
      console.warn(`⚠️ Donnée manquante pour ${name} (${layer})`);
      warning?.classList.remove('hidden');
    }
  );

  function animate() {
    requestAnimationFrame(animate);
    sphere.rotation.y += 0.002;
    renderer.render(scene, camera);
  }

  animate();
}


// Animation continue
function animate() {
  animateId = requestAnimationFrame(animate);
  if (sphere) sphere.rotation.y += 0.0025;
  if (clouds) clouds.rotation.y += 0.0015;
  renderer.render(scene, camera);
}

// Nettoyage du viewer (avant rechargement ou fermeture)
export function cleanupViewer() {
  cancelAnimationFrame(animateId);

  if (renderer) {
    renderer.dispose();
    // renderer.forceContextLoss(); ❌ supprime cette ligne !
    renderer.domElement = null;
  }

  if (sphere) {
    scene.remove(sphere);
    sphere.geometry.dispose();
    if (sphere.material.map) sphere.material.map.dispose();
    if (sphere.material.bumpMap) sphere.material.bumpMap.dispose();
    if (sphere.material.specularMap) sphere.material.specularMap.dispose();
    sphere.material.dispose();
    sphere = null;
  }

  if (clouds) {
    scene.remove(clouds);
    clouds.geometry.dispose();
    clouds.material.map?.dispose();
    clouds.material.dispose();
    clouds = null;
  }
}


// Chargement d'une texture avec fallback + log console
function loadTex(loader, url, type) {
  return new Promise(resolve => {
    loader.load(
      url,
      tex => resolve(tex),
      undefined,
      () => {
        console.warn(`❌ Texture ${type} manquante : ${url}`);
        resolve(null);
      }
    );
  });
}
