export function updateLunarWidget(SunCalc) {
  console.log("✅ newlune.js lancé avec SunCalc.");

  if (!document.body.classList.contains("theme-lunaire")) {
    console.log("🌙 Thème lunaire non actif, rien à faire.");
    return;
  }

  // Nettoyage
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();

  const wrapper = document.createElement("div");
  wrapper.id = "svg-lune-widget";
  wrapper.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <mask id="mask-lune">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" filter="url(#lune-fantome)"/>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" mask="url(#mask-lune)"/>
    </svg>
  `;
  document.body.appendChild(wrapper);

  function getMoonData() {
    const moon = SunCalc.getMoonIllumination(new Date());
    return {
      illumination: moon.fraction * 100,
      isWaxing: moon.phase < 0.5
    };
  }

  function setMoonPhaseSVG(illumination, isWaxing) {
    const ombre = document.getElementById("ombre");
    if (!ombre) return;

    // Normalisation entre 0 et 100
    const adjustedIllumination = Math.min(100, Math.max(0, illumination));
    let ombreCx;

    if (adjustedIllumination <= 0.1) {
      // Nouvelle Lune (masque total)
      ombreCx = 50;
    } else if (adjustedIllumination >= 99.9) {
      // Pleine Lune (masque invisible)
      ombreCx = 150;
    } else {
      // Phases intermédiaires (déplacement progressif)
      const progress = adjustedIllumination / 100;
      const offset = 100 * (0.5 - progress);
      ombreCx = isWaxing ? 50 + offset : 50 - offset;
    }

    ombre.setAttribute("cx", ombreCx);
    console.log(`🌙 Phase: ${adjustedIllumination.toFixed(1)}% | CX: ${ombreCx} | ${isWaxing ? "Croissant" : "Décroissant"}`);
  }

  // Initialisation
  const { illumination, isWaxing } = getMoonData();
  setMoonPhaseSVG(illumination, isWaxing);

  // Mise à jour toutes les heures
  setInterval(() => {
    const { illumination, isWaxing } = getMoonData();
    setMoonPhaseSVG(illumination, isWaxing);
  }, 3600000);
}
