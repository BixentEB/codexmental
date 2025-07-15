export function updateNewMoonWidget(SunCalc) {
  console.log("✅ newmoon.js launched with SunCalc - Version corrigée");

  if (!document.body.classList.contains("theme-lunaire")) {
    return;
  }

  // Remove any existing widget
  const existing = document.getElementById('svg-lune-widget');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'svg-lune-widget';

  container.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <filter id="lune-fantome">
          <feGaussianBlur stdDeviation="0.5"/>
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.12"/>
          </feComponentTransfer>
          <feColorMatrix type="matrix"
            values="0.35 0.35 0.55 0 0
                    0.35 0.35 0.55 0 0
                    0.45 0.45 0.65 0 0
                    0 0 0 1 0"/>
        </filter>
        <mask id="mask-lune">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <!-- Lune fantôme (arrière-plan) -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" filter="url(#lune-fantome)"/>
      <!-- Lune visible selon phase -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" mask="url(#mask-lune)"/>
    </svg>
  `;

  document.body.appendChild(container);

  // Size cycle on click (responsive géré par CSS)
  const sizes = [
    { w: "150px", h: "150px", class: "" },
    { w: "250px", h: "250px", class: "" },
    { w: "500px", h: "500px", class: "super-lune" }
  ];
  let sizeIndex = 1; // Start medium

  function applySize() {
    const isMobile = window.innerWidth <= 568 || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    const isTablet = window.innerWidth > 568 && window.innerWidth <= 1024;
    
    if (isMobile) {
      // Mobile : une seule taille, pas de clic
      container.style.width = "180px";
      container.style.height = "180px";
      container.classList.remove("super-lune");
      return;
    }
    
    if (isTablet && sizeIndex === 2) {
      // Tablette : skip super-lune
      sizeIndex = 0;
    }
    
    container.style.width = sizes[sizeIndex].w;
    container.style.height = sizes[sizeIndex].h;
    container.classList.remove("super-lune");
    if (sizes[sizeIndex].class) {
      container.classList.add(sizes[sizeIndex].class);
    }
  }
  
  applySize();

  container.addEventListener("click", (e) => {
    e.preventDefault();
    const isMobile = window.innerWidth <= 568 || (window.matchMedia && window.matchMedia("(pointer: coarse)").matches);
    if (isMobile) return; // Pas de clic sur mobile
    
    sizeIndex = (sizeIndex + 1) % sizes.length;
    applySize();
  });

  // Fonction pour calculer la phase lunaire correctement
  function calculateLunarPhase() {
    const now = new Date();
    const illumination = SunCalc.getMoonIllumination(now);
    
    // Informations détaillées
    const fraction = illumination.fraction; // 0 à 1
    const phase = illumination.phase; // 0 à 1
    const angle = illumination.angle; // angle en radians
    
    // Calcul du pourcentage d'illumination
    const illuminationPercent = fraction * 100;
    
    // Détermination de la phase
    let phaseName;
    let isWaxing = false;
    
    if (phase < 0.125) {
      phaseName = "Nouvelle lune";
      isWaxing = true;
    } else if (phase < 0.25) {
      phaseName = "Premier croissant";
      isWaxing = true;
    } else if (phase < 0.375) {
      phaseName = "Premier quartier";
      isWaxing = true;
    } else if (phase < 0.5) {
      phaseName = "Gibbeuse croissante";
      isWaxing = true;
    } else if (phase < 0.625) {
      phaseName = "Pleine lune";
      isWaxing = false;
    } else if (phase < 0.75) {
      phaseName = "Gibbeuse décroissante";
      isWaxing = false;
    } else if (phase < 0.875) {
      phaseName = "Dernier quartier";
      isWaxing = false;
    } else {
      phaseName = "Dernier croissant";
      isWaxing = false;
    }
    
    return {
      fraction,
      phase,
      angle,
      illuminationPercent,
      phaseName,
      isWaxing
    };
  }

  // Update moon phase using corrected logic
  function updatePhase() {
    const ombre = document.getElementById('ombre');
    if (!ombre) return;

    const lunarData = calculateLunarPhase();
    const { fraction, phase, illuminationPercent, phaseName, isWaxing } = lunarData;
    
    console.log(`🌙 Phase: ${phaseName} | Illumination: ${illuminationPercent.toFixed(1)}% | Croissante: ${isWaxing}`);
    
    let cx;
    
    // Logique corrigée pour l'orientation
    if (illuminationPercent <= 2) {
      // Nouvelle lune - complètement masquée
      cx = 50;
    } else if (illuminationPercent >= 98) {
      // Pleine lune - pas de masque
      cx = isWaxing ? -50 : 150;
    } else {
      // Calcul de la position de l'ombre selon la phase
      const shadowPosition = (1 - fraction) * 100; // Position inversée
      
      if (isWaxing) {
        // Lune croissante : ombre part de la droite vers la gauche
        cx = 50 + (shadowPosition / 2);
      } else {
        // Lune décroissante : ombre part de la gauche vers la droite
        cx = 50 - (shadowPosition / 2);
      }
      
      // Limitation des valeurs extrêmes
      cx = Math.max(-50, Math.min(150, cx));
    }
    
    ombre.setAttribute('cx', cx);
    
    // Log pour debug
    console.log(`🌙 cx=${cx.toFixed(1)} | Phase=${phase.toFixed(3)} | Fraction=${fraction.toFixed(3)}`);
  }

  // Mise à jour initiale
  updatePhase();
  
  // Mise à jour toutes les heures
  setInterval(updatePhase, 3600000);
  
  // Mise à jour au resize pour responsive
  window.addEventListener('resize', applySize);
}
