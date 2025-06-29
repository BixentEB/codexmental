// ====================================================================================================
// lune.js – Widget lunaire dynamique (Vincent x IA – Codex Mental)
// Version sécurisée – Simulation réaliste + orientation correcte
// ====================================================================================================

/**
 * 📆 Données lunaires : illumination et sens (croissante/décroissante)
 */
function getMoonData(date = new Date()) {
  // Base révisée pour coller au premier croissant visible à 1-2%
  const base = new Date('2024-01-11T07:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = diff / 29.530588853;
  const phase = lunations % 1;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  const isWaxing = phase < 0.5; // avant pleine lune

  return {
    illumination: illumination * 100,
    isWaxing,
    phase
  };
}

/**
 * 🌓 Applique l'ombre CSS réaliste selon illumination et sens
 */
function applyLunarShadow(luneElement) {
  if (!luneElement) return;

  const { illumination, isWaxing } = getMoonData();
  const rounded = Math.round(illumination);

  const ombreWidth = `${100 - rounded}%`;
  const ombreOffset = isWaxing ? `0%` : `${rounded}%`;

  luneElement.style.setProperty('--ombre-width', ombreWidth);
  luneElement.style.setProperty('--ombre-offset', ombreOffset);

  
 // ✨ Affichage réaliste même en dessous de 1% d’illumination
  if (illumination < 1) {
  luneElement.classList.add('lune-nouvelle');
  luneElement.style.setProperty('--ombre-width', '98%'); // laisse un mini croissant
  luneElement.style.setProperty('--ombre-offset', isWaxing ? '0%' : '2%');
} else {
  luneElement.classList.remove('lune-nouvelle');
}


  // 🌌 Débogage (console)
  console.log(`[LUNE] Illumination: ${illumination.toFixed(1)}% | Phase: ${(rounded)}% | Croissante: ${isWaxing}`);
}

/**
 * 🌕 Initialise le widget lunaire (appelé dynamiquement)
 */
export function updateLunarWidget(theme) {
  if (theme !== 'theme-lunaire') return;

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
  lune.style.zIndex = '25';
  lune.style.pointerEvents = 'auto';

  if (!document.body) return;
  document.body.appendChild(lune);

  applyLunarShadow(lune);
  applySavedLuneSize(lune);
  setupLuneClickCycle(lune);
  followScrollLune(lune);
}

/**
 * 📜 Fait suivre la lune en bas à droite au scroll
 */
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

/**
 * 📏 Applique la taille sauvegardée (ou par défaut)
 */
function applySavedLuneSize(lune) {
  if (!lune) return;

  const tailles = ['150px', '250px', '350px', '500px'];
  const classes = ['', '', '', 'lune-super'];
  const index = parseInt(localStorage.getItem('luneTailleIndex')) || 1;

  lune.style.width = tailles[index];
  lune.style.height = tailles[index];
  lune.classList.remove('lune-super');
  if (classes[index]) lune.classList.add(classes[index]);

  followScrollLune(lune);
}

/**
 * 🔁 Clics cycliques sur la lune pour changer sa taille
 */
function setupLuneClickCycle(lune) {
  if (!lune) return;

  const tailles = ['150px', '250px', '350px', '500px'];
  const classes = ['', '', '', 'lune-super'];
  let index = parseInt(localStorage.getItem('luneTailleIndex')) || 1;

  lune.style.cursor = 'pointer';

  lune.addEventListener('click', () => {
    const maxIndex = window.innerWidth <= 568 ? 0 :
                     window.innerWidth <= 1024 ? 2 :
                     3;

    index = (index + 1) % (maxIndex + 1);

    lune.style.width = tailles[index];
    lune.style.height = tailles[index];
    lune.classList.remove('lune-super');
    if (classes[index]) lune.classList.add(classes[index]);

    localStorage.setItem('luneTailleIndex', index);
    followScrollLune(lune);
  });
}
