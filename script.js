
function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('codexTheme', theme);

  if (theme === 'theme-stellaire') {
    initStars();
    animateStars();
  } else {
    if (window.cancelAnimationFrame && rafId) cancelAnimationFrame(rafId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

window.addEventListener('DOMContentLoaded', () => {
  const saved = localStorage.getItem('codexTheme');
  if (saved) setTheme(saved);
});

const canvas = document.getElementById('stellaire-stars');
const ctx = canvas.getContext('2d');
let stars = [], rafId;

function initStars(count = 100) {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  stars = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      alpha: Math.random(),
      delta: Math.random() * 0.02
    });
  }
}

function animateStars() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let s of stars) {
    s.alpha += s.delta;
    if (s.alpha <= 0 || s.alpha >= 1) s.delta *= -1;
    ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, 2 * Math.PI);
    ctx.fill();
  }
  rafId = requestAnimationFrame(animateStars);
}

window.addEventListener('resize', () => {
  if (document.body.classList.contains('theme-stellaire')) {
    initStars();
  }
});
function formSubmitted() {
  const msg = document.getElementById("confirmationMessage");
  const form = document.getElementById("contactForm");
  if (form && msg) {
    form.reset();
    msg.style.display = "block";
  }
}
