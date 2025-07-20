// simul-systeme.js – Base du système solaire évolutif

const canvas = document.getElementById('radar-galactique');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const W = canvas.width;
  const H = canvas.height;
  const CENTER = { x: W / 2, y: H / 2 };

  const colors = {
    sun: '#ffaa00',
    planets: ['#aaa', '#f3a', '#0cf', '#c33', '#ffcc88', '#ccaa66', '#88f', '#44d'],
    ship: '#f0f'
  };

  const planets = [
    { name: 'Mercure', r: 25, size: 2, speed: 0.04 },
    { name: 'Vénus',   r: 40, size: 3, speed: 0.03 },
    { name: 'Terre',   r: 60, size: 4, speed: 0.025 },
    { name: 'Mars',    r: 80, size: 3, speed: 0.02 },
    { name: 'Jupiter', r: 105, size: 6, speed: 0.015 },
    { name: 'Saturne', r: 130, size: 5, speed: 0.012 },
    { name: 'Uranus',  r: 155, size: 4, speed: 0.01 },
    { name: 'Neptune', r: 180, size: 4, speed: 0.008 }
  ];

  const ship = { orbit: 60, angle: 0, size: 3 };

  function drawSystem() {
    ctx.clearRect(0, 0, W, H);

    // Soleil
    ctx.beginPath();
    ctx.arc(CENTER.x, CENTER.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = colors.sun;
    ctx.fill();

    planets.forEach((p, i) => {
      ctx.beginPath();
      ctx.arc(CENTER.x, CENTER.y, p.r, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255,255,255,0.05)';
      ctx.stroke();

      const x = CENTER.x + Math.cos(p.angle || 0) * p.r;
      const y = CENTER.y + Math.sin(p.angle || 0) * p.r;
      ctx.beginPath();
      ctx.arc(x, y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = colors.planets[i % colors.planets.length];
      ctx.fill();

      p.angle = (p.angle || 0) + p.speed;
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
