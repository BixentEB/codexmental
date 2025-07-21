// viewer-planete-3d.js – Visualiseur 3D avancé avec Three.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

let scene, camera, renderer, sphere, clouds, animateId;
let currentPlanetName = null;

const canvas = document.getElementById('planet-canvas');
const warning = document.getElementById('layer-warning');

// Chargement dynamique d'une planète
export async function loadPlanet3D(name, layer = 'surface') {
  currentPlanetName = name;
  cleanupViewer();

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 2.5;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 3, 5);
  scene.add(light);

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({ color: 0x888888 });

  sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  const loader = new THREE.TextureLoader();
  warning?.classList.add('hidden');

  const base = `/lab/modules/dashboard/img/planets/${name.toLowerCase()}`;
  const tex = await loadTex(loader, `${base}-${layer}.jpg`, layer);
  if (tex) {
    material.map = tex;
    material.needsUpdate = true;
  } else {
    warning?.classList.remove('hidden');
  }

  // Charge layer clouds s'il existe et qu'on est sur la Terre
  if (name.toLowerCase() === 'terre' && layer === 'surface') {
    const cloudTex = await loadTex(loader, `${base}-clouds.jpg`, 'nuages');
    if (cloudTex) {
      const cloudGeo = new THREE.SphereGeometry(1.01, 64, 64);
      const cloudMat = new THREE.MeshPhongMaterial({
        map: cloudTex,
        transparent: true,
        depthWrite: false,
        opacity: 0.9
      });
      clouds = new THREE.Mesh(cloudGeo, cloudMat);
      scene.add(clouds);
    }
  }

  animate();
}

// Nettoyage du viewer (avant rechargement ou fermeture)
export function cleanupViewer() {
  cancelAnimationFrame(animateId);

  if (renderer) {
    renderer.dispose();
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

// Animation continue
function animate() {
  animateId = requestAnimationFrame(animate);
  if (sphere) sphere.rotation.y += 0.0025;
  if (clouds) clouds.rotation.y += 0.0015;
  renderer.render(scene, camera);
}
