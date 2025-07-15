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

  // Logique basée sur la PHASE (pas la fraction) pour avoir la bonne forme visuelle
  // Phase 0 = nouvelle lune, 0.25 = premier quartier, 0.5 = pleine lune, 0.75 = dernier quartier
  
  let cx;
  
  if (phase <= 0.5) {
    // Phase croissante (0 à 0.5) : de nouvelle lune à pleine lune
    // L'ombre recule de droite vers gauche
    cx = 100 - (phase * 2 * 50); // phase 0 → cx=100, phase 0.5 → cx=50
  } else {
    // Phase décroissante (0.5 à 1) : de pleine lune à nouvelle lune
    // L'ombre avance de gauche vers droite
    cx = 50 - ((phase - 0.5) * 2 * 50); // phase 0.5 → cx=50, phase 1 → cx=-50
  }
  
  // Limiter cx pour éviter les valeurs extrêmes
  cx = Math.max(-10, Math.min(110, cx));
  
  ombre.setAttribute("cx", cx);
  
  // Debug
  let phaseName = "";
  if (phase < 0.125) phaseName = "🌑 Nouvelle lune";
  else if (phase < 0.25) phaseName = "🌒 Croissant croissant";
  else if (phase < 0.375) phaseName = "🌓 Premier quartier";
  else if (phase < 0.5) phaseName = "🌔 Gibbeuse croissante";
  else if (phase < 0.625) phaseName = "🌕 Pleine lune";
  else if (phase < 0.75) phaseName = "🌖 Gibbeuse décroissante";
  else if (phase < 0.875) phaseName = "🌗 Dernier quartier";
  else phaseName = "🌘 Croissant décroissant";
  
  console.log(`${phaseName} - Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)} cx=${cx.toFixed(1)}`);
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
  
  // SVG avec un cercle d'ombre plus grand pour un effet plus net
  container.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <mask id="mask-lune">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="ombre" cx="50" cy="50" r="55" fill="black"/>
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
