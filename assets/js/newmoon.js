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
 * Met à jour la lune SVG avec une ellipse pour un rendu plus réaliste
 */
function updateMoon() {
  const now = new Date();
  const { fraction, phase } = SunCalc.getMoonIllumination(now);
  const ombre = document.getElementById("ombre");
  if (!ombre) return;

  // Calculer la position de l'ellipse du terminateur
  let rx, cx;
  
  if (phase < 0.5) {
    // Lune croissante : terminateur se déplace de droite vers gauche
    // fraction 0 -> 0.5 : ellipse très étroite à droite -> cercle complet
    rx = 50 * (2 * fraction); // largeur de l'ellipse
    cx = 50 + (50 - rx); // position X du centre
  } else {
    // Lune décroissante : terminateur se déplace de gauche vers droite  
    // fraction 0.5 -> 0 : cercle complet -> ellipse très étroite à droite
    rx = 50 * (2 * fraction); // largeur de l'ellipse
    cx = 50 - (50 - rx); // position X du centre
  }
  
  // Transformer le cercle en ellipse
  ombre.setAttribute("cx", cx);
  ombre.setAttribute("rx", rx);
  ombre.setAttribute("ry", 50);
  
  // Debug amélioré
  let phaseName = "";
  if (phase < 0.125) phaseName = "Nouvelle lune";
  else if (phase < 0.25) phaseName = "Croissant croissant";
  else if (phase < 0.375) phaseName = "Premier quartier";
  else if (phase < 0.5) phaseName = "Gibbeuse croissante";
  else if (phase < 0.625) phaseName = "Pleine lune";
  else if (phase < 0.75) phaseName = "Gibbeuse décroissante";
  else if (phase < 0.875) phaseName = "Dernier quartier";
  else phaseName = "Croissant décroissant";
  
  console.log(`🌙 ${phaseName} - Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)} cx=${cx.toFixed(1)} rx=${rx.toFixed(1)}`);
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
  
  // SVG avec ellipse au lieu d'un cercle
  container.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <mask id="mask-lune">
          <rect width="100%" height="100%" fill="white"/>
          <ellipse id="ombre" cx="50" cy="50" rx="50" ry="50" fill="black"/>
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
