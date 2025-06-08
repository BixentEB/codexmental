// === 🌌 FOND STELLAIRE ===
let canvas, ctx, stars = [], rafId;

function startStarfield() {
  if (!canvas || !ctx) return;
  resizeCanvas();
  initStars();
  animateStars();
  window.addEventListener('resize', resizeCanvas);
}

function stopStarfield() {
  if (rafId) cancelAnimationFrame(rafId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  window.removeEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}

function initStars(count = 120) {
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      alpha: Math.random(),
      delta: (Math.random() * 0.02) * (Math.random() < 0.5 ? 1 : -1)
    });
  }
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let s of stars) {
    s.alpha += s.delta;
    if (s.alpha <= 0 || s.alpha >= 1) s.delta *= -1;

    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.fill();
  }
  rafId = requestAnimationFrame(animateStars);
}

// === 🎨 THÈME ===
function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('codexTheme', theme);

  if (theme === 'theme-stellaire') {
    startStarfield();
    setTimeout(() => {
      if (canvas) canvas.style.opacity = '1';
    }, 200);
  } else {
    stopStarfield();
    if (canvas) canvas.style.opacity = '0';
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
    })
    .catch(err => {
      console.error("❌ Injection échouée :", err);
    });
}

// === ⬆️ RETOUR HAUT ===
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
  // Fond stellaire
  canvas = document.getElementById('stellaire-stars');
  if (canvas) {
    ctx = canvas.getContext('2d');
    canvas.style.opacity = '0';
  }

  const savedTheme = localStorage.getItem('codexTheme') || 'theme-stellaire';
  setTheme(savedTheme);

  // Menu actif
  const path = window.location.pathname.replace(/\/+$/, '');
  const links = document.querySelectorAll("nav a");

  links.forEach(link => {
    const href = link.getAttribute("href");
    const linkPath = new URL(href, window.location.origin).pathname.replace(/\/+$/, '');
    if (linkPath === path) {
      link.classList.add("active");
    }
  });

  // Scroll top
  setupScrollButton();

  // Injection HTML
  injectPartial('menu-placeholder', 'menu.html');
  injectPartial('footer-placeholder', 'footer.html');
});
