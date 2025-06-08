// === 🌌 CANVAS UNIFIÉ : EFFETS STELLAIRE & GALACTIQUE ===
let canvas, ctx, rafId;
let particles = [];

function setupCanvas() {
  canvas = document.getElementById("theme-canvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  canvas.style.opacity = '0';
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initParticles(type = 'stars', count = 120) {
  particles = Array.from({ length: count }, () => {
    const r = Math.random() * 1.5 + 0.3;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r,
      alpha: Math.random(),
      delta: (Math.random() * 0.02) * (Math.random() < 0.5 ? 1 : -1),
      type
    };
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let p of particles) {
    p.alpha += p.delta;
    if (p.alpha <= 0 || p.alpha >= 1) p.delta *= -1;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);

    if (p.type === 'stars') {
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    } else if (p.type === 'dust') {
      ctx.fillStyle = `rgba(200, 150, 255, ${p.alpha})`;
    }

    ctx.fill();
  }
  rafId = requestAnimationFrame(animateParticles);
}

function stopParticles() {
  if (rafId) cancelAnimationFrame(rafId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles = [];
  if (canvas) canvas.style.opacity = '0';
}

// === 🎨 THÈME ===
function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('codexTheme', theme);

  stopParticles();

  if (!canvas) return;
  if (theme === 'theme-stellaire') {
    setupCanvas();
    initParticles('stars', 120);
    canvas.style.opacity = '1';
    animateParticles();
  } else if (theme === 'theme-galactique') {
    setupCanvas();
    initParticles('dust', 100);
    canvas.style.opacity = '1';
    animateParticles();
  }
}

// === 🧩 INJECTION MENU / FOOTER ===
function injectPartial(id, url) {
  const target = document.getElementById(id);
  if (!target) return;

  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error(`Erreur chargement ${url}`);
      return response.text();
    })
    .then(html => {
      target.innerHTML = html;
      if (id === 'menu-placeholder') highlightActiveLink();
    })
    .catch(err => {
      console.error("❌ Injection échouée :", err);
    });
}

// === 🌐 LIEN ACTIF DANS LE MENU ===
function highlightActiveLink() {
  const currentPath = location.pathname.replace(/\/+$/, '');
  const links = document.querySelectorAll("nav a");

  links.forEach(link => {
    const href = link.getAttribute("href");
    const linkPath = new URL(href, window.location.origin).pathname.replace(/\/+$/, '');
    if (linkPath === currentPath) {
      link.classList.add("active");
    }
  });
}

// === ⬆️ BOUTON RETOUR HAUT ===
function setupScrollButton() {
  const scrollBtn = document.getElementById('scrollTopBtn');
  if (!scrollBtn) return;

  scrollBtn.style.display = 'none';

  scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  window.addEventListener('scroll', () => {
    scrollBtn.style.display = window.scrollY > 100 ? 'block' : 'none';
  });
}

// === 🚀 INITIALISATION ===
window.addEventListener('DOMContentLoaded', () => {
  // Canvas unifié
  canvas = document.getElementById('theme-canvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
    canvas.style.opacity = '0';
  }

  // Appliquer thème
  const savedTheme = localStorage.getItem('codexTheme') || 'theme-stellaire';
  setTheme(savedTheme);

  // Bouton scroll
  setupScrollButton();

  // Injections
  injectPartial('menu-placeholder', '/menu.html');
  injectPartial('footer-placeholder', '/footer.html');
});
