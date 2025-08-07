// newmoon.js — version JS uniquement (pas de HTML), avec correction complète

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

function updateMoon() {
  const now = new Date();
  const { fraction, phase } = SunCalc.getMoonIllumination(now);
  const shadowPath = document.getElementById("shadow-path");
  if (!shadowPath) return;

  const isWaxing = phase < 0.5;
  const centerX = 50;
  const centerY = 50;
  const radius = 50;
  let pathData;

  if (fraction < 0.01) {
    pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z"; // nouvelle lune
  } else if (fraction > 0.99) {
    pathData = "M 0,0 L 0,0"; // pleine lune
  } else {
    const overlap = (1 - fraction) * radius;
    const dx = isWaxing ? overlap : -overlap;
    const x1 = centerX;
    const x2 = centerX + dx;

    pathData =
      "M " + x1 + "," + (centerY - radius) +
      " A " + radius + "," + radius + " 0 0,1 " + x1 + "," + (centerY + radius) +
      " A " + radius + "," + radius + " 0 0," + (isWaxing ? 1 : 0) + " " + x2 + "," + (centerY - radius) +
      " A " + radius + "," + radius + " 0 0,1 " + x2 + "," + (centerY + radius) +
      " A " + radius + "," + radius + " 0 0," + (isWaxing ? 0 : 1) + " " + x1 + "," + (centerY - radius) +
      " Z";
  }

  shadowPath.setAttribute("d", pathData);

  let phaseName = "";
  if (phase < 0.125) phaseName = "🌑 Nouvelle lune";
  else if (phase < 0.25) phaseName = "🌒 Croissant croissant";
  else if (phase < 0.375) phaseName = "🌓 Premier quartier";
  else if (phase < 0.5) phaseName = "🌔 Gibbeuse croissante";
  else if (phase < 0.625) phaseName = "🌕 Pleine lune";
  else if (phase < 0.75) phaseName = "🌖 Gibbeuse décroissante";
  else if (phase < 0.875) phaseName = "🌗 Dernier quartier";
  else phaseName = "🌘 Croissant décroissant";

  console.log(phaseName + " - Illumination=" + (fraction * 100).toFixed(1) + "% Phase=" + phase.toFixed(3));
}

export function updateNewMoonWidget() {
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = "svg-lune-widget";

  container.innerHTML =
    '<svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">' +
    '<defs>' +
    '<clipPath id="moon-clip">' +
    '<circle cx="50" cy="50" r="50"/>' +
    '</clipPath>' +
    '<mask id="moon-mask">' +
    '<rect width="100%" height="100%" fill="white"/>' +
    '<path id="shadow-path" fill="black"/>' +
    '</mask>' +
    '</defs>' +
    '<image href="/img/lune/lune-pleine.png" width="100%" height="100%" filter="brightness(0.4) opacity(0.15)" clip-path="url(#moon-clip)"/>' +
    '<image href="/img/lune/lune-pleine.png" width="100%" height="100%" mask="url(#moon-mask)" clip-path="url(#moon-clip)"/>' +
    '</svg>';

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

  container.addEventListener("click", function (e) {
    e.preventDefault();
    sizeIndex = (sizeIndex + 1) % sizes.length;
    applySize();
  });

  loadSunCalc(function () {
    updateMoon();
    setInterval(updateMoon, 3600000);
  });
}
