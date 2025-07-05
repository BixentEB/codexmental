// Canvas étoiles animé
const canvas = document.getElementById('stars-canvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

const stars = [];
for (let i = 0; i < 120; i++) {
  stars.push({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    radius: Math.random() * 1.5,
    speed: Math.random() * 0.2 + 0.05,
    opacity: Math.random()
  });
}

function animateStars() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  stars.forEach(star => {
    star.y += star.speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
    ctx.beginPath();
    ctx.globalAlpha = star.opacity;
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI*2);
    ctx.fillStyle = 'white';
    ctx.fill();
  });
  requestAnimationFrame(animateStars);
}
animateStars();

// Bouton Entrer
document.getElementById('enter-btn').addEventListener('click', () => {
  window.location.href = "/home.html";
});
