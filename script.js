function setTheme(theme) {
  document.body.className = theme;
}
// Van Gogh Star Animation
const canvas = document.getElementById('vangogh-stars');
const ctx = canvas.getContext('2d');
let stars = [];

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
  requestAnimationFrame(animateStars);
}

window.addEventListener('resize', () => {
  if (document.body.classList.contains('theme-vangogh')) {
    initStars();
  }
});

// intégration dans le système de thème
function setTheme(theme) {
  document.body.className = theme;

  if (theme === 'theme-vangogh') {
    initStars();
    animateStars();
  }
}
