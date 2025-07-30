// simul-system.js — radar planétaire avec données enrichies et UI dynamique
import { loadPlanet3D } from './viewer-planete-3d.js';
import { updatePlanetUI } from './planet-data.js';
import { PLANET_DATA } from './planet-database.js';
import { Ship } from './ship-module.js';
import { narrate } from './ship-module-narratif.js';
import { Starfield } from './ship-stars.js';
import { generateKuiperBelt, drawKuiperBelt } from './kuiper-belt.js';
import { generateAsteroidBelt, drawAsteroidBelt, isInAsteroidHitbox } from './asteroid-belt.js';

const canvas = document.getElementById('simul-system');
let currentPlanet = null;

if (!canvas) {
  console.warn("⚠️ Aucun canvas #simul-system trouvé.");
} else {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const starfield = new Starfield(W, H);
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
    asteroid: '#888',
    kuiper: 'rgba(130,130,255,0.4)'
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
    { name: 'planete9', label: 'Planète Neuf', r: scaleOrbit(9.2), size: 3, speed: 0.0001, angle: getAngleFromJ2000(daysSince, 180000), color: '#8888ff' }
  ];

  const dwarfPlanets = [
    { name: 'ceres', label: 'Cérès', r: scaleOrbit(3.5), size: 2, speed: 0.0005, angle: getAngleFromJ2000(daysSince, 1680), color: '#ccc' },
    { name: 'pluton', label: 'Pluton', r: scaleOrbit(8), size: 2, speed: 0.0003, angle: getAngleFromJ2000(daysSince, 90560), color: '#f9f' },
    { name: 'haumea', label: 'Hauméa', r: scaleOrbit(8.3), size: 2, speed: 0.00025, angle: getAngleFromJ2000(daysSince, 103774), color: '#aff' },
    { name: 'makemake', label: 'Makémaké', r: scaleOrbit(8.6), size: 2, speed: 0.00022, angle: getAngleFromJ2000(daysSince, 112897), color: '#fbb' },
    { name: 'eris', label: 'Éris', r: scaleOrbit(9), size: 2, speed: 0.0002, angle: getAngleFromJ2000(daysSince, 203830), color: '#c6f' }
  ];

  const asteroids = generateAsteroidBelt(scaleOrbit);
  const kuiper = generateKuiperBelt(scaleOrbit);
  const ship = new Ship(CENTER);

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = (e.clientX - rect.left) * (canvas.width / rect.width);
    const clickY = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (ship.onClick(clickX, clickY)) return;

    const HITBOX_PADDING = 18;
    const allBodies = planets.concat(dwarfPlanets);

    const distToSun = Math.sqrt((clickX - CENTER.x) ** 2 + (clickY - CENTER.y) ** 2);
    if (distToSun <= 14) {
      currentPlanet = { name: 'soleil', label: 'Soleil' };
      const data = PLANET_DATA['soleil'];
      loadPlanet3D('soleil', 'surface', data);
      updatePlanetUI(data, 'soleil');
      return;
    }

    if (isInAsteroidHitbox(clickX, clickY, CENTER)) {
      console.log("🪨 Ceinture d'astéroïdes — objets connus : Cérès");
      updatePlanetUI({
        name: 'Ceinture d’astéroïdes',
        description: 'Zone située entre Mars et Jupiter contenant des milliers d’objets. Objet notable : Cérès.'
      }, 'asteroid-belt');
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

  
function isInKuiperHitbox(x, y, CENTER) {
  const dist = Math.sqrt((x - CENTER.x) ** 2 + (y - CENTER.y) ** 2);
  const min = scaleOrbit(8.1);
  const max = scaleOrbit(9.3);
  return dist >= min && dist <= max;
}


  canvas.addEventListener('click', handleClick);

  function drawSystem() {
    ctx.clearRect(0, 0, W, H);
    starfield.update();
    starfield.draw(ctx);

    // Soleil
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = colors.sun;
    ctx.fill();

    // Ceinture d’astéroïdes
    drawAsteroidBelt(ctx, asteroids, CENTER, colors.asteroid);

    // Ceinture de Kuiper
    drawKuiperBelt(ctx, kuiper, CENTER, colors.kuiper);

    // Planètes
    planets.forEach(p => {
      if (p.name === 'planete9') {
        ctx.strokeStyle = 'rgba(255,255,255,0.06)';
        ctx.setLineDash([3, 2]);
      } else {
        ctx.strokeStyle = 'rgba(255,255,255,0.04)';
        ctx.setLineDash([]);
      }
      ctx.beginPath();
      ctx.arc(CENTER.x, CENTER.y, p.r, 0, Math.PI * 2);
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
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(CENTER.x, CENTER.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.stroke();
      ctx.setLineDash([]);

      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();

      p.angle += 0.0003;
    });

    ship.update(planets.concat(dwarfPlanets), CENTER);
    narrate(ship);
    ship.draw(ctx);

    requestAnimationFrame(drawSystem);
  }

  drawSystem();
}
