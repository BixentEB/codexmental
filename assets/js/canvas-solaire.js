// ================================================
// ☀️ canvas-solaire.js – Soleil flamboyant intensifié pour thème solaire
// ================================================

export function initSoleilFlottant() {
  const canvas = document.getElementById("theme-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const soleil = {
    x: 290,              // Plus proche du centre gauche
    y: -100,
    baseRadius: 380,     // Plus large
    speedY: 0.04,        // Plus lente pour savourer
    opacity: 0.75        // Encore plus chaud
  };

  let hasLogged = false;

  function draw() {
    if (!hasLogged) {
      console.log("🌞 Soleil flamboyant+ activé !");
      hasLogged = true;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pulse = 45 * Math.sin(Date.now() / 1000);
    const radius = soleil.baseRadius + pulse;

    const gradient = ctx.createRadialGradient(
      soleil.x, soleil.y, 0,
      soleil.x, soleil.y, radius
    );
    gradient.addColorStop(0,   `rgba(255, 255, 220, ${soleil.opacity})`); // cœur très clair
    gradient.addColorStop(0.3, `rgba(255, 230, 120, ${soleil.opacity * 0.8})`);
    gradient.addColorStop(1,   "rgba(255, 200, 80, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(soleil.x, soleil.y, radius, 0, Math.PI * 2);
    ctx.fill();

    soleil.y += soleil.speedY;
    if (soleil.y > canvas.height + soleil.baseRadius) {
      soleil.y = -soleil.baseRadius;
    }

    requestAnimationFrame(draw);
  }

  draw();
}
