// kuiper-belt.js — module pour génération et dessin de la ceinture de Kuiper

export function generateKuiperBelt(scaleOrbit) {
  const belt = [];
  for (let i = 0; i < 140; i++) {
    const base = 9 + Math.random() * 0.2; // orbite entre Neptune (8) et planete9 (~9.2)
    const r = scaleOrbit(base);
    const angle = Math.random() * Math.PI * 2;
    belt.push({ r, angle });
  }
  return belt;
}

export function drawKuiperBelt(ctx, belt, center, color = 'rgba(100,100,255,0.25)') {
  belt.forEach(k => {
    const x = center.x + Math.cos(k.angle) * k.r;
    const y = center.y + Math.sin(k.angle) * k.r;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, 1.2, 1.2);
    k.angle += 0.0001;
  });
}
