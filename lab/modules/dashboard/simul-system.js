import { loadPlanet3D, cleanupViewer } from './viewer-planete-3d.js';

const layerSelect = document.getElementById('layer-select');
layerSelect?.addEventListener('change', (e) => {
  const newLayer = e.target.value;
  if (currentPlanet) {
    loadPlanet3D(currentPlanet.name, newLayer);
  }
});

const canvas = document.getElementById('simul-system');
const infoBox = document.getElementById('planet-info-content');
const closeBtn = document.getElementById('close-planet-viewer');
const viewerWidget = document.getElementById('widget-planet-viewer');
const infoWidget = document.getElementById('widget-planet-info');

let currentPlanet = null;

if (!canvas) {
  console.warn("⚠️ Aucun canvas #simul-system trouvé.");
} else {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const CENTER = { x: W / 2, y: H / 2 };

  const colors = {
    sun: '#ffaa00',
    planets: ['#aaa', '#f3a', '#0cf', '#c33', '#ffcc88', '#ccaa66', '#88f', '#44d'],
    ship: '#f0f',
    asteroid: '#888'
  };

  const referenceDate = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const now = new Date();
  const daysSince = (now - referenceDate) / (1000 * 60 * 60 * 24);

  function getAngleFromJ2000(days, period) {
    const fraction = (days % period) / period;
    return fraction * 2 * Math.PI;
  }

  // Nouvelle échelle orbitale normalisée
  const maxOrbitIndex = 9;
  const maxRadius = H / 2 - 20;
  const baseOrbit = 70;
  const scaleOrbit = (index) => {
    const ratio = Math.pow(index / maxOrbitIndex, 1.8);
    return baseOrbit + ratio * (maxRadius - baseOrbit);
  };

  const planets = [
    { name: 'mercure', label: 'Mercure', r: scaleOrbit(0), size: 2, speed: 0.004, angle: getAngleFromJ2000(daysSince, 87.97), color: colors.planets[0], data: { distance: "57.9 Mkm", temp: "167°C", radius: "2 440 km" } },
    { name: 'venus',   label: 'Vénus',   r: scaleOrbit(1), size: 3, speed: 0.003, angle: getAngleFromJ2000(daysSince, 224.70), color: colors.planets[1], data: { distance: "108.2 Mkm", temp: "464°C", radius: "6 052 km" } },
    { name: 'terre',   label: 'Terre',   r: scaleOrbit(2), size: 4, speed: 0.0025, angle: getAngleFromJ2000(daysSince, 365.25), color: colors.planets[2], data: { distance: "149.6 Mkm", temp: "15°C", radius: "6 371 km" } },
    { name: 'mars',    label: 'Mars',    r: scaleOrbit(3), size: 3, speed: 0.002, angle: getAngleFromJ2000(daysSince, 686.98), color: colors.planets[3], data: { distance: "227.9 Mkm", temp: "-63°C", radius: "3 390 km" } },
    { name: 'jupiter', label: 'Jupiter', r: scaleOrbit(4), size: 6, speed: 0.0015, angle: getAngleFromJ2000(daysSince, 4332.59), color: colors.planets[4], data: { distance: "778.3 Mkm", temp: "-108°C", radius: "69 911 km" } },
    { name: 'saturne', label: 'Saturne', r: scaleOrbit(5), size: 5, speed: 0.0012, angle: getAngleFromJ2000(daysSince, 10759.22), color: colors.planets[5], data: { distance: "1 429 Mkm", temp: "-139°C", radius: "58 232 km" } },
    { name: 'uranus',  label: 'Uranus',  r: scaleOrbit(6), size: 4, speed: 0.001, angle: getAngleFromJ2000(daysSince, 30688.5), color: colors.planets[6], data: { distance: "2 871 Mkm", temp: "-197°C", radius: "25 362 km" } },
    { name: 'neptune', label: 'Neptune', r: scaleOrbit(7), size: 4, speed: 0.0008, angle: getAngleFromJ2000(daysSince, 60182), color: colors.planets[7], data: { distance: "4 498 Mkm", temp: "-201°C", radius: "24 622 km" } }
  ];

  const dwarfPlanets = [
    { name: 'ceres',    r: scaleOrbit(3.5), size: 2, color: '#ccc', angle: getAngleFromJ2000(daysSince, 1680), label: 'Cérès', data: { distance: "413 Mkm", temp: "-105°C", radius: "473 km" } },
    { name: 'pluton',   r: scaleOrbit(8), size: 2, color: '#f9f', angle: getAngleFromJ2000(daysSince, 90560), label: 'Pluton', data: { distance: "5 900 Mkm", temp: "-229°C", radius: "1 188 km" } },
    { name: 'haumea',   r: scaleOrbit(8.3), size: 2, color: '#aff', angle: getAngleFromJ2000(daysSince, 103774), label: 'Hauméa', data: { distance: "6 452 Mkm", temp: "-241°C", radius: "816 × 1 218 km" } },
    { name: 'makemake', r: scaleOrbit(8.6), size: 2, color: '#fbb', angle: getAngleFromJ2000(daysSince, 112897), label: 'Makémaké', data: { distance: "6 850 Mkm", temp: "-243°C", radius: "715 km" } },
    { name: 'eris',     r: scaleOrbit(9), size: 2, color: '#c6f', angle: getAngleFromJ2000(daysSince, 203830), label: 'Éris', data: { distance: "10 120 Mkm", temp: "-231°C", radius: "1 163 km" } }
  ];

  const ship = { orbit: scaleOrbit(6.7), angle: 0, size: 3 };

  const asteroids = [];
  for (let i = 0; i < 150; i++) {
    const r = scaleOrbit(3.3) + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    asteroids.push({ r, angle });
  }

  function updatePlanetInfo(p) {
    infoBox.innerHTML = `
      <p>Nom : ${p.label}</p>
      <p>Distance : ${p.data.distance}</p>
      <p>Taille : ${p.data.radius}</p>
      <p>Température : ${p.data.temp}</p>
    `;
    viewerWidget?.classList.remove('hidden');
    infoWidget?.classList.remove('hidden');
  }

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;

    const allBodies = planets.concat(dwarfPlanets);
    let found = false;

    for (const p of allBodies) {
      const px = CENTER.x + Math.cos(p.angle) * p.r;
      const py = CENTER.y + Math.sin(p.angle) * p.r;
      const dist = Math.sqrt((clickX - px) ** 2 + (clickY - py) ** 2);

      if (dist <= Math.max(p.size, 6)) {
        currentPlanet = p;
        updatePlanetInfo(p);
        loadPlanet3D(p.name);
        console.log("✅ Planète détectée :", p.name);
        found = true;
        break;
      }
    }

    if (!found) console.log("❌ Aucun corps détecté");
  }

  canvas.addEventListener('click', handleClick);

  closeBtn?.addEventListener('click', () => {
    currentPlanet = null;
    viewerWidget?.classList.add('hidden');
    infoWidget?.classList.add('hidden');
    cleanupViewer();
  });

  function drawSystem() {
    ctx.clearRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = colors.sun;
    ctx.fill();

    asteroids.forEach(a => {
      const x = CENTER.x + Math.cos(a.angle) * a.r;
      const y = CENTER.y + Math.sin(a.angle) * a.r;
      ctx.fillStyle = colors.asteroid;
      ctx.fillRect(x, y, 1.5, 1.5);
      a.angle += 0.0003;
    });

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

    dwarfPlanets.forEach(p => {
      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.angle += 0.0003;
    });

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
