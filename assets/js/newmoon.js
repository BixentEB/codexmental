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
 * Met à jour la lune SVG avec la vraie forme des phases (version astronomiquement exacte)
 */
function updateMoon() {
  const now = new Date();
  const { fraction, phase } = SunCalc.getMoonIllumination(now);
  const shadowPath = document.getElementById("shadow-path");
  if (!shadowPath) return;

  // Angle de phase (0 = nouvelle lune, Math.PI = pleine lune)
  const angle = phase * 2 * Math.PI;
  
  // Calcul de la position du terminateur (ligne jour/nuit)
  let pathData;
  
  if (fraction < 0.01) {
    // Nouvelle lune - tout sombre
    pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z";
  } else if (fraction > 0.99) {
    // Pleine lune - tout éclairé
    pathData = "M 0,0 L 0,0"; // Chemin vide
  } else {
    // Phases intermédiaires - calcul précis du terminateur
    const isWaxing = phase < 0.5;
    const terminatorX = 50 + 50 * Math.cos(angle);
    const terminatorY = 50 + 50 * Math.sin(angle);
    const sweepFlag = isWaxing ? 0 : 1;

    pathData = `M ${terminatorX},${terminatorY}
                A 50,50 0 ${fraction > 0.5 ? 1 : 0},${sweepFlag} ${100 - terminatorX},${100 - terminatorY}
                A 50,50 0 ${fraction > 0.5 ? 1 : 0},${sweepFlag} ${terminatorX},${terminatorY} Z`;
  }
  
  shadowPath.setAttribute("d", pathData);
  
  // Debug (optionnel)
  const phaseNames = [
    "🌑 Nouvelle lune", "🌒 Croissant croissant", "🌓 Premier quartier", 
    "🌔 Gibbeuse croissante", "🌕 Pleine lune", "🌖 Gibbeuse décroissante",
    "🌗 Dernier quartier", "🌘 Croissant décroissant"
  ];
  const phaseIndex = Math.floor(phase * 8) % 8;
  console.log(`${phaseNames[phaseIndex]} - Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)}`);
}

/**
 * Crée le widget lune (inchangé)
 */
export function updateNewMoonWidget() {
  // Supprimer l'existant si besoin
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();
  
  // Conteneur
  const container = document.createElement("div");
  container.id = "svg-lune-widget";
  
  // SVG avec masque basé sur path pour les vraies formes de phases
  // Remplacez la partie innerHTML du conteneur par ceci :
container.innerHTML = `
  <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <clipPath id="moon-clip">
        <circle cx="50" cy="50" r="50"/>
      </clipPath>
      <mask id="moon-mask">
        <rect x="0" y="0" width="100" height="100" fill="white"/>
        <path id="shadow-path" fill="black" d="M 0,0 L 100,0 L 100,100 L 0,100 Z"/>
      </mask>
    </defs>
    
    <!-- Fond sombre (toujours visible) -->
    <circle cx="50" cy="50" r="50" fill="#222" opacity="0.2"/>
    
    <!-- Partie éclairée (masquée dynamiquement) -->
    <circle cx="50" cy="50" r="50" fill="white" mask="url(#moon-mask)"/>
    
    <!-- Texture lunaire optionnelle -->
    <image href="/img/lune/lune-pleine.png" width="100" height="100" 
           mask="url(#moon-mask)" clip-path="url(#moon-clip)" opacity="0.9"/>
  </svg>
`;
  
  document.body.appendChild(container);
  
  // Gestion des tailles (inchangé)
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
    setInterval(updateMoon, 3600000); // Mise à jour toutes les heures
  });
}
