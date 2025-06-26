// lune-svg.js – 🌙 Version propre et complète

// 🔁 Données lunaires
function getMoonData(date = new Date()) {
  const base = new Date('2024-01-11T07:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = diff / 29.530588853;
  const phase = lunations % 1;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  const isWaxing = phase < 0.5;
  return {
    illumination: illumination * 100,
    isWaxing,
    phase
  };
}

// 🌓 Ombre dynamique
function setMoonPhaseSVG(illumination, isWaxing) {
  const maskCircle = document.getElementById('ombre');
  if (!maskCircle) return;

  const minVisible = 0.015;
  const adjusted = Math.max(illumination, minVisible); // évite 0 pur

  const shift = 45 * (1 - adjusted); // plus c’est noir, plus on décale
  const offset = isWaxing ? shift : -shift;

  maskCircle.setAttribute('cx', 50 + offset);
}

// 🌕 Widget SVG
function insertSVGWidget() {
  const old = document.getElementById('svg-lune-widget');
  if (old) old.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'svg-lune-widget';

  wrapper.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" class="moon-svg" width="100%" height="100%">
      <defs>
        <mask id="mask-lune">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <circle id="ombre" cx="50" cy="50" r="50" fill="black" />
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" x="0" y="0" width="100" height="100" mask="url(#mask-lune)" />
    </svg>
  `;

  document.body.appendChild(wrapper);
  setupLuneClickCycle(wrapper);
}

// 🔁 Clic pour changer la taille
function setupLuneClickCycle(wrapper) {
  const tailles = ['150px', '250px', '350px', '500px'];
  const classes = ['', '', '', 'super-lune'];
  let index = parseInt(localStorage.getItem('luneTailleIndex')) || 1;

  const applySize = () => {
    wrapper.style.width = tailles[index];
    wrapper.style.height = tailles[index];
    wrapper.classList.remove('super-lune');
    if (classes[index]) wrapper.classList.add(classes[index]);
    followScrollLuneSVG(); // repositionne
  };

  applySize();
  wrapper.style.cursor = 'pointer';

  wrapper.addEventListener('click', () => {
    const maxIndex = window.innerWidth <= 568 ? 0 :
                     window.innerWidth <= 1024 ? 2 : 3;
    index = (index + 1) % (maxIndex + 1);
    localStorage.setItem('luneTailleIndex', index);
    applySize();
  });
}

// 📍 Suit le scroll bas droite
function followScrollLuneSVG() {
  const lune = document.getElementById('svg-lune-widget');
  if (!lune) return;

  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const luneHeight = lune.offsetHeight;
  const top = scrollTop + windowHeight - luneHeight - 20;

  lune.style.position = 'absolute';
  lune.style.top = `${top}px`;
  lune.style.bottom = 'unset';
  lune.style.left = 'unset';
  lune.style.right = lune.classList.contains('super-lune') ? '-200px' : '20px';
}

// 🚀 Point d’entrée exporté
export function updateLunarWidget() {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', updateLunarWidget, { once: true });
    return;
  }

  insertSVGWidget();

  const { illumination, isWaxing } = getMoonData();
  setMoonPhaseSVG(illumination / 100, isWaxing);

  window.addEventListener('scroll', followScrollLuneSVG);
  window.addEventListener('resize', followScrollLuneSVG);
  followScrollLuneSVG();
}
