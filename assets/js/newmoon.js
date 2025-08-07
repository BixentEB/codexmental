// newmoon.js (SVG avec masque corrigé en canvas)

function loadSunCalc(callback) {
  if (window.SunCalc) {
    callback();
  } else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.min.js";
    script.onload = callback;
    document.head.appendChild(script);
  }
}

export function updateNewMoonWidget() {
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = "svg-lune-widget";

  container.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <clipPath id="moon-clip">
          <circle cx="50" cy="50" r="50"/>
        </clipPath>
        <mask id="moon-mask">
          <rect width="100%" height="100%" fill="white"/>
          <path id="shadow-path" fill="black"/>
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%"
             filter="brightness(0.4) opacity(0.15)" clip-path="url(#moon-clip)"/>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%"
             mask="url(#moon-mask)" clip-path="url(#moon-clip)"/>
    </svg>
  `;

  document.body.appendChild(container);

  const sizes = [
    { w: "150px", h: "150px", class: "" },
    { w: "250px", h: "250px", class: "" },
    { w: "500px", h: "500px", class: "super-lune" }
  ];
  let sizeIndex = 1;

  function applySize() {
    container.style.width = sizes[sizeIndex].w;
    container.style.height = sizes[sizeIndex].h;
    container.className = sizes[sizeIndex].class;
  }

  applySize();

  container.addEventListener("click", (e) => {
    e.preventDefault();
    sizeIndex = (sizeIndex + 1) % sizes.length;
    applySize();
  });

  loadSunCalc(() => {
    updateMoon();
    setInterval(updateMoon, 3600000);
  });
}

function updateMoon() {
  const now = new Date();
  const { fraction, phase } = SunCalc.getMoonIllumination(now);
  const shadowPath = document.getElementById("shadow-path");
  if (!shadowPath) return;

  const isWaxing = phase < 0.5;
  const cx = 50;
  const cy = 50;
  const r = 50;

  if (fraction < 0.01) {
    shadowPath.setAttribute("d", "M0,0L100,0L100,100L0,100Z");
    return;
  } else if (fraction > 0.99) {
    shadowPath.setAttribute("d", "M0,0L0,0");
    return;
  }

  const overlap = (1 - fraction) * r;
  const dx = isWaxing ? overlap : -overlap;

  // correction progressive selon la courbure pour une transition plus douce
  const correction = 1 - Math.abs(0.5 - fraction);
  const shrinkFactor = 0.3 + 0.7 * correction;
  const arcRadius = r * shrinkFactor;

  const x1 = cx;
  const x2 = cx + dx;

  const d =
    "M " + x1 + "," + (cy - r) +
    " A" + r + "," + r + " 0 0,1 " + x1 + "," + (cy + r) +
    " A" + arcRadius + "," + r + " 0 0," + (isWaxing ? 1 : 0) + " " + x2 + "," + (cy - r) +
    " A" + arcRadius + "," + r + " 0 0,1 " + x2 + "," + (cy + r) +
    " A" + r + "," + r + " 0 0," + (isWaxing ? 0 : 1) + " " + x1 + "," + (cy - r) + " Z";

  shadowPath.setAttribute("d", d);

  let phaseName = "";
  if (phase < 0.125) phaseName = "🌑 Nouvelle lune";
  else if (phase < 0.25) phaseName = "🌒 Croissant croissant";
  else if (phase < 0.375) phaseName = "🌓 Premier quartier";
  else if (phase < 0.5) phaseName = "🌔 Gibbeuse croissante";
  else if (phase < 0.625) phaseName = "🌕 Pleine lune";
  else if (phase < 0.75) phaseName = "🌖 Gibbeuse décroissante";
  else if (phase < 0.875) phaseName = "🌗 Dernier quartier";
  else phaseName = "🌘 Croissant décroissant";

  console.log(`${phaseName} - Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)}`);
}
