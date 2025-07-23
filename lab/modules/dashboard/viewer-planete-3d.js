// viewer-planete-3d.js – Visualiseur 3D multi-source (planètes + lunes)
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';
import { updatePlanetUI } from './planet-data.js';

const viewers = new Map(); // key = canvasId

export function loadPlanet3D(name, layer = 'surface', data = {}, canvasId = 'planet-main-viewer') {
  loadObject3D({
    id: canvasId,
    name,
    layer,
    data,
    isMoon: false
  });
  updatePlanetUI(data, name);

  const title = document.getElementById('planet-viewer-title');
  if (title) title.textContent = name.toUpperCase();

  const viewer = document.getElementById(canvasId);
  if (viewer) viewer.dataset.planet = name;
}

export function loadMoon3D(name, data = {}, canvasId = 'moon-viewer') {
  loadObject3D({
    id: canvasId,
    name,
    layer: 'surface',
    data,
    isMoon: true
  });

  const moonBlock = document.getElementById('info-moon-3d');
  if (moonBlock) moonBlock.style.display = 'block';
  const moonTitle = document.getElementById('moon-viewer-title');
  if (moonTitle) moonTitle.textContent = name.toUpperCase();
}

function loadObject3D({ id, name, layer, data, isMoon }) {
  const canvas = document.getElementById(id);
  if (!canvas) {
    console.warn(`⚠️ Canvas #${id} introuvable`);
    return;
  }

  cleanupViewer(id);

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(canvas.clientWidth, canvas.clientHeight);
  renderer.outputEncoding = THREE.sRGBEncoding;

  const scene = new THREE.Scene();
  const ambient = new THREE.AmbientLight(0xffffff, 0.35);
  const light = new THREE.DirectionalLight(0xffffff, 0.9);
  light.position.set(5, 3, 5);
  scene.add(ambient);
  scene.add(light);

  const camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
  camera.position.z = 3.5;
  camera.position.y = 0.2; // 🧭 Correction de centrage vertical

  const geometry = new THREE.SphereGeometry(1, 64, 64);
  const material = new THREE.MeshPhongMaterial({ color: 0x888888 });
  const sphere = new THREE.Mesh(geometry, material);
  sphere.scale.set(0.7, 0.7, 0.7);
  scene.add(sphere);

  const loader = new THREE.TextureLoader();
  const basePath = isMoon
    ? `/lab/modules/dashboard/img/moons/${data.image || `${name}.jpg`}`
    : `/lab/modules/dashboard/img/planets/${name.toLowerCase()}-${layer}.jpg`;

  loader.load(
    basePath,
    texture => {
      texture.encoding = THREE.sRGBEncoding;
      material.map = texture;
      material.needsUpdate = true;
    },
    undefined,
    () => {
      console.warn(`❌ Texture manquante : ${basePath}`);
      const target = document.querySelector('#info-data .section-content');
      if (target && !isMoon) {
        target.innerHTML = `<p>Données de surface indisponibles. Expédition en cours...</p>`;
      }
    }
  );

  let ringMesh = null;
  if (!isMoon && data.rings?.texture) {
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

  function animate() {
    const state = viewers.get(id);
    if (!state) return;
    state.animId = requestAnimationFrame(animate);
    sphere.rotation.y += 0.002;
    if (ringMesh) ringMesh.rotation.z += 0.0005;
    renderer.render(scene, camera);
  }

  viewers.set(id, {
    renderer,
    scene,
    camera,
    sphere,
    ringMesh,
    animId: requestAnimationFrame(animate)
  });
}

export function cleanupViewer(id) {
  const state = viewers.get(id);
  if (!state) return;
  cancelAnimationFrame(state.animId);

  if (state.renderer) state.renderer.dispose();
  if (state.sphere) {
    state.scene.remove(state.sphere);
    state.sphere.geometry.dispose();
    state.sphere.material.map?.dispose();
    state.sphere.material.dispose();
  }
  if (state.ringMesh) {
    state.scene.remove(state.ringMesh);
    state.ringMesh.geometry.dispose();
    state.ringMesh.material.map?.dispose();
    state.ringMesh.material.dispose();
  }

  viewers.delete(id);
}

const selector = document.getElementById('layer-select');
if (selector) {
  selector.addEventListener('change', e => {
    const newLayer = e.target.value;
    const current = document.querySelector('#planet-main-viewer');
    if (current?.dataset?.planet) {
      loadPlanet3D(current.dataset.planet, newLayer);
    }
  });
}

window.loadMoon3D = loadMoon3D;
