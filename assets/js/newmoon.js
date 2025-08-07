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
    // Nouvelle lune - tout sombre
    pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z";
  } else if (fraction > 0.99) {
    // Pleine lune - tout éclairé
    pathData = "M 0,0 L 0,0"; // Chemin vide
  } else {
    // Phases intermédiaires - créer la terminaison elliptique
    const centerX = 50;
    const centerY = 50;
    const radius = 50;
    
    // Calculer l'ellipse de la terminaison
    const isWaxing = phase < 0.5;
    
    // Pour la largeur de l'ellipse, on utilise le cosinus de l'angle de phase
    // fraction = 0.5 correspond à un quartier (ellipse plate)
    // fraction proche de 0 ou 1 correspond à des ellipses très incurvées
    const ellipseWidth = radius * Math.cos(2 * Math.PI * (fraction - 0.5));
    
    const absWidth = Math.abs(ellipseWidth);
    
    if (isWaxing) {
      // Phase croissante : l'ombre est à gauche, partie éclairée à droite
      if (ellipseWidth >= 0) {
        // Ellipse convexe vers la droite (croissant)
        pathData = `M 0,0 L 0,100 
                    L ${centerX},100
                    A ${absWidth},${radius} 0 0,1 ${centerX},0
                    L 0,0 Z`;
      } else {
        // Ellipse concave vers la droite (gibbeuse croissante)
        pathData = `M 0,0 L 0,100 
                    L ${centerX},100
                    A ${absWidth},${radius} 0 0,0 ${centerX},0
                    L 0,0 Z`;
      }
    } else {
      // Phase décroissante : l'ombre est à droite, partie éclairée à gauche
      if (ellipseWidth >= 0) {
        // Ellipse convexe vers la gauche (gibbeuse décroissante)
        pathData = `M ${centerX},0
                    A ${absWidth},${radius} 0 0,1 ${centerX},100
                    L 100,100 L 100,0 Z`;
      } else {
        // Ellipse concave vers la gauche (croissant décroissant)
        pathData = `M ${centerX},0
                    A ${absWidth},${radius} 0 0,0 ${centerX},100
                    L 100,100 L 100,0 Z`;
      }
    }
  }
  
  shadowPath.setAttribute("d", pathData);
  
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
  
  console.log(`${phaseName} - Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)} EllipseWidth=${ellipseWidth.toFixed(2)}`);
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
      
      <!-- Lune de base (sombre) -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" 
             filter="brightness(0.4) opacity(0.15)" clip-path="url(#moon-clip)"/>
      
      <!-- Lune éclairée (masquée par les ombres) -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" 
             mask="url(#moon-mask)" clip-path="url(#moon-clip)"/>
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
