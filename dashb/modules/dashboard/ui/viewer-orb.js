// viewer-orb.js — mini viewer 3D indépendant (Three.js requis).
// Deux instances: planète (canvas #planet-main-viewer) et lune (canvas #moon-viewer).

(() => {
  if (!window.THREE) {
    console.warn('[OrbViewer] THREE non trouvé. Le viewer restera inactif.');
    window.OrbViewer = { showPlanet(){}, showMoon(){}, clearPlanet(){}, clearMoon(){}, setLayer(){} };
    return;
  }

  const { Scene, PerspectiveCamera, WebGLRenderer, SRGBColorSpace,
          AmbientLight, DirectionalLight, SphereGeometry,
          MeshPhongMaterial, Mesh, TextureLoader, Color, Clock } = THREE;

  const TEX = {
    planets: {
      soleil: '/dashb/modules/dashboard/assets/textures/planets/sun.jpg',
      sun: '/dashb/modules/dashboard/assets/textures/planets/sun.jpg',
      mercure: '/dashb/modules/dashboard/assets/textures/planets/mercury.jpg',
      mercury: '/dashb/modules/dashboard/assets/textures/planets/mercury.jpg',
      venus: '/dashb/modules/dashboard/assets/textures/planets/venus.jpg',
      terre: '/dashb/modules/dashboard/assets/textures/planets/earth.jpg',
      earth: '/dashb/modules/dashboard/assets/textures/planets/earth.jpg',
      mars: '/dashb/modules/dashboard/assets/textures/planets/mars.jpg',
      jupiter: '/dashb/modules/dashboard/assets/textures/planets/jupiter.jpg',
      saturne: '/dashb/modules/dashboard/assets/textures/planets/saturn.jpg',
      saturn: '/dashb/modules/dashboard/assets/textures/planets/saturn.jpg',
      uranus: '/dashb/modules/dashboard/assets/textures/planets/uranus.jpg',
      neptune: '/dashb/modules/dashboard/assets/textures/planets/neptune.jpg',
      pluton: '/dashb/modules/dashboard/assets/textures/planets/pluto.jpg',
      pluto: '/dashb/modules/dashboard/assets/textures/planets/pluto.jpg',
      ceres: '/dashb/modules/dashboard/assets/textures/planets/ceres.jpg',
      makemake: '/dashb/modules/dashboard/assets/textures/planets/makemake.jpg',
      haumea: '/dashb/modules/dashboard/assets/textures/planets/haumea.jpg',
      eris: '/dashb/modules/dashboard/assets/textures/planets/eris.jpg',
      planete9: '/dashb/modules/dashboard/assets/textures/planets/planet9.jpg',
      planet9: '/dashb/modules/dashboard/assets/textures/planets/planet9.jpg'
    },
    moons: {
      lune: '/dashb/modules/dashboard/assets/textures/moons/moon.jpg',
      moon: '/dashb/modules/dashboard/assets/textures/moons/moon.jpg',
      europa: '/dashb/modules/dashboard/assets/textures/moons/europa.jpg',
      ganymede: '/dashb/modules/dashboard/assets/textures/moons/ganymede.jpg',
      io: '/dashb/modules/dashboard/assets/textures/moons/io.jpg',
      callisto: '/dashb/modules/dashboard/assets/textures/moons/callisto.jpg',
      phobos: '/dashb/modules/dashboard/assets/textures/moons/phobos.jpg',
      deimos: '/dashb/modules/dashboard/assets/textures/moons/deimos.jpg'
    },
    placeholder: '/assets/textures/placeholder.jpg'
  };

  const texLoader = new TextureLoader();
  const loadTexture = (url, onOK, onErr) => {
    texLoader.load(url, (tex) => { try { tex.colorSpace = SRGBColorSpace; } catch{}; onOK(tex); }, undefined, onErr);
  };

  class Orb {
    constructor(canvasId) {
      this.canvasId = canvasId;
      this.canvas = document.getElementById(canvasId);
      this.clock = new Clock();
      this.scene = new Scene();
      this.camera = new PerspectiveCamera(45, 1, 0.1, 100);
      this.renderer = new WebGLRenderer({ canvas:this.canvas, antialias:true, alpha:true, preserveDrawingBuffer:false });
      try { this.renderer.outputColorSpace = SRGBColorSpace; } catch{}

      this.camera.position.set(0, 0, 3.2);

      const amb = new AmbientLight(0xffffff, .55);
      const dir = new DirectionalLight(0xffffff, .95); dir.position.set(2,2,3);
      this.scene.add(amb, dir);

      const geo = new SphereGeometry(1, 48, 48);
      this.material = new MeshPhongMaterial({ color: new Color('#7799aa') });
      this.mesh = new Mesh(geo, this.material);
      this.scene.add(this.mesh);

      this.resize();
      window.addEventListener('resize', () => this.resize());
      this.running = true; this.animate();
    }
    resize() {
      if (!this.canvas) return;
      const w = this.canvas.clientWidth || this.canvas.width || 300;
      const h = this.canvas.clientHeight || this.canvas.height || 220;
      this.renderer.setSize(w, h, false);
      this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    }
    setTexture(url) {
      if (!url) { this.material.map = null; this.material.needsUpdate = true; return; }
      loadTexture(url, (tex) => { this.material.map = tex; this.material.needsUpdate = true; }, () => { this.material.map = null; this.material.color = new Color('#778899'); });
    }
    setColor(hex) { this.material.map = null; this.material.color = new Color(hex); this.material.needsUpdate = true; }
    clear() { this.setTexture(null); }
    animate() {
      if (!this.running) return;
      const dt = this.clock.getDelta();
      this.mesh.rotation.y += dt * 0.25;
      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(() => this.animate());
    }
  }

  const getCanvas = (id) => document.getElementById(id);
  let planetOrb = null, moonOrb = null;
  const ensureOrbs = () => {
    if (!planetOrb && getCanvas('planet-main-viewer')) planetOrb = new Orb('planet-main-viewer');
    if (!moonOrb && getCanvas('moon-viewer')) moonOrb = new Orb('moon-viewer');
  };

  const pickTex = (dict, id) => {
    if (!id) return null;
    if (window.ORB_TEXTURES?.[id]) return window.ORB_TEXTURES[id];
    return dict[id] || null;
  };

  let currentLayer = 'surface';

  window.OrbViewer = {
    showPlanet(id, layer='surface') {
      ensureOrbs(); currentLayer = layer || 'surface';
      const key = (id||'').toLowerCase();
      const base = pickTex(TEX.planets, key);
      const layered = base ? base.replace(/(\.\w+)$/, (_,ext)=> currentLayer==='surface'?ext : currentLayer==='cloud'? `_cloud${ext}` : `_ir${ext}`) : null;
      if (planetOrb) {
        planetOrb.setTexture(layered || base || TEX.placeholder);
      }
    },
    clearPlanet() { planetOrb?.clear(); },
    showMoon(id) {
      ensureOrbs();
      const key = (id||'').toLowerCase();
      const url = pickTex(TEX.moons, key) || TEX.placeholder;
      if (moonOrb) moonOrb.setTexture(url);
    },
    clearMoon() { moonOrb?.clear(); },
    setLayer(layer) { currentLayer = layer||'surface'; /* on actualise si besoin */ }
  };
})();
