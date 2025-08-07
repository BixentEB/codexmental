// newmoon.js - VERSION COMPLÈTE CORRIGÉE
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

  // Angle de phase (0 = nouvelle lune, Math.PI = pleine lune)
  const angle = phase * 2 * Math.PI;
  
  let pathData;
  if (fraction < 0.01) {
    pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z"; // Nouvelle lune
  } else if (fraction > 0.99) {
    pathData = ""; // Pleine lune (pas d'ombre)
  } else {
    const isWaxing = phase < 0.5;
    const terminatorX = 50 + 50 * Math.cos(angle);
    const terminatorY = 50 + 50 * Math.sin(angle);
    const sweepFlag = isWaxing ? 0 : 1;

    pathData = `M ${terminatorX},${terminatorY}
                A 50,50 0 ${fraction > 0.5 ? 1 : 0},${sweepFlag} ${100 - terminatorX},${100 - terminatorY}
                A 50,50 0 ${fraction > 0.5 ? 1 : 0},${sweepFlag} ${terminatorX},${terminatorY} Z`;
  }
  
  shadowPath.setAttribute("d", pathData);
}

/**
 * Crée le widget lune
 */
export function updateNewMoonWidget() {
  // Supprimer l'existant si besoin
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();
  
  // Conteneur
  const container = document.createElement("div");
  container.id = "svg-lune-widget";
  container.style.width = "200px";
  container.style.height = "200px";
  
  // SVG avec masque
  container.innerHTML = `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <mask id="moon-mask">
          <rect x="0" y="0" width="100" height="100" fill="white"/>
          <path id="shadow-path" fill="black" d="M0,0 L100,0 L100,100 L0,100 Z"/>
        </mask>
      </defs>
      
      <!-- Cercle de base (partie éclairée) -->
      <circle cx="50" cy="50" r="50" fill="#F5F3CE" mask="url(#moon-mask)"/>
      
      <!-- Option : texture lunaire si disponible -->
      <image href="/img/lune/lune-pleine.png" width="100" height="100" 
             mask="url(#moon-mask)" opacity="0.8" crossorigin="anonymous"/>
    </svg>
  `;
  
  document.body.appendChild(container);
  
  // Charger SunCalc
  loadSunCalc(() => {
    updateMoon();
    setInterval(updateMoon, 60000); // Mise à jour toutes les minutes
  });
}
