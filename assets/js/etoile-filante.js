// ========================================================
// etoile-filante.js – v2 (variantes réalistes + nuances)
// ========================================================
let ctx, canvas, rafId = null;
let schedulerId = null;
const meteors = [];
const sparks = [];

/** Réglages par défaut (modifie ici si tu veux) */
let CFG = {
  minDelay: 4500,
  maxDelay: 10000,
  maxConcurrent: 3,
  burstChance: 0.22,         // 2–3 en même temps, parfois
  speedMin: 10,
  speedMax: 24,
  lengthMin: 90,
  lengthMax: 210,
  thicknessMin: 1.2,
  thicknessMax: 3.2,
  fadePerFrame: 0.017,       // Alpha decay (certains types l’overrident)
  glow: 16,
  hueBase: 210,
  hueJitter: 28,
  // Nuances de mouvement
  angleNoise: 0.004,         // petite dérive courbe
  flickerAmp: 0.08,          // micro scintillement tête
  // Radiant (désactive en mettant enableRadiant: false)
  enableRadiant: true,
  radiant: null,             // {x,y} auto-placé si null
};

/** Types de météores (poids ≈ probabilité) */
const TYPES = [
  // rapide, bleuté, trait net – les “darts”
  { id: 'fast-white', weight: 3, hue: 210, sat: 90, light: 92, speedMul: 1.25, lenMul: 0.9, fadeMul: 1.1, thicknessMul: 0.9, train: 0.6, flare: 0.25, frag: 0.06 },
  // vert ionisé (magnésium)
  { id: 'green-ion', weight: 2, hue: 130, sat: 95, light: 85, speedMul: 1.0,  lenMul: 1.0, fadeMul: 1.0, thicknessMul: 1.0, train: 0.7, flare: 0.35, frag: 0.08 },
  // ambre/orange (sodium) – plus “braise”
  { id: 'slow-amber', weight: 2, hue: 36,  sat: 100, light: 82, speedMul: 0.8, lenMul: 1.15, fadeMul: 0.85, thicknessMul: 1.2, train: 0.9, flare: 0.18, frag: 0.05 },
  // longue traîne persistante (faible fade)
  { id: 'persistent-train', weight: 1, hue: 200, sat: 90, light: 88, speedMul: 0.95, lenMul: 1.35, fadeMul: 0.7, thicknessMul: 1.1, train: 1.0, flare: 0.3, frag: 0.1 },
];

const rand = (a, b) => a + Math.random() * (b - a);
const randInt = (a, b) => Math.floor(rand(a, b + 1));
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

function pickType() {
  const total = TYPES.reduce((s, t) => s + t.weight, 0);
  let r = Math.random() * total;
  for (const t of TYPES) {
    if ((r -= t.weight) <= 0) return t;
  }
  return TYPES[0];
}

/** Position de départ + direction
 *  Si radiant activé: on tire une direction qui part du radiant vers l’écran */
function spawnParams() {
  const w = canvas.width, h = canvas.height;

  // Radiant auto si non défini: haut-gauche à ~(-10%, 20%)
  if (CFG.enableRadiant && !CFG.radiant) {
    CFG.radiant = { x: -0.1 * w, y: 0.2 * h };
  }

  let startX, startY, angle;
  if (CFG.enableRadiant && CFG.radiant) {
    // on commence un peu “loin” du radiant pour créer la perspective
    const r = CFG.radiant;
    // cible à l’écran (zone supérieure/gauche pour garder une diagonale descendante)
    const targetX = rand(w * 0.2, w * 0.7);
    const targetY = rand(h * 0.1, h * 0.6);
    angle = Math.atan2(targetY - r.y, targetX - r.x) + rand(-0.06, 0.06);
    // start un peu avant le bord opposé au radiant
    startX = rand(-80, w * 0.25);
    startY = rand(-60, h * 0.35);
  } else {
    startX = Math.random() < 0.6 ? rand(-80, w * 0.25) : rand(-80, w * 0.15);
    startY = rand(-60, h * 0.4);
    angle = rand(0.35, 0.75); // 20°–43°
  }
  return { startX, startY, angle };
}

/** Crée un météore avec typologie et propriétés */
function createMeteor() {
  if (!canvas) return null;
  const t = pickType();
  const { startX, startY, angle } = spawnParams();

  const baseSpeed = rand(CFG.speedMin, CFG.speedMax);
  const speed = baseSpeed * t.speedMul;
  const length = rand(CFG.lengthMin, CFG.lengthMax) * t.lenMul;
  const thickness = rand(CFG.thicknessMin, CFG.thicknessMax) * t.thicknessMul;

  const hue = (t.hue ?? CFG.hueBase) + rand(-CFG.hueJitter, CFG.hueJitter);
  const sat = t.sat ?? 100;
  const light = t.light ?? 85;

  return {
    type: t,
    x: startX,
    y: startY,
    angle,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    length,
    thickness,
    alpha: 1,
    hue, sat, light,
    life: 0,
    fragmented: false,
  };
}

/** Tapered line helper: multi-stroke dégressif pour simuler le fuseau */
function drawTaperedTrail(x1, y1, x2, y2, baseWidth, colorStops) {
  // 3 passes du plus large au plus fin
  for (let i = 0; i < 3; i++) {
    const t = i / 2; // 0, 0.5, 1
    const w = baseWidth * (1 - 0.55 * t);
    const grad = ctx.createLinearGradient(x1, y1, x2, y2);
    for (const [stop, col] of colorStops) grad.addColorStop(stop, col);
    ctx.strokeStyle = grad;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

/** Dessin d’un météore (tête + traînée dégradée + glow) */
function drawMeteor(m) {
  const dirAngle = Math.atan2(m.vy, m.vx);
  const tailX = m.x - Math.cos(dirAngle) * m.length;
  const tailY = m.y - Math.sin(dirAngle) * m.length;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.shadowBlur = CFG.glow;
  ctx.shadowColor = `hsla(${m.hue}, ${m.sat}%, ${m.light}%, ${m.alpha * 0.8})`;

  // Couleurs: tête brillante → corps → fin transparente
  const head = `hsla(${m.hue}, ${m.sat}%, ${Math.min(100, m.light + 6)}%, ${m.alpha})`;
  const mid  = `hsla(${m.hue}, ${m.sat}%, ${m.light - 8}%, ${m.alpha * 0.55})`;
  const end  = `hsla(${m.hue}, ${m.sat}%, ${m.light - 20}%, 0)`;

  drawTaperedTrail(m.x, m.y, tailX, tailY, m.thickness, [
    [0.00, head],
    [0.45, mid],
    [1.00, end],
  ]);

  // Tête (boule) + petit flare intermittent
  const flick = 1 + (Math.random() - 0.5) * CFG.flickerAmp;
  ctx.beginPath();
  ctx.fillStyle = `hsla(${m.hue}, ${m.sat}%, ${Math.min(100, m.light + 10)}%, ${m.alpha})`;
  ctx.arc(m.x, m.y, m.thickness * 0.95 * flick, 0, Math.PI * 2);
  ctx.fill();

  // Flare ponctuel (rares pulses)
  if (Math.random() < m.type.flare * 0.04) {
    ctx.beginPath();
    ctx.fillStyle = `hsla(${m.hue}, ${m.sat}%, 100%, ${m.alpha * 0.6})`;
    ctx.arc(m.x, m.y, m.thickness * 1.8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/** Petites étincelles lors d’une fragmentation */
function spawnSparks(m, n = randInt(3, 6)) {
  const ang = Math.atan2(m.vy, m.vx);
  for (let i = 0; i < n; i++) {
    const a = ang + rand(-0.9, 0.9);           // cône latéral
    const s = rand(2, 5);
    sparks.push({
      x: m.x + rand(-2, 2),
      y: m.y + rand(-2, 2),
      vx: Math.cos(a) * s,
      vy: Math.sin(a) * s,
      life: randInt(12, 22),
      alpha: 1,
      hue: m.hue,
      sat: m.sat,
      light: m.light,
      r: rand(0.6, 1.4),
    });
  }
}

function drawSpark(p) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  ctx.shadowBlur = 8;
  ctx.shadowColor = `hsla(${p.hue}, ${p.sat}%, ${p.light}%, ${p.alpha})`;
  ctx.fillStyle = `hsla(${p.hue}, ${p.sat}%, ${Math.min(100, p.light + 6)}%, ${p.alpha})`;
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function stepSpark(p) {
  p.x += p.vx;
  p.y += p.vy;
  p.vy += 0.02;              // légère gravité visuelle
  p.alpha *= 0.94;
  p.life--;
  return p.life > 0 && p.alpha > 0.02;
}

/** Mise à jour d’un météore (courbure subtile + fragmentation rare) */
function stepMeteor(m) {
  // Petite dérive angulaire pour effet “arc” naturel
  m.angle += (Math.random() - 0.5) * CFG.angleNoise;
  const spd = Math.hypot(m.vx, m.vy);
  m.vx = Math.cos(m.angle) * spd;
  m.vy = Math.sin(m.angle) * spd;

  m.x += m.vx;
  m.y += m.vy;

  // Fade: certains types persistent davantage
  const fade = CFG.fadePerFrame * (m.type.fadeMul ?? 1);
  m.alpha = clamp(m.alpha - fade, 0, 1);
  m.life++;

  // Fragmentation occasionnelle en milieu/fin de vie
  if (!m.fragmented && m.alpha < 0.7 && Math.random() < m.type.frag * 0.03) {
    spawnSparks(m);
    m.fragmented = true;
  }

  const off = (m.x < -120 || m.y < -120 || m.x > canvas.width + 120 || m.y > canvas.height + 120);
  return !(off || m.alpha <= 0.02);
}

/** Boucle d’animation: on n’efface pas le fond global */
function loop() {
  // Météores
  for (let i = meteors.length - 1; i >= 0; i--) {
    const m = meteors[i];
    drawMeteor(m);
    const alive = stepMeteor(m);
    if (!alive) meteors.splice(i, 1);
  }
  // Étincelles
  for (let i = sparks.length - 1; i >= 0; i--) {
    const p = sparks[i];
    drawSpark(p);
    if (!stepSpark(p)) sparks.splice(i, 1);
  }

  rafId = requestAnimationFrame(loop);
}

/** Planification d’apparitions (avec bursts) */
function scheduleNext() {
  const delay = rand(CFG.minDelay, CFG.maxDelay);
  schedulerId = setTimeout(() => {
    if (Math.random() < CFG.burstChance) {
      const n = randInt(2, 3);
      for (let i = 0; i < n; i++) {
        if (meteors.length < CFG.maxConcurrent) {
          const m = createMeteor(); if (m) meteors.push(m);
        }
      }
    } else {
      if (meteors.length < CFG.maxConcurrent) {
        const m = createMeteor(); if (m) meteors.push(m);
      }
    }
    scheduleNext();
  }, delay);
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

/** Public */
export function initEtoileFilante(options = {}) {
  canvas = document.getElementById('theme-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');
  // merge options (si jamais tu en passes plus tard)
  CFG = { ...CFG, ...options };

  stopEtoiles(true); // évite doublons
  rafId = requestAnimationFrame(loop);
  scheduleNext();

  document.addEventListener('visibilitychange', handleVisibility, { passive: true });
}

export function stopEtoiles(keepListeners = false) {
  if (rafId) cancelAnimationFrame(rafId);
  if (schedulerId) clearTimeout(schedulerId);
  rafId = null; schedulerId = null;
  meteors.length = 0;
  sparks.length = 0;
  if (!keepListeners) {
    document.removeEventListener('visibilitychange', handleVisibility);
  }
}
