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
    pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z";
  } else if (fraction > 0.99) {
    pathData = "M 0,0 L 0,0"; 
  } else {
    const centerX = 50;
    const centerY = 50;
    const radius = 50;
    const isWaxing = phase < 0.5;
    
    // NOUVELLE FORMULE CORRECTE
    const illuminationFactor = isWaxing ? fraction : 1 - fraction;
    const ellipseWidth = radius * 2 * (illuminationFactor - 0.5);
    const absWidth = Math.max(1, Math.abs(ellipseWidth));
    const sweepFlag = isWaxing ? 1 : 0;

    pathData = `M ${centerX},${centerY - radius}
                A ${absWidth},${radius} 0 0,${sweepFlag} ${centerX},${centerY + radius}
                A ${radius},${radius} 0 0,${sweepFlag} ${centerX},${centerY - radius} Z`;
  }

  shadowPath.setAttribute("d", pathData);
  console.log(`🌙 Phase=${phase.toFixed(3)} Illum=${(fraction*100).toFixed(1)}% Path=${pathData}`);
}
  

/**
 * Crée le widget lune et l'injecte dans la page
 */
export function updateNewMoonWidget() {
  // Supprimer l'existant si besoin
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();
  
  // Conteneur (position fixed par défaut)
  const container = document.createElement("div");
  container.id = "svg-lune-widget";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "1000";
  container.style.cursor = "pointer";
  
  // SVG avec masque lunaire
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
      
      <!-- Couche sombre -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" 
             filter="brightness(0.3)" clip-path="url(#moon-clip)"/>
      
      <!-- Couche éclairée (masquée dynamiquement) -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" 
             mask="url(#moon-mask)" clip-path="url(#moon-clip)"
             style="filter: brightness(1.2);"/>
    </svg>
  `;
  
  document.body.appendChild(container);
  
  // TAILLES ORIGINALES CONSERVÉES (comme demandé)
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
  
  // Clic pour changer la taille (cycle 150px → 250px → 500px)
  container.addEventListener("click", (e) => {
    e.preventDefault();
    sizeIndex = (sizeIndex + 1) % sizes.length;
    applySize();
  });
  
  // Chargement et mise à jour automatique
  loadSunCalc(() => {
    updateMoon();
    setInterval(updateMoon, 3600000); // Actualisation horaire
  });
}

// Auto-init
if (!window.moonWidgetInitialized) {
  window.moonWidgetInitialized = true;
  updateNewMoonWidget();
}
