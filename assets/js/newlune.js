// =====================
// 🌙 CALCUL PRECIS DES PHASES LUNAIRES
// =====================
function getMoonData(date = new Date()) {
  const moon = SunCalc.getMoonIllumination(date);

  return {
    illumination: moon.fraction * 100,           // 0–100%
    isWaxing: moon.phase < 0.5,                  // true si croissante
    phase: moon.phase                            // 0=new, 0.5=full
  };
}

// =====================
// 🎨 AFFICHAGE DU WIDGET SVG
// =====================
function setMoonPhaseSVG(illumination, isWaxing) {
  const ombre = document.getElementById('ombre');
  if (!ombre) return;

  const progress = illumination / 100;
  let ombreCx;

  if (illumination <= 0.1) {
    ombreCx = 50; // nouvelle lune
  } else if (illumination >= 99.9) {
    ombreCx = isWaxing ? -50 : 150; // pleine lune
  } else {
    ombreCx = isWaxing
      ? 50 - (50 * progress)
      : 50 + (50 * progress);
  }

  ombre.setAttribute('cx', ombreCx);
}

// =====================
// 🎨 CREATION DU WIDGET SVG
// =====================
function insertSVGWidget() {
  const old = document.getElementById('svg-lune-widget');
  if (old) old.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'svg-lune-widget';
  wrapper.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <filter id="lune-fantome">
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.08"/>
          </feComponentTransfer>
          <feColorMatrix type="matrix" values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0"/>
        </filter>
        <mask id="mask-lune">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" filter="url(#lune-fantome)"/>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" mask="url(#mask-lune)"/>
    </svg>
  `;

  document.body.appendChild(wrapper);
  setupLuneClickCycle(wrapper);
}

// =====================
// 🖱 INTERACTIONS
// =====================
function setupLuneClickCycle(wrapper) {
  if (!wrapper) return;

  const tailles = ['150px', '250px', '350px', '500px'];
  const classes = ['', '', '', 'super-lune'];
  let index = wrapper.dataset.tailleIndex ? parseInt(wrapper.dataset.tailleIndex) : 1;

  function applySizeAndClass() {
    wrapper.style.width = tailles[index];
    wrapper.style.height = tailles[index];
    wrapper.classList.remove('super-lune');
    if (classes[index]) wrapper.classList.add(classes[index]);
    wrapper.dataset.tailleIndex = index;
  }

  applySizeAndClass();
  wrapper.style.cursor = 'pointer';

  wrapper.addEventListener('click', (e) => {
    e.preventDefault();
    const maxIndex = window.innerWidth <= 568 ? 1 : window.innerWidth <= 1024 ? 2 : 3;
    index = (index + 1) % (maxIndex + 1);
    applySizeAndClass();
    followScrollLuneSVG();
  });
}

// =====================
// 🖱 SUIVI DU SCROLL
// =====================
function followScrollLuneSVG() {
  const lune = document.getElementById('svg-lune-widget');
  if (!lune) return;

  const scrollTop = window.scrollY;
  const top = scrollTop + window.innerHeight - lune.offsetHeight - 20;

  lune.style.position = 'absolute';
  lune.style.top = `${top}px`;
  lune.style.right = lune.classList.contains('super-lune') ? '-200px' : '20px';
  lune.style.zIndex = '1000';
}

// =====================
// 🔄 GESTION AUTOMATIQUE
// =====================
let moonInterval = null;

function manageMoonWidget() {
  if (moonInterval) clearInterval(moonInterval);
  const widget = document.getElementById('svg-lune-widget');

  if (!document.body.classList.contains('theme-lunaire')) {
    if (widget) widget.remove();
    return;
  }

  insertSVGWidget();
  const { illumination, isWaxing } = getMoonData();
  setMoonPhaseSVG(illumination, isWaxing);

  moonInterval = setInterval(() => {
    const data = getMoonData();
    setMoonPhaseSVG(data.illumination, data.isWaxing);
  }, 3600000);

  window.addEventListener('scroll', followScrollLuneSVG);
  window.addEventListener('resize', followScrollLuneSVG);
}

// =====================
// 🚀 INITIALISATION
// =====================
export function updateLunarWidget() {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', updateLunarWidget, { once: true });
    return;
  }

  new MutationObserver(manageMoonWidget).observe(document.body, {
    attributes: true,
    attributeFilter: ['class']
  });

  manageMoonWidget();
}
