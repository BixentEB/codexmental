// ====================================================================================================
// lune.js – Widget lunaire dynamique (Vincent x IA – Codex Mental)
// Version sécurisée – Protection DOM, injection stable
// ====================================================================================================

function getMoonPhasePercentage(date = new Date()) {
  const base = new Date('2024-01-11T11:57:00Z'); // Nouvelle lune réelle
  const diff = (date - base) / (1000 * 60 * 60 * 24); // jours écoulés
  const lunations = diff / 29.530588853;
  const phase = lunations % 1;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  return illumination * 100;
}

function applyLunarShadow(luneElement, percent) {
  if (!luneElement) return;

  const illumination = Math.round(percent);
  const isWaxing = (percent < 50); // Croissant si < 50%

  const ombreWidth = `${100 - illumination}%`;
  const ombreOffset = isWaxing ? `${100 - illumination}%` : `0%`;

  luneElement.style.setProperty('--ombre-width', ombreWidth);
  luneElement.style.setProperty('--ombre-offset', ombreOffset);

  if (illumination <= 2) {
    luneElement.classList.add('lune-nouvelle');
  } else {
    luneElement.classList.remove('lune-nouvelle');
  }
}

export function updateLunarWidget(theme) {
  if (theme !== 'theme-lunaire') return;

  // Sécurité DOM : si le body n’est pas prêt, on attend
  if (document.readyState !== 'complete') {
    window.addEventListener('load', () => updateLunarWidget(theme), { once: true });
    return;
  }

  const existing = document.getElementById('lune-widget');
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  const lune = document.createElement('div');
  lune.id = 'lune-widget';

  if (!document.body) return;
  document.body.appendChild(lune);

  const pourcentage = getMoonPhasePercentage();
  applyLunarShadow(lune, pourcentage);
  applySavedLuneSize(lune);
  setupLuneClickCycle(lune);
  followScrollLune(lune);
}

export function followScrollLune(lune) {
  if (!lune) return;

  const updatePosition = () => {
    const lune = document.getElementById('lune-widget');
    if (!lune) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const luneHeight = lune.offsetHeight;
    const top = scrollTop + windowHeight - luneHeight - 20;

    lune.style.position = 'absolute';
    lune.style.top = `${top}px`;
    lune.style.bottom = 'unset';
    lune.style.left = 'unset';
    lune.style.right = lune.classList.contains('lune-super') ? '-200px' : '20px';
  };

  window.removeEventListener('scroll', followScrollLune._handler);
  window.addEventListener('scroll', updatePosition);
  followScrollLune._handler = updatePosition;
  updatePosition();
}

function applySavedLuneSize(lune) {
  if (!lune || window.innerWidth <= 1024) return;

  const tailles = ['150px', '250px', '350px', '500px'];
  const classes = ['', '', '', 'lune-super'];
  const index = parseInt(localStorage.getItem('luneTailleIndex')) || 1;

  lune.style.width = tailles[index];
  lune.style.height = tailles[index];
  lune.classList.remove('lune-super');
  if (classes[index]) lune.classList.add(classes[index]);

  followScrollLune(lune);
}

function setupLuneClickCycle(lune) {
  if (!lune || window.innerWidth <= 1024) return;

  const tailles = ['150px', '250px', '350px', '500px'];
  const classes = ['', '', '', 'lune-super'];
  let index = parseInt(localStorage.getItem('luneTailleIndex')) || 1;

  lune.style.cursor = 'pointer';

  lune.addEventListener('click', () => {
    index = (index + 1) % tailles.length;
    lune.style.width = tailles[index];
    lune.style.height = tailles[index];
    lune.classList.remove('lune-super');
    if (classes[index]) lune.classList.add(classes[index]);

    localStorage.setItem('luneTailleIndex', index);
    followScrollLune(lune);
  });
}
