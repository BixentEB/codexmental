export function updateLunarWidget(SunCalc) {
  console.log("✅ newlune.js lancé avec SunCalc.");

  if (!document.body.classList.contains("theme-lunaire")) {
    console.log("🌙 Thème lunaire non actif, rien à faire.");
    return;
  }

  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();

  const wrapper = document.createElement("div");
  wrapper.id = "svg-lune-widget";
  wrapper.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <filter id="lune-fantome">
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.08"/>
          </feComponentTransfer>
          <feColorMatrix type="matrix"
            values="0.2 0 0 0 0
                    0 0.2 0 0 0
                    0 0 0.2 0 0
                    0 0 0 1 0"/>
        </filter>
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
      // On inverse ici pour que la logique corresponde aux croissants classiques
      isWaxing: moon.phase >= 0.5
    };
  }

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

  const { illumination, isWaxing } = getMoonData();
  console.log(`🌙 Illumination réelle: ${illumination.toFixed(1)}% - ${isWaxing ? "Croissante (classique)" : "Décroissante (classique)"}`);
  setMoonPhaseSVG(illumination, isWaxing);

  setInterval(() => {
    const { illumination, isWaxing } = getMoonData();
    setMoonPhaseSVG(illumination, isWaxing);
  }, 3600000);
}
