import SunCalc from 'https://esm.sh/suncalc';

const MOON_SIZES = {
  mobile: { width: '180px', height: '180px' },
  tablet: [
    { width: '250px', height: '250px' },
    { width: '350px', height: '350px' }
  ],
  desktop: [
    { width: '250px', height: '250px' },
    { width: '350px', height: '350px' },
    { width: '500px', height: '500px', class: 'super-lune' }
  ]
};

function getMoonConfig() {
  if (window.matchMedia("(max-width: 568px), (pointer: coarse)").matches) {
    return { ...MOON_SIZES.mobile, clickable: false };
  }
  if (window.matchMedia("(max-width: 900px) and (pointer: fine)").matches) {
    return { sizes: MOON_SIZES.tablet, clickable: true };
  }
  return { sizes: MOON_SIZES.desktop, clickable: true };
}

export function updateNewMoonWidget() {
  // Suppression de l'ancien widget
  const oldWidget = document.getElementById('moon-widget-container');
  if (oldWidget) oldWidget.remove();

  const { sizes, clickable } = getMoonConfig();
  let currentSize = 0;

  // Création du container
  const container = document.createElement('div');
  container.id = 'moon-widget-container';
  container.style.position = 'fixed';
  container.style.right = '20px';
  container.style.bottom = '20px';
  container.style.zIndex = '1000';
  container.style.borderRadius = '50%';
  container.style.overflow = 'hidden';

  function updateSize() {
    const size = Array.isArray(sizes) ? sizes[currentSize] : sizes;
    container.style.width = size.width;
    container.style.height = size.height;
    if (size.class) container.className = size.class;
  }

  function renderMoon() {
    const moonData = SunCalc.getMoonIllumination(new Date());
    const isWaning = moonData.phase > 0.5;
    const illumination = moonData.fraction * 200;
    const shadow = 200 - illumination;

    container.innerHTML = `
      <svg viewBox="0 0 200 200" width="100%" height="100%" style="display: block;">
        <defs>
          <filter id="moon-ghost">
            <feGaussianBlur stdDeviation="2" />
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.08" />
            </feComponentTransfer>
          </filter>
          <mask id="moon-mask">
            <rect width="200" height="200" fill="white" />
            <path d="
              M ${isWaning ? 200 : 0},100
              A 100,100 0 1,${isWaning ? 1 : 0} ${isWaning ? 200 : 0},99.9
              L ${isWaning ? 200 - illumination : illumination},100
              A ${shadow / 2},100 0 1,${isWaning ? 0 : 1} ${isWaning ? 200 : 0},100
              Z"
              fill="black"
              transform="rotate(${-moonData.angle * (180 / Math.PI)} 100 100)"
            />
          </mask>
        </defs>
        <circle cx="100" cy="100" r="100" fill="white" filter="url(#moon-ghost)" />
        <circle cx="100" cy="100" r="100" fill="white" mask="url(#moon-mask)" />
      </svg>
    `;
  }

  // Initialisation
  updateSize();
  renderMoon();
  setInterval(renderMoon, 60000);

  if (clickable) {
    container.style.cursor = 'pointer';
    container.addEventListener('click', () => {
      if (Array.isArray(sizes)) {
        currentSize = (currentSize + 1) % sizes.length;
        updateSize();
      }
    });
  }

  document.body.appendChild(container);
}
