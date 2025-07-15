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
    const phase = moon.phase;
    const fraction = moon.fraction;
    const angle = moon.angle;
    const r = 100;

    // Détermination précise de l'orientation
    const isWaxing = phase <= 0.5;
    const illuminationDirection = Math.cos(angle);
    const cx = 100 + (isWaxing ? 1 : -1) * r * (1 - fraction) * illuminationDirection;

    container.innerHTML = `
      <svg id="svg-lune" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <!-- Filtre fantôme amélioré -->
          <filter id="lune-fantome" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="1.5" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.08"/>
            </feComponentTransfer>
            <feColorMatrix type="matrix"
              values="0.4 0 0 0 0
                      0 0.4 0 0 0
                      0 0 0.4 0 0
                      0 0 0 1 0"/>
          </filter>
          
          <!-- Masque avec bord légèrement adouci -->
          <mask id="mask-lune">
            <rect width="200" height="200" fill="white"/>
            <ellipse id="ombre" cx="${cx}" cy="100" rx="${r}" ry="${r}" fill="black">
              <animate attributeName="cx" values="${cx};${cx}" dur="1h" repeatCount="indefinite"/>
            </ellipse>
            <feGaussianBlur stdDeviation="0.8" result="blur"/>
          </mask>
        </defs>
        
        <!-- Lune fantôme en fond -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" filter="url(#lune-fantome)"/>
        
        <!-- Croissant lunaire précis -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" mask="url(#mask-lune)"
               filter="brightness(1.1) contrast(1.2) drop-shadow(0 0 2px rgba(255,255,255,0.4))"/>
      </svg>
    `;
  }

  applySize();
  renderMoon();
  setInterval(renderMoon, 60 * 60 * 1000);

  if (clickable) {
    container.style.cursor = "pointer";
    container.addEventListener("click", (e) => {
      e.preventDefault();
      sizeIndex = (sizeIndex + 1) % sizes.length;
      applySize();
    });
  }

  document.body.appendChild(container);
}
