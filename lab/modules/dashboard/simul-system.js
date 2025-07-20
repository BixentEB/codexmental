// simul-system.js – Système solaire animé (canvas)

const canvas = document.getElementById('simul-system');

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
    ship: '#f0f'
  };

  // Calcul de l’angle initial en fonction de la date (référence J2000)
  function getAngleFromJ2000(days, period) {
    const fraction = (days % period) / period;
    return fraction * 2 * Math.PI;
  }

  const referenceDate = new Date(Date.UTC(2000, 0, 1, 12, 0, 0));
  const now = new Date();
  const daysSince = (now - referenceDate) / (1000 * 60 * 60 * 24);

  const planets = [
    { name: 'Mercure', r: 25, size: 2, speed: 0.04, angle: getAngleFromJ2000(daysSince, 87.97) },
    { name: 'Vénus',   r: 40, size: 3, speed: 0.03, angle: getAngleFromJ2000(daysSince, 224.70) },
    { name: 'Terre',   r: 60, size: 4, speed: 0.025, angle: getAngleFromJ2000(daysSince, 365.25) },
    { name: 'Mars',    r: 80, size: 3, speed: 0.02, angle: getAngleFromJ2000(daysSince, 686.98) },
    { name: 'Jupiter', r: 105, size: 6, speed: 0.015, angle: getAngleFromJ2000(daysSince, 4332.59) },
    { name: 'Saturne', r: 130, size: 5, speed: 0.012, angle: getAngleFromJ2000(daysSince, 10759.22) },
    { name: 'Uranus',  r: 155, size: 4, speed: 0.01, angle: getAngleFromJ2000(daysSince, 30688.5) },
    { name: 'Neptune', r: 180, size: 4, speed: 0.008, angle: getAngleFromJ2000(daysSince, 60182) }
  ];

  const ship = { orbit: 60, angle: 0, size: 3 };

  function drawSystem() {
    ctx.clearRect(0, 0, W, H);

    // Soleil
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = colors.sun;
    ctx.fill();

    // Orbites et planètes
    planets.forEach((p, i) => {
      // Orbite
      ctx.beginPath();
      ctx.arc(CENTER.x, CENTER.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.stroke();

      // Planète
      const x = CENTER.x + Math.cos(p.angle) * p.r;
      const y = CENTER.y + Math.sin(p.angle) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = colors.planets[i % colors.planets.length];
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

    ship.angle += 0.015;

    requestAnimationFrame(drawSystem);
  }

  drawSystem();
}
