// ✅ simul-system.js corrigé pour dashboard stellaire
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

  const planets = [
    { name: 'mars', label: 'Mars', r: 130, size: 3, speed: 0.002, angle: getAngleFromJ2000(daysSince, 686.98), color: '#c33', data: { distance: '227.9 Mkm', temp: '-63°C', radius: '3 390 km' } },
    // autres planètes à ajouter ici...
  ];

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

    for (const p of planets) {
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

    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = '#ffaa00';
    ctx.fill();

    for (const p of planets) {
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
    }

    requestAnimationFrame(drawSystem);
  }

  drawSystem();
}
