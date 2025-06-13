
// ========================================================
// etoile-filante.js – Étoile filante pour thème stellaire
// ========================================================
let etoile = null;
let ctx, canvas;

/**
 * Initialise l'étoile filante si canvas déjà présent
 */
export function initEtoileFilante() {
  canvas = document.getElementById("theme-canvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");

  setTimeout(spawnEtoile, getRandomDelay());
}

/**
 * Crée une étoile filante
 */
function spawnEtoile() {
  etoile = {
    x: Math.random() * canvas.width * 0.5,
    y: -50,
    vx: 4 + Math.random() * 2,
    vy: 4 + Math.random() * 2,
    length: 80,
    alpha: 1
  };

  animateEtoile();
}

/**
 * Boucle d'animation pour l'étoile filante
 */
function animateEtoile() {
  if (!etoile || !ctx || !canvas) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(etoile.x, etoile.y);
  ctx.lineTo(etoile.x - etoile.length, etoile.y - etoile.length);
  ctx.strokeStyle = `rgba(255, 255, 255, ${etoile.alpha})`;
  ctx.lineWidth = 2;
  ctx.shadowBlur = 10;
  ctx.shadowColor = "white";
  ctx.stroke();
  ctx.restore();

  etoile.x += etoile.vx;
  etoile.y += etoile.vy;
  etoile.alpha -= 0.01;

  if (etoile.alpha <= 0 || etoile.x > canvas.width || etoile.y > canvas.height) {
    etoile = null;
    setTimeout(spawnEtoile, getRandomDelay());
  } else {
    requestAnimationFrame(animateEtoile);
  }
}

/**
 * Génère un délai aléatoire entre les étoiles filantes
 */
function getRandomDelay() {
  return 20000 + Math.random() * 30000; // entre 20s et 50s
}
