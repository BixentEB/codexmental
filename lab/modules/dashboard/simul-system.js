// simul-system.js — radar planétaire version stable (planètes + naines + vaisseau)
import { loadPlanet3D } from './viewer-planete-3d.js';
import { updatePlanetUI } from './planet-data.js';
import { PLANET_DATA } from './planet-database.js';
import { Ship } from './ship-module.js';
import { narrate } from './ship-module-narratif.js';
import { Starfield } from './ship-stars.js';

const canvas = document.getElementById('simul-system');
let currentPlanet = null;
let lastMouseX = 0, lastMouseY = 0;

if (!canvas) {
  console.warn("⚠️ Aucun canvas #simul-system trouvé.");
} else {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const CENTER = { x: W / 2, y: H / 2 };
  const starfield = new Starfield(W, H);
  const ship = new Ship(CENTER);

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    lastMouseX = (e.clientX - rect.left) * (canvas.width / rect.width);
    lastMouseY = (e.clientY - rect.top) * (canvas.height / rect.height);
  });

  const scaleOrbit = index => {
    const ratio = Math.pow(index / 9, 1.8);
    return 70 + ratio * ((H / 2 - 20) - 70);
  };

  const planets = [
    { name: 'mercure', label: 'Mercure', r: scaleOrbit(1), size: 3, speed: 0.015, angle: 0, color: '#aaa' },
    { name: 'venus', label: 'Vénus', r: scaleOrbit(2), size: 4, speed: 0.012, angle: 0, color: '#f8c' },
    { name: 'terre', label: 'Terre', r: scaleOrbit(3), size: 4.5, speed: 0.01, angle: 0, color: '#6cf' },
    { name: 'mars', label: 'Mars', r: scaleOrbit(4), size: 3.5, speed: 0.008, angle: 0, color: '#f66' },
    { name: 'jupiter', label: 'Jupiter', r: scaleOrbit(5), size: 6, speed: 0.006, angle: 0, color: '#fcd' },
    { name: 'saturne', label: 'Saturne', r: scaleOrbit(6), size: 5.5, speed: 0.005, angle: 0, color: '#fdc' },
    { name: 'uranus', label: 'Uranus', r: scaleOrbit(7), size: 5, speed: 0.004, angle: 0, color: '#acf' },
    { name: 'neptune', label: 'Neptune', r: scaleOrbit(8), size: 5, speed: 0.0035, angle: 0, color: '#88f' }
  ];

  const dwarfPlanets = [
    { name: 'ceres', label: 'Cérès', r: scaleOrbit(4.2), size: 2.2, speed: 0.0075, angle: 0, color: '#ccc' },
    { name: 'pluton', label: 'Pluton', r: scaleOrbit(9), size: 2.5, speed: 0.0025, angle: 0, color: '#f9f' },
    { name: 'haumea', label: 'Hauméa', r: scaleOrbit(9.2), size: 2.2, speed: 0.0023, angle: 0, color: '#aff' },
    { name: 'makemake', label: 'Makémaké', r: scaleOrbit(9.4), size: 2.1, speed: 0.0021, angle: 0, color: '#fbb' },
    { name: 'eris', label: 'Éris', r: scaleOrbit(9.6), size: 2.4, speed: 0.0019, angle: 0, color: '#c6f' },
    { name: 'planete9', label: 'Planète Neuf', r: scaleOrbit(9.9), size: 3, speed: 0.0015, angle: 0, color: '#8888ff' }
  ];

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);

    if (ship.onClick(x, y)) return;

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
      if (dist <= p.size + 14) {
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

    ctx.fillStyle = 'yellow';
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 6, 0, Math.PI * 2);
    ctx.fill();

    planets.forEach(p => {
      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(CENTER.x, CENTER.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = '#333';
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.angle += p.speed;
    });

    dwarfPlanets.forEach(p => {
      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.arc(CENTER.x, CENTER.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = '#555';
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.fill();
      p.angle += p.speed;
    });

    ship.update(planets, dwarfPlanets);
    ship.draw(ctx);

    requestAnimationFrame(drawSystem);
  }

  drawSystem();
}
