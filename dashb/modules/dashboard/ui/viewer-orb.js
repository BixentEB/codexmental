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
      soleil: '/assets/textures/planets/sun.jpg',
      sun: '/assets/textures/planets/sun.jpg',
      mercure: '/assets/textures/planets/mercury.jpg',
      mercury: '/assets/textures/planets/mercury.jpg',
      venus: '/assets/textures/planets/venus.jpg',
      terre: '/assets/textures/planets/earth.jpg',
      earth: '/assets/textures/planets/earth.jpg',
      lune: '/assets/textures/moons/moon.jpg',
      moon: '/assets/textures/moons/moon.jpg',
      mars: '/assets/textures/planets/mars.jpg',
      jupiter: '/assets/textures/planets/jupiter.jpg',
      saturne: '/assets/textures/planets/saturn.jpg',
      saturn: '/assets/textures/planets/saturn.jpg',
      uranus: '/assets/textures/planets/uranus.jpg',
      neptune: '/assets/textures/planets/neptune.jpg',
      pluton: '/assets/textures/planets/pluto.jpg',
      pluto: '/assets/textures/planets/pluto.jpg',
      ceres: '/assets/textures/planets/ceres.jpg',
      makemake: '/assets/textures/planets/makemake.jpg',
      haumea: '/assets/textures/planets/haumea.jpg',
      eris: '/assets/textures/planets/eris.jpg'
    },
    moons: {
      lune: '/assets/textures/moons/moon.jpg',
      moon: '/assets/textures/moons/moon.jpg',
      europa: '/assets/textures/moons/europa.jpg',
      ganymede: '/assets/textures/moons/ganymede.jpg',
      io: '/assets/textures/moons/io.jpg',
      callisto: '/assets/textures/moons/callisto.jpg',
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
