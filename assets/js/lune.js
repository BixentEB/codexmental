// lune-widget.js

/**
 * Calcule le pourcentage de face éclairée de la Lune
 */
function getMoonPhasePercentage(date = new Date()) {
  const base = new Date('2024-01-11T11:57:00Z'); // 🌑 Nouvelle lune
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = diff / 29.530588853;
  const phase = lunations % 1;
  return Math.round(100 * (1 - Math.cos(phase * 2 * Math.PI)) / 2);
}

function getPhaseFraction(date = new Date()) {
  const base = new Date('2024-01-11T11:57:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = diff / 29.530588853;
  return lunations % 1;
}

function applyLunarShadow(luneElement, percent, fraction) {
  if (!luneElement) return;

  const isWaxing = fraction < 0.5;
  const illum = 100 - percent;

  luneElement.style.setProperty('--illum', `${illum}%`);
  luneElement.style.setProperty('--side', isWaxing ? '0%' : 'auto');

  const wrapper = luneElement.parentElement;
  if (wrapper) wrapper.classList.toggle("lune-nouvelle", percent <= 2);
}

function followScrollLune(wrapper) {
  if (!wrapper) return;

  const handler = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const luneHeight = wrapper.offsetHeight;
    const top = scrollTop + windowHeight - luneHeight - 20;

    wrapper.style.position = 'absolute';
    wrapper.style.top = `${top}px`;
    wrapper.style.right = wrapper.classList.contains('lune-super') ? '-200px' : '20px';
  };

  window.removeEventListener('scroll', followScrollLune._handler);
  window.addEventListener('scroll', handler);
  followScrollLune._handler = handler;
  handler();
}

function applySavedLuneSize(wrapper) {
  if (!wrapper || window.innerWidth <= 1024) return;

  const tailles = ["150px", "250px", "350px", "500px"];
  const classes = ["", "", "", "lune-super"];
  const index = parseInt(localStorage.getItem("luneTailleIndex")) || 1;

  wrapper.style.width = tailles[index];
  wrapper.style.height = tailles[index];
  wrapper.classList.remove("lune-super");
  if (classes[index]) wrapper.classList.add(classes[index]);

  followScrollLune(wrapper);
}

function setupLuneClickCycle(wrapper) {
  if (!wrapper || window.innerWidth <= 1024) return;

  const tailles = ["150px", "250px", "350px", "500px"];
  const classes = ["", "", "", "lune-super"];
  let index = parseInt(localStorage.getItem("luneTailleIndex")) || 1;

  wrapper.style.cursor = 'pointer';

  wrapper.addEventListener('click', () => {
    index = (index + 1) % tailles.length;
    wrapper.style.width = tailles[index];
    wrapper.style.height = tailles[index];
    wrapper.classList.remove("lune-super");
    if (classes[index]) wrapper.classList.add(classes[index]);

    localStorage.setItem("luneTailleIndex", index);
    followScrollLune(wrapper);
  });
}

/**
 * Fonction principale appelée par le thème
 */
export function updateLunarWidget(theme) {
  const existing = document.getElementById('lune-widget');
  if (existing) existing.remove();

  if (theme !== 'theme-lunaire') return;

  setTimeout(() => {
    const wrapper = document.createElement('div');
    wrapper.id = 'lune-widget';

    const lune = document.createElement('div');
    lune.classList.add('lune-img');
    lune.style.backgroundImage = `url('/img/lune/lune-pleine.png')`;

    wrapper.appendChild(lune);
    document.body.appendChild(wrapper);

    const percent = getMoonPhasePercentage();
    const fraction = getPhaseFraction();
    applyLunarShadow(lune, percent, fraction);
    applySavedLuneSize(wrapper);
    setupLuneClickCycle(wrapper);
    followScrollLune(wrapper);
  }, 50);
}
