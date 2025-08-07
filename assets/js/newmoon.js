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
  const centerX = 50;
  const centerY = 50;
  const radius = 50;

  if (fraction < 0.01) {
    pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z"; // Nouvelle lune
  } else if (fraction > 0.99) {
    pathData = "M 0,0 L 0,0"; // Pleine lune
  } else {
    const isWaxing = phase < 0.5;
    const illumination = isWaxing ? fraction : 1 - fraction;
    
    // NOUVELLE LOGIQUE DE CALCUL
    const angle = Math.PI * 2 * phase;
    const shadowWidth = radius * (1 - illumination);
    const startAngle = angle - Math.PI/2;
    const endAngle = angle + Math.PI/2;

    // Construction du chemin d'ombre
    const startX = centerX + Math.cos(startAngle) * radius;
    const startY = centerY + Math.sin(startAngle) * radius;
    const endX = centerX + Math.cos(endAngle) * radius;
    const endY = centerY + Math.sin(endAngle) * radius;

    pathData = `
      M ${centerX},${centerY}
      L ${startX},${startY}
      A ${radius},${radius} 0 0,1 ${endX},${endY}
      L ${centerX},${centerY}
      Z
      
      M ${centerX},${centerY}
      L ${endX},${endY}
      A ${radius},${radius} 0 0,1 ${startX},${startY}
      L ${centerX},${centerY}
      Z
    `;
  }

  shadowPath.setAttribute("d", pathData);
  console.log(`🌙 Phase=${phase.toFixed(3)} Illum=${(fraction*100).toFixed(1)}%`);
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
    <!-- ClipPath pour la forme circulaire -->
    <clipPath id="moon-clip">
      <circle cx="50" cy="50" r="50"/>
    </clipPath>
    
    <!-- Masque inversé plus précis -->
    <mask id="moon-mask">
      <rect width="100%" height="100%" fill="white"/>
      <!-- Ombre dynamique avec flou pour un rendu naturel -->
      <path id="shadow-path" fill="black" filter="url(#shadow-filter)"/>
    </mask>
    
    <filter id="shadow-filter">
      <feGaussianBlur stdDeviation="0.5" edgeMode="none"/>
    </filter>
  </defs>
  
  <!-- Couche unique avec texture -->
  <image href="/img/lune/lune-pleine.png" width="100%" height="100%"
         mask="url(#moon-mask)" clip-path="url(#moon-clip)"
         style="filter: brightness(1.15);"/>
</svg>`;
  
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
