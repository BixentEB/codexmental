export function updateNewMoonWidget(SunCalc) {
  console.log("✅ newmoon.js launched with SunCalc and updated logic.");

  if (!document.body.classList.contains("theme-lunaire")) {
    return;
  }

  // Remove any existing widget
  const existing = document.getElementById('svg-lune-widget');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'svg-lune-widget';

  container.innerHTML = `
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

  document.body.appendChild(container);

  // Size cycle on click
  const sizes = [
    { w: "150px", h: "150px", class: "" },
    { w: "250px", h: "250px", class: "" },
    { w: "500px", h: "500px", class: "super-lune" }
  ];
  let sizeIndex = 1; // Start medium

  function applySize() {
    container.style.width = sizes[sizeIndex].w;
    container.style.height = sizes[sizeIndex].h;
    container.classList.remove("super-lune");
    if (sizes[sizeIndex].class) {
      container.classList.add(sizes[sizeIndex].class);
    }
  }
  applySize();

  container.addEventListener("click", (e) => {
    if (window.innerWidth > 568) { // Désactivé sur mobile
      e.preventDefault();
      sizeIndex = (sizeIndex + 1) % sizes.length;
      applySize();
    }
  });

  // Update moon phase using SunCalc
  function updatePhase() {
    const { fraction, phase } = SunCalc.getMoonIllumination(new Date());
    const ombre = document.getElementById('ombre');
    if (!ombre) return;

    const illumination = fraction * 100;
    const isWaxing = phase < 0.5;

    let cx;

    if (illumination <= 0.1) {
      cx = 50;
    } else if (illumination >= 99) {
      cx = isWaxing ? -50 : 150;
    } else {
      cx = isWaxing
        ? 50 - (50 * illumination / 100)
        : 50 + (50 * illumination / 100);
    }

    ombre.setAttribute('cx', cx);
    console.log(`🌙 Illumination: ${illumination.toFixed(1)}% | Phase: ${phase.toFixed(3)} | ${isWaxing ? "Croissante" : "Décroissante"} (cx=${cx})`);
  }

  updatePhase();
  const interval = setInterval(updatePhase, 3600000);

  return () => clearInterval(interval);
}
