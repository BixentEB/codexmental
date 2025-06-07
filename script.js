let canvas, ctx, stars = [], rafId;

// Appliquer le thème et gérer les étoiles
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

// Initialisation au chargement
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('stellaire-stars');
  if (canvas) {
    ctx = canvas.getContext('2d');
    canvas.style.opacity = '0'; // au cas où il reste visible
  }

  const savedTheme = localStorage.getItem('codexTheme') || 'theme-stellaire';
  setTheme(savedTheme);
});

// Lancer l’animation
function startStarfield() {
  if (!canvas || !ctx) return;

  resizeCanvas();
  initStars();
  animateStars();
  window.addEventListener('resize', resizeCanvas);
}

// Arrêter et nettoyer
function stopStarfield() {
  if (rafId) cancelAnimationFrame(rafId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  window.removeEventListener('resize', resizeCanvas);
}

// Ajuster la taille du canvas
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  initStars();
}

// Initialiser les étoiles
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

// Dessiner les étoiles
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

// Met en surbrillance le lien actif du menu
window.addEventListener('DOMContentLoaded', () => {
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
});

// Ajoute un bouton retour en haut dans le footer
window.addEventListener('scroll', () => {
  const btn = document.getElementById('scrollTopBtn');
  if (btn) btn.style.display = window.scrollY > 100 ? 'block' : 'none';
});

window.addEventListener('DOMContentLoaded', () => {
  const btn = document.getElementById('scrollTopBtn');
  if (btn) {
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
