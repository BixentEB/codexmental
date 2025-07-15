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

    // Calcul dynamique de l'ombre
    const isWaning = phase > 0.5;
    const illuminationDirection = Math.cos(angle) > 0 ? 1 : -1;
    const shadowWidth = r * 2 * (1 - fraction);
    const shadowPosition = 100 + (isWaning ? 1 : -1) * (r - shadowWidth/2) * illuminationDirection;

    container.innerHTML = `
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <!-- Filtre fantôme -->
          <filter id="lune-fantome">
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.08"/>
            </feComponentTransfer>
            <feColorMatrix values="0.4 0 0 0 0 0 0.4 0 0 0 0 0 0.4 0 0 0 0 0 1 0"/>
          </filter>

          <!-- Masque dynamique -->
          <mask id="mask-phase">
            <rect width="200" height="200" fill="white"/>
            <ellipse cx="${shadowPosition}" cy="100" rx="${shadowWidth/2}" ry="${r}" fill="black"/>
          </mask>
        </defs>

        <!-- Lune fantôme -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" filter="url(#lune-fantome)"/>

        <!-- Partie illuminée -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" mask="url(#mask-phase)" 
               filter="brightness(1.2) contrast(1.3)"/>
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
