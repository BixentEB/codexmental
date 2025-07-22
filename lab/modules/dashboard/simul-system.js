// ✅ simul-system.js corrigé pour dashboard stellaire (radar complet + données extraites)
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
    { name: 'mercure', label: 'Mercure', r: scaleOrbit(0), size: 2, speed: 0.004, angle: getAngleFromJ2000(daysSince, 87.97), color: colors.planets[0], data: { name: 'Mercure', distance: "57.9 Mkm", temp: "167°C", radius: "2 440 km" } },
    { name: 'venus', label: 'Vénus', r: scaleOrbit(1), size: 3, speed: 0.003, angle: getAngleFromJ2000(daysSince, 224.70), color: colors.planets[1], data: { name: 'Vénus', distance: "108.2 Mkm", temp: "464°C", radius: "6 052 km" } },
    { name: 'terre', label: 'Terre', r: scaleOrbit(2), size: 4, speed: 0.0025, angle: getAngleFromJ2000(daysSince, 365.25), color: colors.planets[2], data: { name: 'Terre', distance: "149.6 Mkm", temp: "15°C", radius: "6 371 km" } },
    { name: 'mars', label: 'Mars', r: scaleOrbit(3), size: 3, speed: 0.002, angle: getAngleFromJ2000(daysSince, 686.98), color: colors.planets[3], data: { name: 'Mars', distance: "227.9 Mkm", temp: "-63°C", radius: "3 390 km" } },
    { name: 'jupiter', label: 'Jupiter', r: scaleOrbit(4), size: 6, speed: 0.0015, angle: getAngleFromJ2000(daysSince, 4332.59), color: colors.planets[4], data: { name: 'Jupiter', distance: "778.3 Mkm", temp: "-108°C", radius: "69 911 km" } },
    { name: 'saturne', label: 'Saturne', r: scaleOrbit(5), size: 5, speed: 0.0012, angle: getAngleFromJ2000(daysSince, 10759.22), color: colors.planets[5], data: { name: 'Saturne', distance: "1 429 Mkm", temp: "-139°C", radius: "58 232 km" } },
    { name: 'uranus', label: 'Uranus', r: scaleOrbit(6), size: 4, speed: 0.001, angle: getAngleFromJ2000(daysSince, 30688.5), color: colors.planets[6], data: { name: 'Uranus', distance: "2 871 Mkm", temp: "-197°C", radius: "25 362 km" } },
    { name: 'neptune', label: 'Neptune', r: scaleOrbit(7), size: 4, speed: 0.0008, angle: getAngleFromJ2000(daysSince, 60182), color: colors.planets[7], data: { name: 'Neptune', distance: "4 498 Mkm", temp: "-201°C", radius: "24 622 km" } }
  ];

  const dwarfPlanets = [
    { name: 'ceres', label: 'Cérès', r: scaleOrbit(3.5), size: 2, speed: 0.0005, angle: getAngleFromJ2000(daysSince, 1680), color: '#ccc', data: { name: 'Cérès', distance: "413 Mkm", temp: "-105°C", radius: "473 km" } },
    { name: 'pluton', label: 'Pluton', r: scaleOrbit(8), size: 2, speed: 0.0003, angle: getAngleFromJ2000(daysSince, 90560), color: '#f9f', data: { name: 'Pluton', distance: "5 900 Mkm", temp: "-229°C", radius: "1 188 km" } },
    { name: 'haumea', label: 'Hauméa', r: scaleOrbit(8.3), size: 2, speed: 0.00025, angle: getAngleFromJ2000(daysSince, 103774), color: '#aff', data: { name: 'Hauméa', distance: "6 452 Mkm", temp: "-241°C", radius: "816 × 1 218 km" } },
    { name: 'makemake', label: 'Makémaké', r: scaleOrbit(8.6), size: 2, speed: 0.00022, angle: getAngleFromJ2000(daysSince, 112897), color: '#fbb', data: { name: 'Makémaké', distance: "6 850 Mkm", temp: "-243°C", radius: "715 km" } },
    { name: 'eris', label: 'Éris', r: scaleOrbit(9), size: 2, speed: 0.0002, angle: getAngleFromJ2000(daysSince, 203830), color: '#c6f', data: { name: 'Éris', distance: "10 120 Mkm", temp: "-231°C", radius: "1 163 km" } }
  ];

  const ship = { orbit: scaleOrbit(6.7), angle: 0, size: 3 };

  const asteroids = [];
  for (let i = 0; i < 150; i++) {
    const r = scaleOrbit(3.3) + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    asteroids.push({ r, angle });
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

      p.angle += p.speed;
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
