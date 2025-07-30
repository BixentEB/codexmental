// kuiper-belt.js — module pour génération, dessin et détection de la ceinture de Kuiper

export function generateKuiperBelt(scaleOrbit) {
  const belt = [];
  for (let i = 0; i < 160; i++) {
    const base = 9.3 + Math.random() * 0.3; // entre 9.3 et 9.6
    const r = scaleOrbit(base);
    const angle = Math.random() * Math.PI * 2;
    belt.push({ r, angle });
  }
  return belt;
}

export function drawKuiperBelt(ctx, belt, center, color = 'rgba(130,130,255,0.4)') {
  belt.forEach(k => {
    const x = center.x + Math.cos(k.angle) * k.r;
    const y = center.y + Math.sin(k.angle) * k.r;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1.2, 1.2);
    k.angle += 0.0001;
  });
}

export function isInKuiperHitbox(x, y, center, scaleOrbit) {
  const dist = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2);
  const min = scaleOrbit(9.3);
  const max = scaleOrbit(9.6);
  return dist >= min && dist <= max;
}
