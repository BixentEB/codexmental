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
    // Pleine lune - tout éclairé (pas d'ombre)
    pathData = "M 0,0 L 0,0"; // Chemin vide
  } else {
    // Phases intermédiaires
    const centerX = 50;
    const centerY = 50;
    const radius = 50;
    
    // Déterminer si on est en phase croissante ou décroissante
    const isWaxing = phase < 0.5;
    
    // Calculer la largeur de l'ellipse de la terminaison
    // fraction = 0.5 -> ellipse plate (premier/dernier quartier)
    // fraction proche de 0 ou 1 -> ellipse très étroite ou très large
    
    let ellipseWidth;
    if (isWaxing) {
      // Phase croissante (0 -> 0.5) : de nouvelle lune à pleine lune
      // L'ombre diminue de gauche à droite
      ellipseWidth = radius * Math.cos(Math.PI * fraction);
    } else {
      // Phase décroissante (0.5 -> 1) : de pleine lune à nouvelle lune
      // L'ombre augmente de droite à gauche
      ellipseWidth = -radius * Math.cos(Math.PI * fraction);
    }
    
    const absWidth = Math.abs(ellipseWidth);
    
    if (isWaxing) {
      // Phase croissante : ombre à gauche
      if (fraction < 0.5) {
        // Premier quartier approchant : ombre à gauche, terminaison convexe vers la droite
        const sweepFlag = ellipseWidth >= 0 ? 1 : 0;
        pathData = `M 0,0 L 0,100 
                    L ${centerX - absWidth},100
                    A ${absWidth},${radius} 0 0,${sweepFlag} ${centerX - absWidth},0
                    L 0,0 Z`;
      } else {
        // Gibbeuse croissante : petite ombre à gauche
        const sweepFlag = 1;
        pathData = `M 0,0 L 0,100
                    L ${centerX + absWidth},100
                    A ${absWidth},${radius} 0 0,${sweepFlag} ${centerX + absWidth},0
                    L 0,0 Z`;
      }
    } else {
      // Phase décroissante : ombre à droite
      if (fraction > 0.5) {
        // Gibbeuse décroissante : petite ombre à droite
        const sweepFlag = 0;
        pathData = `M ${centerX - absWidth},0
                    A ${absWidth},${radius} 0 0,${sweepFlag} ${centerX - absWidth},100
                    L 100,100 L 100,0 Z`;
      } else {
        // Dernier quartier approchant : ombre à droite, terminaison convexe vers la gauche
        const sweepFlag = ellipseWidth >= 0 ? 0 : 1;
        pathData = `M ${centerX + absWidth},0
                    A ${absWidth},${radius} 0 0,${sweepFlag} ${centerX + absWidth},100
                    L 100,100 L 100,0 Z`;
      }
    }
  }
  
  shadowPath.setAttribute("d", pathData);
  
  // Debug amélioré
  let phaseName = "";
  if (fraction < 0.01) phaseName = "🌑 Nouvelle lune";
  else if (phase < 0.25) phaseName = "🌒 Croissant croissant";
  else if (Math.abs(phase - 0.25) < 0.05) phaseName = "🌓 Premier quartier";
  else if (phase < 0.5) phaseName = "🌔 Gibbeuse croissante";
  else if (fraction > 0.99) phaseName = "🌕 Pleine lune";
  else if (phase < 0.75) phaseName = "🌖 Gibbeuse décroissante";
  else if (Math.abs(phase - 0.75) < 0.05) phaseName = "🌗 Dernier quartier";
  else phaseName = "🌘 Croissant décroissant";
  
  console.log(`${phaseName} - Illumination=${(fraction * 100).toFixed(1)}% Phase=${phase.toFixed(3)} ${isWaxing ? '(croissante)' : '(décroissante)'}`);
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
