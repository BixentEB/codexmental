// /dashb/modules/dashboard/system3d.js
// Scène 3D minimaliste dans #radar, avec OrbitControls + Raycaster + resize
const SEL = '#radar';

(async () => {
  const host = document.querySelector(SEL);
  if (!host) throw new Error('Radar host not found');

  // Import Three + controls depuis un CDN (modulaire)
  const [{ default: * as THREE }, { OrbitControls }] = await Promise.all([
    import('https://unpkg.com/three@0.160.0/build/three.module.js'),
    import('https://unpkg.com/three@0.160.0/examples/jsm/controls/OrbitControls.js'),
  ]);

  // Renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0); // transparent
  host.appendChild(renderer.domElement);

  // Scene + Camera
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, host.clientWidth / host.clientHeight, 0.1, 20000);
  camera.position.set(0, 220, 560);

  // Controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 180;
  controls.maxDistance = 2000;
  controls.target.set(0, 0, 0);

  // Lights
  const sunLight = new THREE.PointLight(0xffffff, 2.2, 0);
  sunLight.position.set(0, 0, 0);
  scene.add(sunLight);

  // Sun (simple)
  const sun = new THREE.Mesh(
    new THREE.SphereGeometry(50, 32, 16),
    new THREE.MeshBasicMaterial({ color: 0xffcc55 })
  );
  scene.add(sun);

  // Earth + orbit preview (très simplifié)
  const earth = new THREE.Mesh(
    new THREE.SphereGeometry(16, 32, 16),
    new THREE.MeshStandardMaterial({ color: 0x5aa7ff, metalness: 0.0, roughness: 0.7 })
  );
  earth.position.set(180, 0, 0);
  scene.add(earth);

  const orbitGeo = new THREE.RingGeometry(179.5, 180.5, 256);
  orbitGeo.rotateX(-Math.PI / 2);
  const orbit = new THREE.Mesh(
    orbitGeo,
    new THREE.MeshBasicMaterial({ color: 0x00e5ff, transparent: true, opacity: 0.15, side: THREE.DoubleSide })
  );
  scene.add(orbit);

  // Raycaster
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  const pickables = [sun, earth];

  function onClick(ev) {
    const rect = renderer.domElement.getBoundingClientRect();
    mouse.x = ((ev.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((ev.clientY - rect.top) / rect.height) * 2 + 1;
    raycaster.setFromCamera(mouse, camera);
    const hit = raycaster.intersectObjects(pickables, true)[0];
    if (hit?.object) {
      const id = hit.object === earth ? 'earth' : 'sun';
      // bus global si dispo
      const bus = window.__lab?.bus || document;
      bus.dispatchEvent(new CustomEvent('object:selected', { detail: { id, type: 'planet' } }));
    }
  }
  renderer.domElement.addEventListener('click', onClick);

  // Resize
  function resize() {
    const w = host.clientWidth, h = host.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(host);

  // Animation (rotation propre + révolution simplifiée)
  let t = 0;
  function animate() {
    t += 0.0025; // vitesse temps (à brancher plus tard sur une timebar)
    earth.position.set(Math.cos(t) * 180, 0, Math.sin(t) * 180);
    earth.rotation.y += 0.01;
    controls.update();
    renderer.render(scene, camera);
    raf = requestAnimationFrame(animate);
  }
  let raf = requestAnimationFrame(animate);

  // Pause quand onglet caché
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { cancelAnimationFrame(raf); }
    else { raf = requestAnimationFrame(animate); }
  });

  // Clean-up si jamais on swap de mode
  window.addEventListener('beforeunload', () => {
    cancelAnimationFrame(raf);
    renderer.dispose();
    orbitGeo.dispose();
  });
})();
