export function updateLunarWidget() {
  console.log("✅ newlune.js lancé (calcul interne, pas SunCalc).");

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
    const base = new Date('2025-06-25T00:00:00Z');
    const diff = (Date.now() - base) / (1000 * 60 * 60 * 24);
    const lunations = diff / 29.530588853;
    const phase = (lunations % 1 + 1) % 1;

    const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
    const isWaxing = phase < 0.5;

    return {
      illumination: illumination * 100,
      isWaxing
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
  console.log(`🌙 Illumination calculée: ${illumination.toFixed(1)}%`);
  setMoonPhaseSVG(illumination, isWaxing);

  setInterval(() => {
    const { illumination, isWaxing } = getMoonData();
    setMoonPhaseSVG(illumination, isWaxing);
  }, 3600000);
}
