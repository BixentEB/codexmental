// ✅ simul-system.js corrigé pour dashboard stellaire (radar complet rétabli)
import { loadPlanet3D, cleanupViewer } from './viewer-planete-3d.js';

const canvas = document.getElementById('simul-system');
let currentPlanet = null;

if (!canvas) {
  console.warn("⚠️ Aucun canvas #simul-system trouvé.");
} else {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const CENTER = { x: W / 2, y: H / 2 };

  function getAngleFromJ2000(days, period) {
    const fraction = (days % period) / period;
    return fraction * 2 * Math.PI;
  }

  const referenceDate = new Date(Date.UTC(2000, 0, 1, 12));
  const now = new Date();
  const daysSince = (now - referenceDate) / (1000 * 60 * 60 * 24);

  const colors = {
    sun: '#ffaa00',
    planets: ['#aaa', '#f3a', '#0cf', '#c33', '#ffcc88', '#ccaa66', '#88f', '#44d'],
    ship: '#f0f',
    asteroid: '#888'
  };

  const baseOrbit = 70;
  const maxRadius = H / 2 - 20;
  const maxOrbitIndex = 9;
  const scaleOrbit = (index) => {
    const ratio = Math.pow(index / maxOrbitIndex, 1.8);
    return baseOrbit + ratio * (maxRadius - baseOrbit);
  };

  const planets = [
    { name: 'mars', label: 'Mars', r: scaleOrbit(3), size: 3, speed: 0.002, angle: getAngleFromJ2000(daysSince, 686.98), color: colors.planets[3], data: { distance: '227.9 Mkm', temp: '-63°C', radius: '3 390 km' } },
    // autres planètes à compléter ici avec scaleOrbit
  ];

  const dwarfPlanets = [
    // Exemples : ceres, pluton, etc. avec scaleOrbit et angle
  ];

  const asteroids = [];
  for (let i = 0; i < 150; i++) {
    const r = scaleOrbit(3.3) + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    asteroids.push({ r, angle });
  }

  const ship = { orbit: scaleOrbit(6.7), angle: 0, size: 3 };

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

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    const allBodies = planets.concat(dwarfPlanets);
    for (const p of allBodies) {
      const px = CENTER.x + Math.cos(p.angle) * p.r;
      const py = CENTER.y + Math.sin(p.angle) * p.r;
      const dist = Math.sqrt((clickX - px) ** 2 + (clickY - py) ** 2);

      if (dist <= Math.max(p.size, 6)) {
        currentPlanet = p;
        injectPlanetData(p.data);
        loadPlanet3D(p.name, 'surface', p.data);
        break;
      }
    }
  }

  canvas.addEventListener('click', handleClick);

  function drawSystem() {
    ctx.clearRect(0, 0, W, H);

    // ☀️ Soleil
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = colors.sun;
    ctx.fill();

    // ☄️ Astéroïdes
    asteroids.forEach(a => {
      const x = CENTER.x + Math.cos(a.angle) * a.r;
      const y = CENTER.y + Math.sin(a.angle) * a.r;
      ctx.fillStyle = colors.asteroid;
      ctx.fillRect(x, y, 1.5, 1.5);
      a.angle += 0.0003;
    });

    // 🪐 Planètes
    planets.forEach(p => {
      ctx.beginPath();
      ctx.arc(CENTER.x, CENTER.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.stroke();

      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      p.angle += p.speed;
    });

    // 🌑 Planètes naines
    dwarfPlanets.forEach(p => {
      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color || '#ccc';
      ctx.fill();

      p.angle += 0.0003;
    });

    // 🚀 Vaisseau fictif
    const sx = CENTER.x + Math.cos(ship.angle) * ship.orbit;
    const sy = CENTER.y + Math.sin(ship.angle) * ship.orbit;
    ctx.beginPath();
    ctx.arc(sx, sy, ship.size, 0, Math.PI * 2);
    ctx.fillStyle = colors.ship;
    ctx.fill();

    ship.angle += 0.0007;

    requestAnimationFrame(drawSystem);
  }

  drawSystem();
}
