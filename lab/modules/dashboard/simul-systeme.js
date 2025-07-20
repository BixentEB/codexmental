
// simul-systeme.js – Simulation simplifiée du système solaire (vue radar)
const canvas = document.getElementById('radar-galactique');
if (!canvas) return;

const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const CENTER = { x: W / 2, y: H / 2 };

let angle = 0;
const planets = [
  { name: 'Mercure', r: 20, size: 2, speed: 0.04 },
  { name: 'Vénus',   r: 35, size: 3, speed: 0.03 },
  { name: 'Terre',   r: 50, size: 4, speed: 0.025 },
  { name: 'Mars',    r: 70, size: 3, speed: 0.02 },
  { name: 'Jupiter', r: 95, size: 6, speed: 0.015 },
  { name: 'Saturne', r: 120, size: 5, speed: 0.012 },
  { name: 'Uranus',  r: 145, size: 4, speed: 0.01 },
  { name: 'Neptune', r: 170, size: 4, speed: 0.008 }
];

const userShip = {
  orbit: 50,
  angle: 0,
  size: 2.5,
  color: '#f0f'
};

function drawSystem() {
  ctx.clearRect(0, 0, W, H);

  // Soleil
  ctx.beginPath();
  ctx.arc(CENTER.x, CENTER.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#ffaa00';
  ctx.fill();

  // Orbites + planètes
  planets.forEach(p => {
    // orbite
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, p.r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0,255,255,0.05)';
    ctx.stroke();

    // planète
    const x = CENTER.x + Math.cos(p.angle || 0) * p.r;
    const y = CENTER.y + Math.sin(p.angle || 0) * p.r;
    ctx.beginPath();
    ctx.arc(x, y, p.size, 0, Math.PI * 2);
    ctx.fillStyle = '#0ff';
    ctx.fill();

    p.angle = (p.angle || 0) + p.speed;
  });

  // Position du vaisseau
  const sx = CENTER.x + Math.cos(userShip.angle) * userShip.orbit;
  const sy = CENTER.y + Math.sin(userShip.angle) * userShip.orbit;
  ctx.beginPath();
  ctx.arc(sx, sy, userShip.size, 0, Math.PI * 2);
  ctx.fillStyle = userShip.color;
  ctx.fill();

  userShip.angle += 0.018;

  requestAnimationFrame(drawSystem);
}

drawSystem();
