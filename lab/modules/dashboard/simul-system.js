// simul-system.js – Système solaire animé avec interaction clic

const canvas = document.getElementById('simul-system');
const viewerCanvas = document.getElementById('planet-viewer-canvas');
const infoBox = document.getElementById('planet-info-content');

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

  const planets = [
    { name: 'Mercure', r: 203, size: 2, speed: 0.004, angle: getAngleFromJ2000(daysSince, 87.97), color: colors.planets[0], data: { distance: "57.9 Mkm", temp: "167°C", radius: "2 440 km" } },
    { name: 'Vénus',   r: 234, size: 3, speed: 0.003, angle: getAngleFromJ2000(daysSince, 224.70), color: colors.planets[1], data: { distance: "108.2 Mkm", temp: "464°C", radius: "6 052 km" } },
    { name: 'Terre',   r: 251, size: 4, speed: 0.0025, angle: getAngleFromJ2000(daysSince, 365.25), color: colors.planets[2], data: { distance: "149.6 Mkm", temp: "15°C", radius: "6 371 km" } },
    { name: 'Mars',    r: 271, size: 3, speed: 0.002, angle: getAngleFromJ2000(daysSince, 686.98), color: colors.planets[3], data: { distance: "227.9 Mkm", temp: "-63°C", radius: "3 390 km" } },
    { name: 'Jupiter', r: 333, size: 6, speed: 0.0015, angle: getAngleFromJ2000(daysSince, 4332.59), color: colors.planets[4], data: { distance: "778.3 Mkm", temp: "-108°C", radius: "69 911 km" } },
    { name: 'Saturne', r: 363, size: 5, speed: 0.0012, angle: getAngleFromJ2000(daysSince, 10759.22), color: colors.planets[5], data: { distance: "1 429 Mkm", temp: "-139°C", radius: "58 232 km" } },
    { name: 'Uranus',  r: 398, size: 4, speed: 0.001, angle: getAngleFromJ2000(daysSince, 30688.5), color: colors.planets[6], data: { distance: "2 871 Mkm", temp: "-197°C", radius: "25 362 km" } },
    { name: 'Neptune', r: 421, size: 4, speed: 0.0008, angle: getAngleFromJ2000(daysSince, 60182), color: colors.planets[7], data: { distance: "4 498 Mkm", temp: "-201°C", radius: "24 622 km" } }
  ];

  const CENTER_PLANET = { x: 100, y: 100 };

  function drawPlanetInViewer(planet) {
    if (!viewerCanvas) return;
    const vctx = viewerCanvas.getContext('2d');
    vctx.clearRect(0, 0, 200, 200);
    vctx.beginPath();
    vctx.arc(CENTER_PLANET.x, CENTER_PLANET.y, 40, 0, Math.PI * 2);
    vctx.fillStyle = planet.color;
    vctx.fill();
  }

  function updatePlanetInfo(planet) {
    if (!infoBox) return;
    infoBox.innerHTML = `
      <p>Nom : ${planet.name}</p>
      <p>Distance : ${planet.data.distance}</p>
      <p>Taille : ${planet.data.radius}</p>
      <p>Température : ${planet.data.temp}</p>
    `;
  }

  function handleClick(e) {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (const p of planets) {
      const px = CENTER.x + Math.cos(p.angle) * p.r;
      const py = CENTER.y + Math.sin(p.angle) * p.r;
      const dist = Math.sqrt((clickX - px) ** 2 + (clickY - py) ** 2);
      if (dist <= p.size + 3) {
        drawPlanetInViewer(p);
        updatePlanetInfo(p);
        break;
      }
    }
  }

  canvas.addEventListener('click', handleClick);

  // Ceinture d'astéroïdes
  const asteroids = [];
  for (let i = 0; i < 150; i++) {
    const r = 280 + Math.random() * 30;
    const angle = Math.random() * Math.PI * 2;
    asteroids.push({ r, angle });
  }

  const ship = { orbit: 380, angle: 0, size: 3 };

  function getAngleFromJ2000(days, period) {
    const fraction = (days % period) / period;
    return fraction * 2 * Math.PI;
  }

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

    // Vaisseau
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
