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

  const asteroids = generateAsteroidBelt(scaleOrbit);
  const kuiper = generateKuiperBelt(scaleOrbit);

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

    requestAnimationFrame(drawSystem);
  }

  drawSystem();
}
