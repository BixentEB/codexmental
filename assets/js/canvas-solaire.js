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
    x: 180,
    y: -100,           // Commence au-dessus
    targetY: 100,      // S’arrête ici
    speedY: 0.5,       // Vitesse de descente
    radius: 240,
    opacity: 0.35
  };

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Crée un dégradé radial
    const gradient = ctx.createRadialGradient(
      soleil.x, soleil.y, 0,
      soleil.x, soleil.y, soleil.radius
    );
    gradient.addColorStop(0, `rgba(255, 220, 100, ${soleil.opacity})`);
    gradient.addColorStop(1, "rgba(255, 220, 100, 0)");

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(soleil.x, soleil.y, soleil.radius, 0, Math.PI * 2);
    ctx.fill();

    // Fait descendre jusqu’à la cible
    if (soleil.y < soleil.targetY) {
      soleil.y += soleil.speedY;
    }

    requestAnimationFrame(draw);
  }

  draw();
}
