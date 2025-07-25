// simul-system.js — radar planétaire avec données enrichies et UI dynamique
import { loadPlanet3D } from './viewer-planete-3d.js';
import { updatePlanetUI } from './planet-data.js';
import { PLANET_DATA } from './planet-database.js';

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
    { name: 'mercure', label: 'Mercure', r: scaleOrbit(0), size: 2, speed: 0.004, angle: getAngleFromJ2000(daysSince, 87.97), color: colors.planets[0] },
    { name: 'venus', label: 'Vénus', r: scaleOrbit(1), size: 3, speed: 0.003, angle: getAngleFromJ2000(daysSince, 224.70), color: colors.planets[1] },
    { name: 'terre', label: 'Terre', r: scaleOrbit(2), size: 4, speed: 0.0025, angle: getAngleFromJ2000(daysSince, 365.25), color: colors.planets[2] },
    { name: 'mars', label: 'Mars', r: scaleOrbit(3), size: 3, speed: 0.002, angle: getAngleFromJ2000(daysSince, 686.98), color: colors.planets[3] },
    { name: 'jupiter', label: 'Jupiter', r: scaleOrbit(4), size: 6, speed: 0.0015, angle: getAngleFromJ2000(daysSince, 4332.59), color: colors.planets[4] },
    { name: 'saturne', label: 'Saturne', r: scaleOrbit(5), size: 5, speed: 0.0012, angle: getAngleFromJ2000(daysSince, 10759.22), color: colors.planets[5] },
    { name: 'uranus', label: 'Uranus', r: scaleOrbit(6), size: 4, speed: 0.001, angle: getAngleFromJ2000(daysSince, 30688.5), color: colors.planets[6] },
    { name: 'neptune', label: 'Neptune', r: scaleOrbit(7), size: 4, speed: 0.0008, angle: getAngleFromJ2000(daysSince, 60182), color: colors.planets[7] },
    { name: 'planete9', label: 'Planète Neuf', r: scaleOrbit(9.5), size: 3, speed: 0.0001, angle: getAngleFromJ2000(daysSince, 180000), color: '#8888ff' }
  ];

  const dwarfPlanets = [
    { name: 'ceres', label: 'Cérès', r: scaleOrbit(3.5), size: 2, speed: 0.0005, angle: getAngleFromJ2000(daysSince, 1680), color: '#ccc' },
    { name: 'pluton', label: 'Pluton', r: scaleOrbit(8), size: 2, speed: 0.0003, angle: getAngleFromJ2000(daysSince, 90560), color: '#f9f' },
    { name: 'haumea', label: 'Hauméa', r: scaleOrbit(8.3), size: 2, speed: 0.00025, angle: getAngleFromJ2000(daysSince, 103774), color: '#aff' },
    { name: 'makemake', label: 'Makémaké', r: scaleOrbit(8.6), size: 2, speed: 0.00022, angle: getAngleFromJ2000(daysSince, 112897), color: '#fbb' },
    { name: 'eris', label: 'Éris', r: scaleOrbit(9), size: 2, speed: 0.0002, angle: getAngleFromJ2000(daysSince, 203830), color: '#c6f' }
  ];

  const shipTrail = [];

const ship = {
  x: CENTER.x + 100,
  y: CENTER.y,
  angle: 0,
  speed: 0.2,
  rotationSpeed: 0.002,
  size: 3
};

  const asteroids = [];
  for (let i = 0; i < 150; i++) {
    const r = scaleOrbit(3.3) + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    asteroids.push({ r, angle });
  }

  function handleClick(e) {
  const rect = canvas.getBoundingClientRect();
  const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
  const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

  const HITBOX_PADDING = 12;
  const allBodies = planets.concat(dwarfPlanets);

    // Clic sur le Soleil (centre exact)
const distToSun = Math.sqrt((clickX - CENTER.x) ** 2 + (clickY - CENTER.y) ** 2);
if (distToSun <= 14) {
  currentPlanet = { name: 'soleil', label: 'Soleil' };
  const data = PLANET_DATA['soleil'];
  loadPlanet3D('soleil', 'surface', data);
  updatePlanetUI(data, 'soleil');
  return;
}


  for (const p of allBodies) {
    const px = CENTER.x + Math.cos(p.angle) * p.r;
    const py = CENTER.y + Math.sin(p.angle) * p.r;
    const dist = Math.sqrt((clickX - px) ** 2 + (clickY - py) ** 2);

    if (dist <= p.size + HITBOX_PADDING) {
      currentPlanet = p;
      const data = PLANET_DATA[p.name] || {};
      loadPlanet3D(p.name, 'surface', data);
      updatePlanetUI(data, p.name);
      break;
    }
  }
}

  canvas.addEventListener('click', handleClick);

  function drawSystem() {
    ctx.clearRect(0, 0, W, H);

    // Soleil
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = colors.sun;
    ctx.fill();

    // Astéroïdes
    asteroids.forEach(a => {
      const x = CENTER.x + Math.cos(a.angle) * a.r;
      const y = CENTER.y + Math.sin(a.angle) * a.r;
      ctx.fillStyle = colors.asteroid;
      ctx.fillRect(x, y, 1.5, 1.5);
      a.angle += 0.0003;
    });

    // Planètes
    planets.forEach(p => {
      // orbit style spécifique pour la planète 9
      if (p.name === 'planete9') {
        ctx.strokeStyle = '#8888ff';
        ctx.setLineDash([3, 2]);
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.setLineDash([]);
      }
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

    // Planètes naines
    dwarfPlanets.forEach(p => {
      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      p.angle += 0.0003;
    });

    // Vaisseau (triangle directionnel libre)
  ship.angle += ship.rotationSpeed;
  ship.x += Math.cos(ship.angle) * ship.speed;
  ship.y += Math.sin(ship.angle) * ship.speed;

  if (ship.x < 0 || ship.x > W) ship.angle = Math.PI - ship.angle;
  if (ship.y < 0 || ship.y > H) ship.angle = -ship.angle;

  ctx.beginPath();
  ctx.moveTo(ship.x + 5 * Math.cos(ship.angle), ship.y + 5 * Math.sin(ship.angle));
  ctx.lineTo(ship.x + 3 * Math.cos(ship.angle + Math.PI * 0.75), ship.y + 3 * Math.sin(ship.angle + Math.PI * 0.75));
  ctx.lineTo(ship.x + 3 * Math.cos(ship.angle - Math.PI * 0.75), ship.y + 3 * Math.sin(ship.angle - Math.PI * 0.75));
  ctx.closePath();
  // Vaisseau (triangle directionnel libre avec évitement solaire + traînée)
  ship.angle += ship.rotationSpeed;
  ship.x += Math.cos(ship.angle) * ship.speed;
  ship.y += Math.sin(ship.angle) * ship.speed;

  const distToSun = Math.sqrt((ship.x - CENTER.x) ** 2 + (ship.y - CENTER.y) ** 2);
  if (distToSun < 80) {
    // évite le Soleil (rebond intelligent)
    ship.angle += Math.PI / 2;
  }

  // ajouter à la traînée
  shipTrail.push({ x: ship.x, y: ship.y, alpha: 1 });
  if (shipTrail.length > 30) shipTrail.shift();

  // dessiner traînée
  shipTrail.forEach(pt => {
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(136, 136, 255, ${pt.alpha})`;
    ctx.fill();
    pt.alpha *= 0.9; // disparition progressive
  });

  // vaisseau triangle
  ctx.beginPath();
  ctx.moveTo(ship.x + 5 * Math.cos(ship.angle), ship.y + 5 * Math.sin(ship.angle));
  ctx.lineTo(ship.x + 3 * Math.cos(ship.angle + Math.PI * 0.75), ship.y + 3 * Math.sin(ship.angle + Math.PI * 0.75));
  ctx.lineTo(ship.x + 3 * Math.cos(ship.angle - Math.PI * 0.75), ship.y + 3 * Math.sin(ship.angle - Math.PI * 0.75));
  ctx.closePath();
  ctx.fillStyle = colors.ship;
  ctx.fill();

    requestAnimationFrame(drawSystem);
  }

  drawSystem();
}
