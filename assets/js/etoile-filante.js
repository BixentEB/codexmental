// ========================================================
// etoile-filante.js – Étoiles filantes superposables au fond stellaire
// (ne clear pas le canvas ; compatible avec canvas.js)
// ========================================================
let ctx, canvas, rafId = null;
let schedulerId = null;
const meteors = [];

/** Réglages par défaut (overridables via initEtoileFilante(opts)) */
let CFG = {
  minDelay: 5000,      // 5s
  maxDelay: 12000,     // 12s
  maxConcurrent: 3,    // nb max simultané
  burstChance: 0.18,   // chance de lancer un mini-essaim (2-3)
  speedMin: 10,        // px/frame
  speedMax: 22,
  lengthMin: 90,       // px
  lengthMax: 180,
  thicknessMin: 1.5,   // px
  thicknessMax: 2.8,
  fadePerFrame: 0.018, // alpha decay par frame
  glow: 16,            // shadowBlur
  hueBase: 210,        // teinte froide (bleu-cyan)
  hueJitter: 28        // +/- variation
};

/** Utilitaires */
const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

/** Crée une étoile filante */
function createMeteor() {
  if (!canvas) return;

  // Point d’apparition (bande haute/gauche pour une diagonale descendante naturelle)
  // 60% depuis le bord gauche, 40% haut
  const startX = Math.random() < 0.6 ? rand(-80, canvas.width * 0.25) : rand(-80, canvas.width * 0.15);
  const startY = rand(-60, canvas.height * 0.4);

  // Angle doux entre 20° et 40° (en rad) avec petite variation
  const angle = rand(0.35, 0.75); // ~20°–43°
  const speed = rand(CFG.speedMin, CFG.speedMax);

  const length = rand(CFG.lengthMin, CFG.lengthMax);
  const thickness = rand(CFG.thicknessMin, CFG.thicknessMax);

  const hue = CFG.hueBase + rand(-CFG.hueJitter, CFG.hueJitter);
  const sat = 100;
  const light = 85;

  return {
    x: startX,
    y: startY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length,
    thickness,
    alpha: 1,
    hue, sat, light
  };
}

/** Dessine une étoile filante (serpentin lumineux) sans clear global */
function drawMeteor(m) {
  if (!ctx) return;

  // Segment de tête
  const tailX = m.x - Math.cos(Math.atan2(m.vy, m.vx)) * m.length;
  const tailY = m.y - Math.sin(Math.atan2(m.vy, m.vx)) * m.length;

  ctx.save();
  // On isole l’état pour ne rien contaminer
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = CFG.glow;
  ctx.shadowColor = `hsla(${m.hue}, ${m.sat}%, ${m.light}%, ${m.alpha * 0.8})`;

  // Traînée en dégradé
  const grad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
  grad.addColorStop(0.0, `hsla(${m.hue}, ${m.sat}%, ${m.light}%, ${m.alpha})`);           // tête lumineuse
  grad.addColorStop(0.5, `hsla(${m.hue}, ${m.sat}%, ${m.light - 10}%, ${m.alpha * 0.5})`);
  grad.addColorStop(1.0, `hsla(${m.hue}, ${m.sat}%, ${m.light - 20}%, 0)`);               // fin évanescente

  ctx.strokeStyle = grad;
  ctx.lineWidth = m.thickness;

  ctx.beginPath();
  ctx.moveTo(m.x, m.y);
  ctx.lineTo(tailX, tailY);
  ctx.stroke();

  // Petite pointe brillante en tête
  ctx.beginPath();
  ctx.fillStyle = `hsla(${m.hue}, ${m.sat}%, 100%, ${m.alpha})`;
  ctx.arc(m.x, m.y, m.thickness * 0.9, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Mise à jour d’un météore */
function stepMeteor(m) {
  m.x += m.vx;
  m.y += m.vy;
  m.alpha = clamp(m.alpha - CFG.fadePerFrame, 0, 1);
  // Sortie de l’écran ou invisible → retire
  const offscreen = (m.x < -100 || m.y < -100 || m.x > (canvas.width + 100) || m.y > (canvas.height + 100));
  return !(offscreen || m.alpha <= 0);
}

/** Boucle d’animation (ne clear pas : on laisse le fond/étoiles de canvas.js vivre) */
function loop() {
  // Dessin + update de chaque météore
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    drawMeteor(m);
    const alive = stepMeteor(m);
    if (!alive) meteors.splice(i, 1);
  }
  rafId = requestAnimationFrame(loop);
}

/** Planifie la prochaine apparition (avec éventuels bursts) */
function scheduleNext() {
  const delay = rand(CFG.minDelay, CFG.maxDelay);
  schedulerId = setTimeout(() => {
    // Burst ?
    if (Math.random() < CFG.burstChance) {
      const n = randInt(2, 3);
      for (let i = 0; i < n; i++) {
        if (meteors.length < CFG.maxConcurrent) {
          const m = createMeteor();
          if (m) meteors.push(m);
        }
      }
    } else {
      if (meteors.length < CFG.maxConcurrent) {
        const m = createMeteor();
        if (m) meteors.push(m);
      }
    }
    // Replanifie
    scheduleNext();
  }, delay);
}

/** Public: démarrage – peut recevoir des options pour régler la densité */
export function initEtoileFilante(options = {}) {
  canvas = document.getElementById('theme-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  // merge options
  CFG = { ...CFG, ...options };

  // évite doublons
  stopEtoiles(true);

  // lance anim
  rafId = requestAnimationFrame(loop);
  scheduleNext();

  // gestion visibilité (pause/reprise)
  document.addEventListener('visibilitychange', handleVisibility, { passive: true });
}

/** Public: stop (avec option keepListeners pour réinit sans cumuler) */
export function stopEtoiles(keepListeners = false) {
  if (rafId) cancelAnimationFrame(rafId);
  if (schedulerId) clearTimeout(schedulerId);
  rafId = null;
  schedulerId = null;
  meteors.length = 0;
  if (!keepListeners) {
    document.removeEventListener('visibilitychange', handleVisibility);
  }
}

function handleVisibility() {
  if (document.hidden) {
    if (rafId) cancelAnimationFrame(rafId);
    if (schedulerId) clearTimeout(schedulerId);
    rafId = null; schedulerId = null;
  } else {
    if (!rafId) rafId = requestAnimationFrame(loop);
    if (!schedulerId) scheduleNext();
  }
}

// Optionnel: démarrage auto si le canvas existe déjà (facultatif, décommente si tu veux)
// window.addEventListener('DOMContentLoaded', () => {
//   const c = document.getElementById('theme-canvas');
//   if (c) initEtoileFilante();
// });
