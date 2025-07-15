import SunCalc from 'https://esm.sh/suncalc';

const LAT = 45.75; // Lyon
const LNG = 4.85;

function getSizeConfig() {
  const isMobile = window.matchMedia("(max-width: 568px), (pointer: coarse)").matches;
  const isTablet = window.matchMedia("(max-width: 900px) and (pointer: fine)").matches;
  
  if (isMobile) return { sizes: [{ w: "180px", h: "180px", class: "" }], clickable: false };
  if (isTablet) return { sizes: [{ w: "250px", h: "250px", class: "" }, { w: "350px", h: "350px", class: "" }], clickable: true };
  
  return { 
    sizes: [
      { w: "250px", h: "250px", class: "" },
      { w: "350px", h: "350px", class: "" },
      { w: "500px", h: "500px", class: "super-lune" }
    ], 
    clickable: true 
  };
}

export function updateNewMoonWidget() {
  const existing = document.getElementById('svg-lune-widget');
  if (existing) existing.remove();

  const { sizes, clickable } = getSizeConfig();
  let sizeIndex = 0;

  const container = document.createElement('div');
  container.id = 'svg-lune-widget';

  function applySize() {
    container.style.width = sizes[sizeIndex].w;
    container.style.height = sizes[sizeIndex].h;
    container.className = sizes[sizeIndex].class || '';
  }

  function renderMoon() {
    const now = new Date();
    const moon = SunCalc.getMoonIllumination(now);
    const fraction = moon.fraction;
    const phase = moon.phase;
    const angle = moon.angle;
    const r = 100;

    // 1. Calcul de la forme concave
    const isWaning = phase > 0.5;
    const visibleWidth = 200 * fraction;
    const shadowWidth = 200 * (1 - fraction);
    const startX = isWaning ? 200 : 0;

    // 2. Path SVG pour le croissant obscur (forme concave)
    const maskPath = `
      M ${startX},100
      A ${r},${r} 0 1,${isWaning ? 1 : 0} ${startX},99.9
      L ${startX + (isWaning ? -visibleWidth : visibleWidth)},100
      A ${shadowWidth/2},${r} 0 1,${isWaning ? 0 : 1} ${startX},100
      Z
    `;

    container.innerHTML = `
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <!-- Filtre fantôme -->
          <filter id="ghost-filter">
            <feGaussianBlur stdDeviation="1.5"/>
            <feColorMatrix values="0.4 0 0 0 0 0 0.4 0 0 0 0 0 0.4 0 0 0 0 0 0.12 0"/>
          </filter>

          <!-- Masque concave -->
          <mask id="moon-mask">
            <rect width="200" height="200" fill="white"/>
            <path d="${maskPath}" fill="black" transform="rotate(${-angle * (180/Math.PI)} 100 100)"/>
          </mask>
        </defs>

        <!-- Lune fantôme -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" filter="url(#ghost-filter)"/>

        <!-- Lune illuminée -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" mask="url(#moon-mask)"
               filter="brightness(1.15) contrast(1.3) drop-shadow(0 0 3px rgba(255,255,255,0.5))"/>
      </svg>
    `;
  }

  applySize();
  renderMoon();
  setInterval(renderMoon, 3600000); // Mise à jour horaire

  if (clickable) {
    container.style.cursor = "pointer";
    container.addEventListener("click", () => {
      sizeIndex = (sizeIndex + 1) % sizes.length;
      applySize();
    });
  }

  document.body.appendChild(container);
}
