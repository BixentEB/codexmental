// newlune.js

export function updateLunarWidget() {
  console.log("✅ newlune.js chargé");

  if (!document.body.classList.contains("theme-lunaire")) {
    console.log("🌙 Thème lunaire non actif, rien à faire.");
    return;
  }

  // Nettoyer si déjà existant
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();

  // Créer le conteneur
  const wrapper = document.createElement("div");
  wrapper.id = "svg-lune-widget";
  wrapper.style.position = "fixed";
  wrapper.style.bottom = "20px";
  wrapper.style.right = "20px";
  wrapper.style.width = "250px";
  wrapper.style.height = "250px";
  wrapper.style.zIndex = "1000";
  wrapper.style.cursor = "pointer";

  // Création du SVG minimal sans filtre pour être sûr que ça s'affiche
  wrapper.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <mask id="mask-lune">
        <rect width="100%" height="100%" fill="white"/>
        <circle id="ombre" cx="50" cy="50" r="50" fill="black"/>
      </mask>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" mask="url(#mask-lune)"/>
    </svg>
  `;

  document.body.appendChild(wrapper);

  // Fonction de calcul avec SunCalc
  function getMoonData() {
    const moon = SunCalc.getMoonIllumination(new Date());
    return {
      illumination: moon.fraction * 100,
      isWaxing: moon.phase < 0.5
    };
  }

  // Fonction d'affichage
  function setMoonPhaseSVG(illumination, isWaxing) {
    const ombre = document.getElementById("ombre");
    if (!ombre) return;

    const progress = illumination / 100;
    let ombreCx;

    if (illumination <= 0.1) {
      ombreCx = 50;
    } else if (illumination >= 99.9) {
      ombreCx = isWaxing ? -50 : 150;
    } else {
      ombreCx = isWaxing
        ? 50 - (50 * progress)
        : 50 + (50 * progress);
    }

    ombre.setAttribute("cx", ombreCx);
  }

  // Initialiser
  const { illumination, isWaxing } = getMoonData();
  console.log(`🌙 Illumination actuelle: ${illumination.toFixed(1)}% - ${isWaxing ? "Croissante" : "Décroissante"}`);
  setMoonPhaseSVG(illumination, isWaxing);

  // Rafraîchir chaque heure
  setInterval(() => {
    const { illumination, isWaxing } = getMoonData();
    setMoonPhaseSVG(illumination, isWaxing);
  }, 3600000);
}
