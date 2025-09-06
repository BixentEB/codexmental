let rafId, canvas, ctx, stars = [];

function resize() {
  if (!canvas) return;
  canvas.width  = innerWidth;
  canvas.height = innerHeight;
}

export function initSky() {
  canvas = document.getElementById('theme-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  resize();
  addEventListener('resize', resize);

  const count = Math.max(36, Math.floor((innerWidth*innerHeight)/60000));
  stars = Array.from({length: count}, () => ({
    x: Math.random()*canvas.width,
    y: Math.random()*canvas.height,
    r: Math.random()*1.6+0.6,
    v: Math.random()*1.6+0.5,
    a: Math.random()
  }));

  (function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.fillStyle = 'rgba(135,206,250,0.08)'; // bleu ciel léger
    ctx.fillRect(0,0,canvas.width,canvas.height);

    for (const s of stars) {
      s.a += (Math.random()-0.5)*0.01;
      if (s.a<0.3) s.a=0.3; if (s.a>1) s.a=1;
      ctx.beginPath(); ctx.arc(s.x,s.y,s.r,0,Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${s.a})`;
      ctx.shadowBlur = 6;
      ctx.shadowColor = `rgba(200,220,255,${s.a})`;
      ctx.fill();
      s.y += s.v; if (s.y>canvas.height+6){ s.y=-6; s.x=Math.random()*canvas.width; }
    }
    rafId = requestAnimationFrame(loop);
  })();
}

export function stopSky(){
  if (rafId) cancelAnimationFrame(rafId);
  rafId=null; stars=[];
  if (ctx&&canvas){ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.shadowBlur=0; }
}
