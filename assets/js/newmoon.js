// newmoon.js (version corrigée : orientation via angle, forme via trigonométrie)

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
      <g id="moon-group">
        <image href="/img/lune/lune-pleine.png" width="100%" height="100%"
               mask="url(#moon-mask)" clip-path="url(#moon-clip)"/>
      </g>
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
  const { fraction, phase, angle } = SunCalc.getMoonIllumination(now);
  const shadowPath = document.getElementById("shadow-path");
  const moonGroup = document.getElementById("moon-group");
  if (!shadowPath || !moonGroup) return;

  const cx = 50;
  const cy = 50;
  const r = 50;

  if (fraction < 0.01) {
    shadowPath.setAttribute("d", "M0,0L100,0L100,100L0,100Z");
    moonGroup.setAttribute("transform", "");
    return;
  }

  if (fraction > 0.99) {
    shadowPath.setAttribute("d", "");
    moonGroup.setAttribute("transform", "");
    return;
  }

  // Détermination de la largeur de l'ombre (terminateur)
  // Formule géométrique : largeur liée à la fraction éclairée
  const terminatorOffset = Math.sqrt(1 - Math.pow((fraction * 2) - 1, 2)) * r;

  // Orientation réelle : angle en radians -> rotation SVG
  const rotationDeg = angle * (180 / Math.PI);
  moonGroup.setAttribute("transform", `rotate(${rotationDeg}, ${cx}, ${cy})`);

  // Détermination sens croissant/décroissant
  const isWaxing = phase < 0.5;

  // Tracé du terminateur lunaire
  const ellipseX = isWaxing ? cx + terminatorOffset : cx - terminatorOffset;

  const d = `
    M ${cx},${cy - r}
    A ${r},${r} 0 0,1 ${cx},${cy + r}
    A ${r},${r} 0 0,1 ${cx},${cy - r}
    Z
    M ${ellipseX},${cy - r}
    A ${terminatorOffset},${r} 0 0,${isWaxing ? 0 : 1} ${ellipseX},${cy + r}
    A ${terminatorOffset},${r} 0 0,${isWaxing ? 1 : 0} ${ellipseX},${cy - r}
    Z
  `;

  shadowPath.setAttribute("d", d.trim());

  // Nom de phase
  let phaseName = "";
  if (phase < 0.125) phaseName = "🌑 Nouvelle lune";
  else if (phase < 0.25) phaseName = "🌒 Croissant croissant";
  else if (phase < 0.375) phaseName = "🌓 Premier quartier";
  else if (phase < 0.5) phaseName = "🌔 Gibbeuse croissante";
  else if (phase < 0.625) phaseName = "🌕 Pleine lune";
  else if (phase < 0.75) phaseName = "🌖 Gibbeuse décroissante";
  else if (phase < 0.875) phaseName = "🌗 Dernier quartier";
  else phaseName = "🌘 Croissant décroissant";

  console.log(`${phaseName} - Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)} Angle=${rotationDeg.toFixed(1)}°`);
}
