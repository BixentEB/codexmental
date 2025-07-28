// asteroid-belt.js — génération et dessin de la ceinture d'astéroïdes

export function generateAsteroidBelt(scaleOrbit) {
  const asteroids = [];
  for (let i = 0; i < 150; i++) {
    const r = scaleOrbit(3.3) + Math.random() * 20;
    const angle = Math.random() * Math.PI * 2;
    asteroids.push({ r, angle });
  }
  return asteroids;
}

export function drawAsteroidBelt(ctx, asteroids, CENTER, color = '#888') {
  asteroids.forEach(a => {
    const x = CENTER.x + Math.cos(a.angle) * a.r;
    const y = CENTER.y + Math.sin(a.angle) * a.r;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1.5, 1.5);
    a.angle += 0.0003;
  });
}

export function isInAsteroidHitbox(x, y, CENTER) {
  const dist = Math.sqrt((x - CENTER.x) ** 2 + (y - CENTER.y) ** 2);
  const beltRadius = 3.3;
  return dist >= CENTER.r + 90 && dist <= CENTER.r + 120; // ajustable
}
