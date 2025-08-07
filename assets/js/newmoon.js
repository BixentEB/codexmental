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
 * Met à jour la lune SVG avec la vraie forme des phases
 */
function updateMoon() {
  const now = new Date();
  const { fraction, phase } = SunCalc.getMoonIllumination(now);
  const shadowPath = document.getElementById("shadow-path");
  if (!shadowPath) return;

  let pathData;

  if (fraction < 0.01) {
    pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z"; // Nouvelle lune (complètement sombre)
  } else if (fraction > 0.99) {
    pathData = "M 0,0 L 0,0"; // Pleine lune (pas d'ombre)
  } else {
    const centerX = 50;
    const centerY = 50;
    const radius = 50;
    const isWaxing = phase < 0.5;
    
    // CORRECTION: Formule optimisée pour les phases gibbeuses
    const illuminationFactor = isWaxing ? fraction : 1 - fraction;
    const ellipseWidth = radius * 2 * (0.5 - Math.abs(illuminationFactor - 0.5));
    const absWidth = Math.max(1, Math.abs(ellipseWidth));
    const sweepFlag = isWaxing ? 1 : 0;

    pathData = `M ${centerX},${centerY - radius}
                A ${absWidth},${radius} 0 0,${sweepFlag} ${centerX},${centerY + radius}
                A ${radius},${radius} 0 0,${sweepFlag} ${centerX},${centerY - radius} Z`;
  }

  shadowPath.setAttribute("d", pathData);
  
  // Debug amélioré
  let phaseName = "";
  if (fraction < 0.01) phaseName = "🌑 Nouvelle lune";
  else if (fraction > 0.99) phaseName = "🌕 Pleine lune";
  else if (phase < 0.25) phaseName = "🌒 Croissant croissant";
  else if (phase < 0.5) phaseName = isWaxing ? "🌔 Gibbeuse croissante" : "🌖 Gibbeuse décroissante";
  else if (phase < 0.75) phaseName = "🌖 Gibbeuse décroissante";
  else phaseName = "🌘 Croissant décroissant";
  
  console.log(`${phaseName} - Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)}`);
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
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "1000";
  container.style.cursor = "pointer";
  
  // SVG avec masque basé sur path pour les vraies formes de phases
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
      
      <!-- Lune de base (sombre) avec texture -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" 
             filter="brightness(0.3) opacity(0.2)" clip-path="url(#moon-clip)"/>
      
      <!-- Lune éclairée (masquée par les ombres) avec halo -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" 
             mask="url(#moon-mask)" clip-path="url(#moon-clip)"
             style="filter: brightness(1.1) contrast(1.1);"/>
    </svg>
  `;
  
  document.body.appendChild(container);
  
  // Taille par défaut
  const sizes = [
    { w: "80px", h: "80px", class: "mini-lune" },
    { w: "150px", h: "150px", class: "" },
    { w: "250px", h: "250px", class: "super-lune" }
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

// Initialisation automatique si chargé directement
if (!window.moonWidgetInitialized) {
  window.moonWidgetInitialized = true;
  updateNewMoonWidget();
}
