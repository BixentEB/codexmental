import SunCalc from 'https://esm.sh/suncalc';

const LAT = 45.75; // Lyon
const LNG = 4.85;

function getSizeConfig() {
  const isMobile = window.matchMedia("(max-width: 568px), (pointer: coarse)").matches;
  const isTablet = window.matchMedia("(max-width: 900px) and (pointer: fine)").matches;
  
  return {
    sizes: isMobile 
      ? [{ w: "180px", h: "180px", class: "" }] 
      : isTablet
      ? [{ w: "250px", h: "250px", class: "" }, { w: "350px", h: "350px", class: "" }]
      : [
          { w: "250px", h: "250px", class: "" },
          { w: "350px", h: "350px", class: "" },
          { w: "500px", h: "500px", class: "super-lune" }
        ],
    clickable: !isMobile
  };
}

export function updateNewMoonWidget(SunCalc = window.SunCalc) {
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
    const moon = SunCalc.getMoonIllumination(new Date());
    const isWaning = moon.phase > 0.5;
    const illuminationWidth = 200 * moon.fraction;
    const shadowWidth = 200 * (1 - moon.fraction);

    container.innerHTML = `
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="ghost-filter">
            <feGaussianBlur stdDeviation="2"/>
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.1"/>
            </feComponentTransfer>
          </filter>
          <mask id="moon-mask">
            <rect width="200" height="200" fill="white"/>
            <path d="
              M ${isWaning ? 200 : 0},100
              A 100,100 0 1,${isWaning ? 1 : 0} ${isWaning ? 200 : 0},99.9
              L ${isWaning ? 200 - illuminationWidth : illuminationWidth},100
              A ${shadowWidth/2},100 0 1,${isWaning ? 0 : 1} ${isWaning ? 200 : 0},100
              Z"
              fill="black"
              transform="rotate(${-moon.angle * (180/Math.PI)} 100 100)"
            />
          </mask>
        </defs>
        <circle cx="100" cy="100" r="100" filter="url(#ghost-filter)" fill="white"/>
        <circle cx="100" cy="100" r="100" mask="url(#moon-mask)" fill="white" filter="brightness(1.15)"/>
      </svg>
    `;
  }

  applySize();
  renderMoon();
  setInterval(renderMoon, 3600000);

  if (clickable) {
    container.addEventListener("click", () => {
      sizeIndex = (sizeIndex + 1) % sizes.length;
      applySize();
    });
  }

  document.body.appendChild(container);
}

// Fallback global
window.MoonWidget = { update: updateNewMoonWidget };
