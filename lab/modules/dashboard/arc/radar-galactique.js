
// radar-galactique.js
const canvas = document.getElementById('radar-galactique');
if (canvas) {
  const ctx = canvas.getContext('2d');
  const w = canvas.width;
  const h = canvas.height;
  let angle = 0;

  function drawRadar() {
    ctx.clearRect(0, 0, w, h);

    // Fond circulaire
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w / 2 - 5, 0, Math.PI * 2);
    ctx.strokeStyle = '#0ff4';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Cercles concentriques
    for (let r = 1; r < 4; r++) {
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, (w / 2 - 10) * (r / 3), 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(0,255,255,0.1)';
      ctx.stroke();
    }

    // Ligne rotative
    ctx.save();
    ctx.translate(w / 2, h / 2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(w / 2 - 8, 0);
    ctx.strokeStyle = 'rgba(0,255,255,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    angle += 0.01;
    requestAnimationFrame(drawRadar);
  }

  drawRadar();
}
