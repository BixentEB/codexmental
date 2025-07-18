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

  const centerX = 50;
  const centerY = 50;
  const radius = 50;
  let pathData;

  if (fraction < 0.01) {
    // Nouvelle lune
    pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z";
  } else if (fraction > 0.99) {
    // Pleine lune
    pathData = "M 0,0 L 0,0";
  } else {
    const isWaxing = phase < 0.5;
    const ellipseWidth = isWaxing 
      ? radius * (1 - 2 * fraction) 
      : radius * (2 * fraction - 1);
    
    const absWidth = Math.max(5, Math.abs(ellipseWidth));
    const sweepFlag = ellipseWidth > 0 ? 1 : 0;

    pathData = `M ${centerX},${centerY - radius}
                A ${absWidth},${radius} 0 0,${sweepFlag} ${centerX},${centerY + radius}
                A ${radius},${radius} 0 0,${sweepFlag} ${centerX},${centerY - radius} Z`;
  }

  shadowPath.setAttribute("d", pathData);
  shadowPath.setAttribute("stroke", "rgba(255,255,255,0.2)");
  shadowPath.setAttribute("stroke-width", "0.5");
}

/**
 * Crée le widget lune avec halo et texture
 */
export function updateNewMoonWidget() {
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();
  
  const container = document.createElement("div");
  container.id = "svg-lune-widget";
  
  container.innerHTML = `
  <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
    <defs>
      <clipPath id="moon-clip">
        <circle cx="50" cy="50" r="50"/>
      </clipPath>
      
      <!-- Ajout d'un filtre de lumière pour l'arc -->
      <filter id="moonEdgeGlow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="0.5" result="blur"/>
        <feComposite in="SourceGraphic" in2="blur" operator="over"/>
      </filter>
      
      <mask id="moon-mask">
        <rect width="100%" height="100%" fill="white"/>
        <path id="shadow-path" fill="black"/>
      </mask>
    </defs>
    
    <!-- Lune fantôme (inchangée) -->
    <image href="/img/lune/lune-pleine.png" width="100%" height="100%" 
           filter="brightness(0.4) opacity(0.15)" clip-path="url(#moon-clip)"/>
    
    <!-- Lune éclairée avec bord lumineux -->
    <g mask="url(#moon-mask)" clip-path="url(#moon-clip)">
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" 
             filter="brightness(1.1)"/>
      <!-- Arc éclairé (seule nouveauté) -->
      <path id="shadow-path" fill="none" stroke="rgba(255,255,255,0.3)" 
            stroke-width="0.8" filter="url(#moonEdgeGlow)"/>
    </g>
  </svg>
`;
  
  document.body.appendChild(container);

  // Gestion des tailles (votre code existant)
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
  
  // Charger SunCalc
  loadSunCalc(() => {
    updateMoon();
    setInterval(updateMoon, 3600000);
  });
}
