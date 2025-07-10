export function updateLunarWidget(SunCalc) {
  console.log("✅ Module lunaire initialisé");

  // Nettoyage
  const oldWidget = document.getElementById("svg-lune-widget");
  if (oldWidget) oldWidget.remove();

  // Création du SVG
  const widget = document.createElement("div");
  widget.id = "svg-lune-widget";
  widget.innerHTML = `
    <svg viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <mask id="lune-mask">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="lune-mask-circle" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" width="100" height="100" class="lune-background"/>
      <image href="/img/lune/lune-pleine.png" width="100" height="100" mask="url(#lune-mask)" class="lune-foreground"/>
    </svg>
  `;
  document.body.appendChild(widget);

  function updateMoonPhase() {
    const moon = SunCalc.getMoonIllumination(new Date());
    const illumination = moon.fraction * 100;
    const isWaxing = moon.phase < 0.5;
    
    const mask = document.getElementById("lune-mask-circle");
    if (!mask) return;

    // Nouveau calcul de position
    let maskPosition;
    if (illumination >= 99.9) { // Pleine lune
      maskPosition = 150; // Hors du viewBox à droite
    } else if (illumination <= 0.1) { // Nouvelle lune
      maskPosition = 50; // Centré
    } else {
      const offset = 50 * (1 - illumination/100);
      maskPosition = isWaxing ? 50 + offset : 50 - offset;
    }

    mask.setAttribute("cx", maskPosition);
    console.log(`🌕 Phase: ${illumination.toFixed(1)}% | Position: ${maskPosition} | ${isWaxing ? "Croissant" : "Décroissant"}`);
  }

  // Initialisation
  updateMoonPhase();
  setInterval(updateMoonPhase, 3600000); // Mise à jour horaire
}
