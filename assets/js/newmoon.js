export function updateNewMoonWidget(SunCalc) {
  console.log("✅ newmoon.js lancé avec la version géométrique réaliste (cosinus).");

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
    const { phase, fraction } = SunCalc.getMoonIllumination(new Date());
    const ombre = document.getElementById('ombre');
    if (!ombre) return;

    // Calcul géométrique réaliste
    const angle = phase * Math.PI * 2;
    const cx = 50 + (50 * Math.cos(angle));

    ombre.setAttribute('cx', cx);

    console.log(`🌙 Phase: ${phase.toFixed(4)} | Illumination: ${(fraction * 100).toFixed(2)}% | cx=${cx.toFixed(2)}`);
  }

  updatePhase();
  const interval = setInterval(updatePhase, 3600000);

  return () => clearInterval(interval);
}
