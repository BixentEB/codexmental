// ========================================================
// canvas.js – Effets visuels pour thèmes stellaire et galactique
// ========================================================

let canvas, ctx, rafId;
let particles = [];

/**
 * Initialise le canvas de fond (responsive)
 */
export function setupCanvas() {
  canvas = document.getElementById("theme-canvas");
  if (!canvas) return;

  ctx = canvas.getContext("2d");
  canvas.style.opacity = '0';

  resizeCanvas(); // Initial sizing
  window.addEventListener('resize', resizeCanvas);
}

/**
 * Ajuste la taille du canvas à la fenêtre
 */
function resizeCanvas() {
  if (!canvas) return;
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

/**
 * Génère les particules (type : "stars" ou "dust")
 * @param {string} type - Type de particule (stars | dust)
 * @param {number} count - Nombre de particules
 */
export function initParticles(type = 'stars', count = 120) {
  if (!canvas) return;

  particles = Array.from({ length: count }, () => {
    const r = (type === 'dust') ? Math.random() * 3 + 1.2 : Math.random() * 1.5 + 0.3;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r,
      alpha: Math.random(),
      delta: (Math.random() * 0.02) * (Math.random() < 0.5 ? 1 : -1),
      type
    };
  });

  animateParticles();
}

/**
 * Boucle d'animation des particules
 */
function animateParticles() {
  if (!ctx || !canvas) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  for (let p of particles) {
    p.alpha += p.delta;
    if (p.alpha <= 0 || p.alpha >= 1) p.delta *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);

    if (p.type === 'dust') {
      const hue = 240 + Math.random() * 40;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(180, 130, 255, ${p.alpha})`;
      ctx.fillStyle = `hsla(${hue}, 100%, 85%, ${p.alpha})`;
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    }

    ctx.fill();
  }

  rafId = requestAnimationFrame(animateParticles);
}

/**
 * Arrête l'animation et efface les particules
 */
export function stopParticles() {
  if (rafId) cancelAnimationFrame(rafId);

  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;
  }

  particles = [];

  if (canvas) canvas.style.opacity = '0';
}
