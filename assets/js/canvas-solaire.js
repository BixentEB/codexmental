// ================================================
// ☀️ canvas-solaire.js – Soleil flamboyant pour thème solaire
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
    x: 260,              // Plus au centre gauche
    y: -100,             // Commence en haut
    baseRadius: 340,     // Taille principale plus imposante
    speedY: 0.05,        // Descente lente
    opacity: 0.6         // Plus lumineux
  };

  let hasLogged = false;

  function draw() {
    if (!hasLogged) {
      console.log("☀️ Soleil flamboyant activé !");
      hasLogged = true;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const pulse = 35 * Math.sin(Date.now() / 900); // Pulsation plus forte
    const radius = soleil.baseRadius + pulse;

    const gradient = ctx.createRadialGradient(
      soleil.x, soleil.y, 0,
      soleil.x, soleil.y, radius
    );
    gradient.addColorStop(0, `rgba(255, 255, 200, ${soleil.opacity})`); // cœur blanc chaud
    gradient.addColorStop(0.4, `rgba(255, 220, 100, ${soleil.opacity})`);
    gradient.addColorStop(1, "rgba(255, 220, 100, 0)");

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
