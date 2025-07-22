// ✅ viewer-planete-3d.js corrigé pour dashboard stellaire

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

let scene, camera, renderer, sphere, clouds, animateId;
let currentPlanetName = null;
let currentLayer = 'surface';

const canvas = document.getElementById('planet-canvas');

export function loadPlanet3D(name, layer = 'surface', data = {}) {
  currentPlanetName = name;
  currentLayer = layer;

  cleanupViewer();

  if (!canvas) {
    console.warn("⚠️ Canvas #planet-canvas introuvable");
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
  sphere.scale.set(0.85, 0.85, 0.85);
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
    () => console.warn(`❌ Donnée manquante : ${basePath}`)
  );

  injectPlanetData(data);

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

function injectPlanetData(data = {}) {
  document.getElementById('planet-name').textContent = data.name || '—';
  document.getElementById('planet-distance').textContent = data.distance || '—';
  document.getElementById('planet-size').textContent = data.radius || '—';
  document.getElementById('planet-temp').textContent = data.temp || '—';

  document.getElementById('planet-moons').textContent = Array.isArray(data.moons) ? data.moons.join(', ') : '—';
  document.getElementById('planet-colonized').textContent = data.colonized || '—';
  document.getElementById('planet-bases').textContent = Array.isArray(data.bases) ? data.bases.join(', ') : '—';
  document.getElementById('planet-mission').textContent = Array.isArray(data.missions) ? data.missions.join(', ') : '—';
}
