// ================================================
// ☀️ canvas-solaire.js – Soleil flottant pour thème solaire
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
    x: 100,             // Coin gauche
    y: -100,            // Juste au-dessus du menu
    radius: 160,        // Taille du soleil
    speedY: 0.07,       // Vitesse de descente
    opacity: 0.3        // Transparence augmentée pour test
  };

  function draw() {
    // Debug console
    console.log("🟡 Soleil en cours de dessin à", soleil.x, soleil.y);

    ctx.clearRect(0, 0, canvas.width, canvas.height);

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

    soleil.y += soleil.speedY;
    if (soleil.y > canvas.height + soleil.radius) {
      soleil.y = -soleil.radius;
    }

    requestAnimationFrame(draw);
  }

  draw();
}
