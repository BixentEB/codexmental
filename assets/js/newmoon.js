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

  let cx;
  
  // Phase 0 = nouvelle lune, 0.5 = pleine lune, 1 = nouvelle lune
  if (phase < 0.5) {
    // Lune croissante (0 -> 0.5)
    // L'ombre recule progressivement vers la gauche
    // À phase=0 (nouvelle lune): ombre complètement à droite (cx=50, couvre tout)
    // À phase=0.5 (pleine lune): ombre complètement à gauche (cx=0, ne couvre rien)
    cx = 50 - (phase * 100);
  } else {
    // Lune décroissante (0.5 -> 1)
    // L'ombre avance progressivement vers la droite
    // À phase=0.5 (pleine lune): ombre complètement à gauche (cx=0, ne couvre rien)
    // À phase=1 (nouvelle lune): ombre complètement à droite (cx=50, couvre tout)
    cx = (phase - 0.5) * 100;
  }

  ombre.setAttribute("cx", cx);
  
  // Debug amélioré
  const phaseNames = {
    0: "Nouvelle lune",
    0.25: "Premier quartier",
    0.5: "Pleine lune", 
    0.75: "Dernier quartier"
  };
  
  let phaseName = "Phase intermédiaire";
  if (phase < 0.25) phaseName = "Croissant croissant";
  else if (phase < 0.5) phaseName = "Gibbeuse croissante";
  else if (phase < 0.75) phaseName = "Gibbeuse décroissante";
  else phaseName = "Croissant décroissant";
  
  console.log(`🌙 ${phaseName} - Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)} cx=${cx.toFixed(1)}`);
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
