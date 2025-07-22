// viewer-planete-3d.js – Visualiseur 3D avec UI connectée + halo + fallback data
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { updatePlanetUI } from './planet-data.js';
import { PLANET_DATABASE } from './planet-database.js';

let scene, camera, renderer, sphere, clouds, ringMesh, animateId;
let currentPlanetName = null;
let currentLayer = 'surface';
let fallbackData = null;

const canvas = document.getElementById('planet-canvas');
const selector = document.getElementById('layer-select');

export function loadPlanet3D(name, layer = 'surface', data = {}) {
  currentPlanetName = name;
  currentLayer = layer;
  fallbackData = PLANET_DATABASE[name] || {};

  cleanupViewer();

  if (!canvas) {
    console.warn("⚠️ Canvas #planet-canvas introuvable");
    return;
  }

  renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  scene = new THREE.Scene();

  // Halo lumineux
  const haloGeo = new THREE.SphereGeometry(1.15, 64, 64);
  const haloMat = new THREE.MeshBasicMaterial({
    color: 0x00ffff,
    transparent: true,
    opacity: 0.05,
    side: THREE.BackSide,
    depthWrite: false
  });
  const halo = new THREE.Mesh(haloGeo, haloMat);
  scene.add(halo);

  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  scene.add(ambient);
  const light = new THREE.DirectionalLight(0xffffff, 1.1);
  light.position.set(5, 3, 5);
  scene.add(light);

  camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 3.5;

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
      texture.encoding = THREE.sRGBEncoding;
      material.map = texture;
      material.needsUpdate = true;
    },
    undefined,
    () => console.warn(`❌ Texture manquante : ${basePath}`)
  );

  // === 🌀 Anneaux si disponibles ===
  if (data.rings?.texture) {
    const ringPath = `/lab/modules/dashboard/img/rings/${data.rings.texture}`;
    loader.load(
      ringPath,
      ringTexture => {
        const inner = data.rings.innerRadius || 1.1;
        const outer = data.rings.outerRadius || 1.8;
        const ringGeo = new THREE.RingGeometry(inner, outer, 64);
        const ringMat = new THREE.MeshBasicMaterial({
          map: ringTexture,
          transparent: true,
          side: THREE.DoubleSide,
          depthWrite: false
        });
        ringMesh = new THREE.Mesh(ringGeo, ringMat);
        ringMesh.rotation.x = -Math.PI / 2;
        scene.add(ringMesh);
      },
      undefined,
      () => console.warn(`❌ Texture anneau manquante : ${ringPath}`)
    );
  }

  // Fusion data + fallback
  const finalData = {
    ...fallbackData,
    ...data,
  };
  updatePlanetUI(finalData, name);

  animateId = requestAnimationFrame(animate);
}

function animate() {
  animateId = requestAnimationFrame(animate);
  if (sphere) sphere.rotation.y += 0.002;
  if (clouds) clouds.rotation.y += 0.001;
  if (ringMesh) ringMesh.rotation.z += 0.0005;
  renderer?.render(scene, camera);
}

export function cleanupViewer() {
  if (animateId) cancelAnimationFrame(animateId);
  animateId = null;

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

  if (ringMesh) {
    scene?.remove(ringMesh);
    ringMesh.geometry.dispose();
    ringMesh.material.map?.dispose();
    ringMesh.material.dispose();
    ringMesh = null;
  }

  // On ne touche plus à renderer ou canvas pour ne pas casser d'autres modules
  scene = null;
  camera = null;
  // renderer = null;
}

if (selector) {
  selector.addEventListener('change', e => {
    const newLayer = e.target.value;
    if (currentPlanetName) {
      loadPlanet3D(currentPlanetName, newLayer);
    }
  });
}
