export function updateLunarWidget(SunCalc) {
  console.log("✅ Module lunaire chargé avec SunCalc");

  if (!document.body.classList.contains("theme-lunaire")) {
    console.log("🌙 Thème lunaire non actif, arrêt du module");
    return;
  }

  // Nettoyage des éléments existants
  const existingWidget = document.getElementById("svg-lune-widget");
  if (existingWidget) existingWidget.remove();

  // Création du SVG
  const widget = document.createElement("div");
  widget.id = "svg-lune-widget";
  widget.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <mask id="mask-lune">
          <rect x="0" y="0" width="100" height="100" fill="white"/>
          <circle id="lune-ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" width="100" height="100" opacity="0.2"/>
      <image href="/img/lune/lune-pleine.png" width="100" height="100" mask="url(#mask-lune)"/>
    </svg>
  `;
  document.body.appendChild(widget);

  function getMoonData() {
    const now = new Date();
    const moonData = SunCalc.getMoonIllumination(now);
    return {
      illumination: moonData.fraction * 100,
      isWaxing: moonData.phase < 0.5
    };
  }

  function updateMoonDisplay(illumination, isWaxing) {
    const ombre = document.getElementById("lune-ombre");
    if (!ombre) return;

    // Calcul de la position du masque (inversé car le masque cache la lune)
    const phase = 100 - Math.min(100, Math.max(0, illumination));
    let positionX;

    if (phase <= 0.1) { // Pleine lune
      positionX = 150; // Masque hors de la vue
    } else if (phase >= 99.9) { // Nouvelle lune
      positionX = 50; // Masque centré
    } else {
      const offset = 50 * (phase / 100);
      positionX = isWaxing ? 50 - offset : 50 + offset;
    }

    ombre.setAttribute("cx", positionX);
    console.log(`🌝 Phase: ${illumination.toFixed(1)}% | Direction: ${isWaxing ? "Croissante" : "Décroissante"} | Position: ${positionX}`);
  }

  // Initialisation
  const { illumination, isWaxing } = getMoonData();
  updateMoonDisplay(illumination, isWaxing);

  // Mise à jour périodique (toutes les heures)
  const updateInterval = setInterval(() => {
    const { illumination, isWaxing } = getMoonData();
    updateMoonDisplay(illumination, isWaxing);
  }, 3600000);

  // Nettoyage si nécessaire
  return () => clearInterval(updateInterval);
}
