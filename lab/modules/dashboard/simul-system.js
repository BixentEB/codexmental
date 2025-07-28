// simul-system.js — radar planétaire avec ceintures interactives et modules séparés
import { loadPlanet3D } from './viewer-planete-3d.js';
import { updatePlanetUI } from './planet-data.js';
import { PLANET_DATA } from './planet-database.js';
import { Ship } from './ship-module.js';
import { narrate } from './ship-module-narratif.js';
import { Starfield } from './ship-stars.js';
import { generateKuiperBelt, drawKuiperBelt, isInKuiperHitbox } from './kuiper-belt.js';
import { generateAsteroidBelt, drawAsteroidBelt, isInAsteroidHitbox } from './asteroid-belt.js';

const canvas = document.getElementById('simul-system');
let currentPlanet = null;
let lastMouseX = 0, lastMouseY = 0;

if (!canvas) {
  console.warn("⚠️ Aucun canvas #simul-system trouvé.");
} else {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const starfield = new Starfield(W, H);
  const CENTER = { x: W / 2, y: H / 2 };

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    lastMouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    lastMouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  const scaleOrbit = (index) => {
    const ratio = Math.pow(index / 9, 1.8);
    return 70 + ratio * ((H / 2 - 20) - 70);
  };

  const asteroids = generateAsteroidBelt(scaleOrbit) || [];
  const kuiper = generateKuiperBelt(scaleOrbit) || [];

  const planets = [
    { name: 'mercure', r: scaleOrbit(1), size: 3, angle: 0, speed: 0.015 },
    { name: 'venus', r: scaleOrbit(2), size: 4, angle: 0, speed: 0.012 },
    { name: 'terre', r: scaleOrbit(3), size: 4.5, angle: 0, speed: 0.01 },
    { name: 'mars', r: scaleOrbit(4), size: 3.5, angle: 0, speed: 0.008 },
    { name: 'jupiter', r: scaleOrbit(5), size: 6, angle: 0, speed: 0.006 },
    { name: 'saturne', r: scaleOrbit(6), size: 5.5, angle: 0, speed: 0.005 },
    { name: 'uranus', r: scaleOrbit(7), size: 5, angle: 0, speed: 0.004 },
    { name: 'neptune', r: scaleOrbit(8), size: 5, angle: 0, speed: 0.0035 },
  ];

  const dwarfPlanets = [
    { name: 'ceres', r: scaleOrbit(4.2), size: 2.2, angle: 0, speed: 0.0075 },
    { name: 'pluton', r: scaleOrbit(9), size: 2.5, angle: 0, speed: 0.0025 },
    { name: 'haumea', r: scaleOrbit(9.2), size: 2.2, angle: 1, speed: 0.0023 },
    { name: 'makemake', r: scaleOrbit(9.4), size: 2.1, angle: 2, speed: 0.0021 },
    { name: 'eris', r: scaleOrbit(9.6), size: 2.4, angle: 3, speed: 0.0019 },
    { name: 'planete9', r: scaleOrbit(9.9), size: 3, angle: 0, speed: 0.0015 }
  ];

  const ship = new Ship(CENTER);

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (ship.onClick(x, y)) return;

    if (isInAsteroidHitbox(x, y, CENTER)) {
      currentPlanet = { name: 'asteroid-belt', label: "Ceinture d'astéroïdes" };
      const data = PLANET_DATA['asteroid-belt'] || {};
      loadPlanet3D('asteroid-belt', 'surface', data);
      updatePlanetUI(data, 'asteroid-belt');
      return;
    }

    if (isInKuiperHitbox(x, y, CENTER)) {
      currentPlanet = { name: 'kuiper-zone', label: "Ceinture de Kuiper" };
      const data = PLANET_DATA['kuiper-zone'] || {};
      loadPlanet3D('kuiper-zone', 'surface', data);
      updatePlanetUI(data, 'kuiper-zone');
      return;
    }

    const HITBOX_PADDING = 18;
    const distToSun = Math.sqrt((x - CENTER.x) ** 2 + (y - CENTER.y) ** 2);
    if (distToSun <= 14) {
      currentPlanet = { name: 'soleil', label: 'Soleil' };
      const data = PLANET_DATA['soleil'];
      loadPlanet3D('soleil', 'surface', data);
      updatePlanetUI(data, 'soleil');
      return;
    }

    const allBodies = planets.concat(dwarfPlanets);
    for (const p of allBodies) {
      const px = CENTER.x + Math.cos(p.angle) * p.r;
      const py = CENTER.y + Math.sin(p.angle) * p.r;
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
      if (dist <= p.size + HITBOX_PADDING) {
        currentPlanet = p;
        const data = PLANET_DATA[p.name] || {};
        loadPlanet3D(p.name, 'surface', data);
        updatePlanetUI(data, p.name);
        return;
      }
    }
  }

  canvas.addEventListener('click', handleClick);

  function drawSystem() {
    ctx.clearRect(0, 0, W, H);
    starfield.update();
    starfield.draw(ctx);

    drawAsteroidBelt(ctx, asteroids, CENTER, '#888', isInAsteroidHitbox(lastMouseX, lastMouseY, CENTER));
    drawKuiperBelt(ctx, kuiper, CENTER);

    planets.forEach(p => {
      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = '#ccc';
      ctx.fill();
      p.angle += p.speed;
    });

    dwarfPlanets.forEach(p => {
      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.setLineDash([2, 2]);
      ctx.arc(CENTER.x, CENTER.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = '#666';
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = '#aaa';
      ctx.fill();
      p.angle += p.speed;
    });

    ship.update(planets, dwarfPlanets);
    ship.draw(ctx);

    requestAnimationFrame(drawSystem);
  }

  drawSystem();
}
