// ========================================================
// canvas-sky.js — Thème "Sky": dégradé, lumières tombantes, nuages, parallax
// Utilise le <canvas id="theme-canvas"> déjà présent et fixé en fond.
// S'arrête proprement via stopSky() (appelé par theme-engine).
// ========================================================

let canvas, ctx, rafId;
let dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1)); // cap pour perf

// --- Effets ---
let lights = [];   // petites lumières/lucioles qui tombent
let clouds = [];   // "puffs" nuageux doux, très légers
let scrollPct = 0; // 0..1 -> parallax vertical du ciel

// --- Params (tweakables) ---
const SKY = {
  // Populations
  LIGHT_COUNT_BASE: 48,
  CLOUD_COUNT_BASE: 42,

  // Vitesse/échelle
  LIGHT_MIN_SPEED: 0.15,
  LIGHT_MAX_SPEED: 0.6,
  CLOUD_MIN_SPEED: 0.02,
  CLOUD_MAX_SPEED: 0.08,

  // Tailles
  LIGHT_MIN_R: 0.6,
  LIGHT_MAX_R: 1.8,
  CLOUD_MIN_R: 120,
  CLOUD_MAX_R: 420,

  // Opacités
  CLOUD_MIN_A: 0.02,
  CLOUD_MAX_A: 0.09,

  // Couleurs
  TOP_COLOR:   { r: 20,  g: 60,  b: 110 }, // bleu royal
  MID_COLOR:   { r: 40,  g: 110, b: 170 },
  BOTTOM_COLOR:{ r: 155, g: 200, b: 245 }  // bleu ciel
};

function lerp(a, b, t) { return a + (b - a) * t; }
function colorMix(c1, c2, t) {
  return `rgb(${Math.round(lerp(c1.r, c2.r, t))},${Math.round(lerp(c1.g, c2.g, t))},${Math.round(lerp(c1.b, c2.b, t))})`;
}

function fitCanvas() {
  if (!canvas) return;
  const w = Math.floor(window.innerWidth * dpr);
  const h = Math.floor(window.innerHeight * dpr);
  if (canvas.width !== w || canvas.height !== h) {
    canvas.width = w; canvas.height = h;
  }
  canvas.style.width = "100vw";
  canvas.style.height = "100vh";
}

function seedWorld() {
  const area = window.innerWidth * window.innerHeight;

  // Densités dépendantes de la surface (évite sur/sous population)
  const lightCount = Math.max(SKY.LIGHT_COUNT_BASE, Math.floor(area / 32000));
  const cloudCount = Math.max(SKY.CLOUD_COUNT_BASE, Math.floor(area / 50000));

  lights = Array.from({ length: lightCount }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: (Math.random() * (SKY.LIGHT_MAX_R - SKY.LIGHT_MIN_R) + SKY.LIGHT_MIN_R) * dpr,
    vy: (Math.random() * (SKY.LIGHT_MAX_SPEED - SKY.LIGHT_MIN_SPEED) + SKY.LIGHT_MIN_SPEED) * dpr,
    a: Math.random() * 0.8 + 0.2,                 // alpha de base
    tw: Math.random() * 0.012 + 0.004             // twinkle speed
  }));

  clouds = Array.from({ length: cloudCount }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    r: (Math.random() * (SKY.CLOUD_MAX_R - SKY.CLOUD_MIN_R) + SKY.CLOUD_MIN_R) * dpr,
    vx: (Math.random() * (SKY.CLOUD_MAX_SPEED - SKY.CLOUD_MIN_SPEED) + SKY.CLOUD_MIN_SPEED) * dpr * (Math.random() < 0.5 ? -1 : 1),
    vy: (Math.random() * (SKY.CLOUD_MAX_SPEED - SKY.CLOUD_MIN_SPEED) + SKY.CLOUD_MIN_SPEED) * dpr * 0.2,
    a: Math.random() * (SKY.CLOUD_MAX_A - SKY.CLOUD_MIN_A) + SKY.CLOUD_MIN_A
  }));
}

function drawGradientSky() {
  // Parallax vertical: déplacé en fonction du scrollPct
  // (on fait glisser le point médian entre TOP->MID->BOTTOM)
  const g = ctx.createLinearGradient(0, 0, 0, canvas.height);
  const tMid = 0.45 + (scrollPct - 0.5) * 0.25; // 0.32..0.57 environ
  g.addColorStop(0,        colorMix(SKY.TOP_COLOR, SKY.MID_COLOR, 0.15));
  g.addColorStop(tMid,     colorMix(SKY.MID_COLOR, SKY.MID_COLOR, 1.0));
  g.addColorStop(1,        colorMix(SKY.MID_COLOR, SKY.BOTTOM_COLOR, 0.85));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawClouds() {
  ctx.globalCompositeOperation = "lighter";
  for (const c of clouds) {
    const grd = ctx.createRadialGradient(c.x, c.y, c.r * 0.2, c.x, c.y, c.r);
    grd.addColorStop(0, `rgba(255,255,255,${c.a})`);
    grd.addColorStop(1, `rgba(255,255,255,0)`);
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();

    // float
    c.x += c.vx;
    c.y += c.vy + (scrollPct - 0.5) * 0.2 * dpr; // légère dérive verticale liée au scroll

    // wrap douce
    if (c.x < -c.r) c.x = canvas.width + c.r;
    if (c.x > canvas.width + c.r) c.x = -c.r;
    if (c.y < -c.r) c.y = canvas.height + c.r;
    if (c.y > canvas.height + c.r) c.y = -c.r;
  }
  ctx.globalCompositeOperation = "source-over";
}

function drawLights() {
  for (const s of lights) {
    // twinkle subtil
    s.a += (Math.random() - 0.5) * s.tw;
    if (s.a < 0.25) s.a = 0.25;
    if (s.a > 1.0) s.a = 1.0;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.shadowBlur = 6 * dpr;
    ctx.shadowColor = `rgba(220,235,255,${s.a})`;
    ctx.fill();

    // chute lente (influence légère du scroll)
    s.y += s.vy + (scrollPct - 0.5) * 0.15 * dpr;
    if (s.y > canvas.height + 6 * dpr) {
      s.y = -6 * dpr;
      s.x = Math.random() * canvas.width;
    }
  }
  ctx.shadowBlur = 0;
}

function onScroll() {
  // progress global 0..1 (évite division 0)
  const doc = document.documentElement;
  const max = Math.max(1, (doc.scrollHeight - window.innerHeight));
  scrollPct = Math.min(1, Math.max(0, window.scrollY / max));
}

function loop() {
  if (!ctx) return;
  // fond dégradé
  drawGradientSky();
  // nuages doux
  drawClouds();
  // petites lumières tombantes
  drawLights();

  rafId = requestAnimationFrame(loop);
}

function handleResize() {
  fitCanvas();
  seedWorld();
}

// --- API publique ---
export function initSky() {
  canvas = document.getElementById('theme-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  dpr = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
  fitCanvas();
  seedWorld();

  // listeners
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', onScroll, { passive: true });

  // fade-in canvas
  canvas.style.opacity = '1';
  onScroll();
  loop();
}

export function stopSky() {
  if (rafId) cancelAnimationFrame(rafId);
  rafId = null;

  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', onScroll);

  if (ctx && canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.shadowBlur = 0;
  }
  lights = [];
  clouds = [];
}
