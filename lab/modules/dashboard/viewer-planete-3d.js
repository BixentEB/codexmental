// viewer-planete-3d.js - Visualiseur 3D des planètes
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { updatePlanetUI } from './planet-data.js';

const viewers = new Map();

export function loadPlanet3D(name, layer = 'surface', data = {}, canvasId = 'planet-main-viewer') {
  if (canvasId === 'simul-system') return;
  loadObject3D({ id: canvasId, name, layer, data, isMoon: false });
  updatePlanetUI(data, name);
}

export function loadMoon3D(name, data = {}, canvasId = 'moon-viewer') {
  loadObject3D({ id: canvasId, name, layer: 'surface', data, isMoon: true });
}

function loadObject3D({ id, name, layer, data, isMoon }) {
  cleanupViewer(id);
  const canvas = document.getElementById(id);
  if (!canvas) return;

  const renderer = new THREE.WebGLRenderer({ 
    canvas, 
    alpha: true, 
    antialias: true 
  });
  renderer.setSize(canvas.width, canvas.height);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, canvas.width / canvas.height, 0.1, 1000);
  camera.position.z = 3.5;

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
  const sphere = new THREE.Mesh(geometry, material);
  scene.add(sphere);

  // Lumière
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  const light = new THREE.DirectionalLight(0xffffff, 0.9);
  light.position.set(5, 3, 5);
  scene.add(ambient, light);

  // Texture
  const loader = new THREE.TextureLoader();
  const basePath = isMoon
    ? `/lab/modules/dashboard/img/moons/${name}.jpg`
    : `/lab/modules/dashboard/img/planets/${name}-${layer}.jpg`;

  loader.load(basePath, texture => {
    material.map = texture;
    material.needsUpdate = true;
  });

  // Anneaux (pour Saturne)
  if (data.rings) {
    const ringGeometry = new THREE.RingGeometry(1.1, 1.8, 64);
    const ringMaterial = new THREE.MeshBasicMaterial({
      map: loader.load(`/lab/modules/dashboard/img/rings/${data.rings.texture}`),
      side: THREE.DoubleSide,
      transparent: true
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
    viewers.get(id).ring = ring;
  }

  function animate() {
    const state = viewers.get(id);
    if (!state) return;
    state.animId = requestAnimationFrame(animate);
    sphere.rotation.y += 0.002;
    if (state.ring) state.ring.rotation.z += 0.0005;
    renderer.render(scene, camera);
  }

  viewers.set(id, {
    renderer,
    scene,
    camera,
    sphere,
    animId: requestAnimationFrame(animate)
  });
}

export function cleanupViewer(id) {
  const state = viewers.get(id);
  if (!state) return;

  cancelAnimationFrame(state.animId);
  state.renderer.dispose();
  if (state.sphere) {
    state.sphere.geometry.dispose();
    state.sphere.material.dispose();
  }
  viewers.delete(id);
}

// Gestion du changement de couche
document.getElementById('layer-select')?.addEventListener('change', (e) => {
  const planet = document.getElementById('planet-main-viewer')?.dataset.planet;
  if (planet) loadPlanet3D(planet, e.target.value);
});
