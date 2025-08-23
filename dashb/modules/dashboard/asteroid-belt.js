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

export function drawAsteroidBelt(ctx, asteroids, CENTER, color = '#888', highlight = false) {
  asteroids.forEach(a => {
    const x = CENTER.x + Math.cos(a.angle) * a.r;
    const y = CENTER.y + Math.sin(a.angle) * a.r;
    ctx.fillStyle = highlight ? 'rgba(255,200,100,0.6)' : color;
    ctx.fillRect(x, y, 1.5, 1.5);
    a.angle += 0.0003;
  });
}

export function isInAsteroidHitbox(x, y, CENTER) {
  const dist = Math.sqrt((x - CENTER.x) ** 2 + (y - CENTER.y) ** 2);
  const r = Math.sqrt(CENTER.x ** 2 + CENTER.y ** 2);
  return dist >= r * 0.36 && dist <= r * 0.42; // adapté à scaleOrbit(3.3)
}
