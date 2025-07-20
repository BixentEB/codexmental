
// radar-mini.js – Radar circulaire décoratif (petit format)
const canvas = document.getElementById('radar-mini');
if (!canvas) return;

const ctx = canvas.getContext('2d');
const W = canvas.width;
const H = canvas.height;
const CENTER = { x: W / 2, y: H / 2 };

let angle = 0;
const blips = [
  { x: 20, y: -30, r: 2 },
  { x: -35, y: 10, r: 2 },
  { x: 15, y: 25, r: 2 }
];

function draw() {
  ctx.clearRect(0, 0, W, H);

  // Cercle de radar
  ctx.beginPath();
  ctx.arc(CENTER.x, CENTER.y, W / 2 - 2, 0, Math.PI * 2);
  ctx.strokeStyle = '#0ff';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Blips
  ctx.fillStyle = '#0ff';
  blips.forEach(b => {
    ctx.beginPath();
    ctx.arc(CENTER.x + b.x, CENTER.y + b.y, b.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Ligne rotative
  ctx.save();
  ctx.translate(CENTER.x, CENTER.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(W / 2 - 4, 0);
  ctx.strokeStyle = 'rgba(0,255,255,0.3)';
  ctx.stroke();
  ctx.restore();

  angle += 0.02;
  requestAnimationFrame(draw);
}

draw();
