// simul-system.js — radar planétaire animé robuste (protégé du viewer)
import { loadPlanet3D } from './viewer-planete-3d.js';
import { updatePlanetUI } from './planet-data.js';
import { PLANET_DATA } from './planet-database.js';

const canvas = document.getElementById('simul-system');
if (!canvas) {
  console.warn("⚠️ Aucun canvas #simul-system trouvé.");
} else {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const CENTER = { x: W / 2, y: H / 2 };

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
  const scaleOrbit = (index) => {
    const ratio = Math.pow(index / 9, 1.8);
    return baseOrbit + ratio * (maxRadius - baseOrbit);
  };

  const planets = [
    { name: 'mercure', label: 'Mercure', r: scaleOrbit(0), size: 2, speed: 0.004, angle: angleJ2000(daysSince, 87.97), color: colors.planets[0] },
    { name: 'venus', label: 'Vénus', r: scaleOrbit(1), size: 3, speed: 0.003, angle: angleJ2000(daysSince, 224.7), color: colors.planets[1] },
    { name: 'terre', label: 'Terre', r: scaleOrbit(2), size: 4, speed: 0.0025, angle: angleJ2000(daysSince, 365.25), color: colors.planets[2] },
    { name: 'mars', label: 'Mars', r: scaleOrbit(3), size: 3, speed: 0.002, angle: angleJ2000(daysSince, 686.98), color: colors.planets[3] },
    { name: 'jupiter', label: 'Jupiter', r: scaleOrbit(4), size: 6, speed: 0.0015, angle: angleJ2000(daysSince, 4332.59), color: colors.planets[4] },
    { name: 'saturne', label: 'Saturne', r: scaleOrbit(5), size: 5, speed: 0.0012, angle: angleJ2000(daysSince, 10759.22), color: colors.planets[5] },
    { name: 'uranus', label: 'Uranus', r: scaleOrbit(6), size: 4, speed: 0.001, angle: angleJ2000(daysSince, 30688.5), color: colors.planets[6] },
    { name: 'neptune', label: 'Neptune', r: scaleOrbit(7), size: 4, speed: 0.0008, angle: angleJ2000(daysSince, 60182), color: colors.planets[7] }
  ];

  const ship = { orbit: scaleOrbit(6.7), angle: 0, size: 3 };
  const asteroids = Array.from({ length: 150 }, () => ({
    r: scaleOrbit(3.3) + Math.random() * 20,
    angle: Math.random() * 2 * Math.PI
  }));

  canvas.addEventListener('click', e => {
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (canvas.width / rect.width);
    const y = (e.clientY - rect.top) * (canvas.height / rect.height);
    const hitPadding = 12;

    for (const p of planets) {
      const px = CENTER.x + Math.cos(p.angle) * p.r;
      const py = CENTER.y + Math.sin(p.angle) * p.r;
      const dist = Math.hypot(x - px, y - py);
      if (dist <= p.size + hitPadding) {
        const data = PLANET_DATA[p.name] || {};
        loadPlanet3D(p.name, 'surface', data);
        updatePlanetUI(data, p.name);
        break;
      }
    }
  });

  function angleJ2000(days, period) {
    return ((days % period) / period) * 2 * Math.PI;
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 7, 0, 2 * Math.PI);
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
      ctx.arc(CENTER.x, CENTER.y, p.r, 0, 2 * Math.PI);
      ctx.strokeStyle = 'rgba(255,255,255,0.04)';
      ctx.stroke();

      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, 2 * Math.PI);
      ctx.fillStyle = p.color;
      ctx.fill();

      p.angle += p.speed;
    });

    const sx = CENTER.x + Math.cos(ship.angle) * ship.orbit;
    const sy = CENTER.y + Math.sin(ship.angle) * ship.orbit;
    ctx.beginPath();
    ctx.arc(sx, sy, ship.size, 0, 2 * Math.PI);
    ctx.fillStyle = colors.ship;
    ctx.fill();
    ship.angle += 0.0007;

    requestAnimationFrame(draw);
  }

  draw();
}
