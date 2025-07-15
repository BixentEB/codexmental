// newmoon.js

/**
 * Charge SunCalc depuis CDN si non présent
 */
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

/**
 * Met à jour la lune SVG
 */
function updateMoon() {
  const now = new Date();
  const { fraction, phase } = SunCalc.getMoonIllumination(now);

  const ombre = document.getElementById("ombre");
  if (!ombre) return;

  // Calcul offset progressif
  const offset = (1 - fraction) * 50;

  // Logique corrigée :
  // 0–0.5 = croissante (ombre à gauche)
  // 0.5–1 = décroissante (ombre à droite)
  let cx;
  if (phase < 0.5) {
    // Croissante => ombre à gauche
    cx = 50 - offset;
  } else {
    // Décroissante => ombre à droite
    cx = 50 + offset;
  }

  ombre.setAttribute("cx", cx);

  console.log(`🌙 Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)} cx=${cx.toFixed(1)}`);
}

/**
 * Crée le widget lune et l'injecte dans la page
 */
export function updateNewMoonWidget() {
  // Supprimer l'existant si besoin
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();

  // Conteneur
  const container = document.createElement("div");
  container.id = "svg-lune-widget";

  // SVG
  container.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <mask id="mask-lune">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" filter="brightness(0.4) opacity(0.15)"/>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" mask="url(#mask-lune)"/>
    </svg>
  `;

  document.body.appendChild(container);

  // Taille par défaut
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

  // Charger SunCalc et lancer les updates
  loadSunCalc(() => {
    updateMoon();
    setInterval(updateMoon, 3600000);
  });
}
