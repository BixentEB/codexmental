// viewer-planete-3d.js – Visualiseur 3D avancé avec Three.js

import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.155.0/build/three.module.js';

let scene, camera, renderer, sphere, clouds, animateId;
const canvas = document.getElementById('planet-viewer-canvas');

// Chargement dynamique d'une planète
export function loadPlanet3D(name = 'terre') {
  cleanupViewer();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
  camera.position.z = 2.6;

  renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
  renderer.setSize(200, 200);
  renderer.setPixelRatio(window.devicePixelRatio);

  // Lumière
  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(5, 3, 5);
  scene.add(light);
  scene.add(new THREE.AmbientLight(0x222222));

  const loader = new THREE.TextureLoader();
  const base = `/lab/modules/dashboard/img/planets/${name.toLowerCase()}`;

  // Chargements parallèles avec promesses
  Promise.all([
    loadTex(loader, `${base}.jpg`, 'diffuse'),
    loadTex(loader, `${base}-bump.jpg`, 'bump'),
    loadTex(loader, `${base}-spec.jpg`, 'spec'),
    loadTex(loader, `${base}-clouds.png`, 'clouds')
  ]).then(([diffuse, bump, specular, cloudTex]) => {
    // Matériau principal avec relief et reflets si dispos
    const material = new THREE.MeshPhongMaterial({
      map: diffuse,
      bumpMap: bump || null,
      bumpScale: bump ? 0.04 : 0,
      specularMap: specular || null,
      specular: specular ? new THREE.Color('#444') : new THREE.Color('#000')
    });

    const geometry = new THREE.SphereGeometry(1, 64, 64);
    sphere = new THREE.Mesh(geometry, material);
    scene.add(sphere);

    // Nuages en sphère transparente au-dessus
    if (cloudTex) {
      const cloudMat = new THREE.MeshLambertMaterial({
        map: cloudTex,
        transparent: true,
        opacity: 0.6,
        depthWrite: false
      });
      const cloudGeo = new THREE.SphereGeometry(1.01, 64, 64);
      clouds = new THREE.Mesh(cloudGeo, cloudMat);
      scene.add(clouds);
    }

    animate();
  });
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
