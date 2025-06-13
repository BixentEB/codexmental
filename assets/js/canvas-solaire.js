// ================================================
// ☀️ canvas-solaire.js – Soleil flottant avec pulsation pour thème solaire
// ================================================

export function initSoleilFlottant() {
  const canvas = document.getElementById("theme-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  // Redimensionne le canvas plein écran
  function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  resizeCanvas();
  window.addEventListener("resize", resizeCanvas);

  const soleil = {
    x: 220,             // Plus centré vers la gauche
    y: -100,            // Démarrage en haut
    baseRadius: 280,    // Rayon de base augmenté
    speedY: 0.07,        // Descente lente
    opacity: 0.35        // Opacité visible mais douce
  };

  let hasLogged = false;

  function draw() {
    if (!hasLogged) {
      console.log("🟡 Soleil flottant (version pulsante) activé !");
      hasLogged = true;
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ajout d’un effet de pulsation solaire
    const pulse = 20 * Math.sin(Date.now() / 1000); // Douce oscillation
    const radius = soleil.baseRadius + pulse;

    const gradient = ctx.createRadialGradient(
      soleil.x, soleil.y, 0,
      soleil.x, soleil.y, radius
    );
    gradient.addColorStop(0, `rgba(255, 220, 100, ${soleil.opacity})`);
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
