// ====================================================================================================
// lune.js – Widget lunaire dynamique (Vincent x IA – Codex Mental)
// Version corrigée avec masque réaliste – Juin 2025
// ====================================================================================================

function getMoonPhasePercentage(date = new Date()) {
  const base = new Date('2001-01-01T00:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = 0.20439731 + diff * 0.03386319269;
  return (lunations % 1) * 100;
}



function applyLunarShadow(luneElement, phasePercentage) {
  if (!luneElement) return;

  const percent = Math.round(phasePercentage);
  const isWaxing = percent <= 50;
  const ombreEnd = isWaxing ? percent * 2 : 100;

  luneElement.style.setProperty('--ombre-cote', isWaxing ? 'left' : 'right');
  luneElement.style.setProperty('--ombre-end', `${ombreEnd}%`);

  if (percent <= 2) {
    luneElement.classList.add('lune-nouvelle');
  } else {
    luneElement.classList.remove('lune-nouvelle');
  }
}

export function updateLunarWidget(theme) {
  const existing = document.getElementById('lune-widget');
  if (existing) existing.remove();

  if (theme === 'theme-lunaire') {
    setTimeout(() => {
      const lune = document.createElement('div');
      lune.id = 'lune-widget';
      document.body.appendChild(lune);

      const pourcentage = getMoonPhasePercentage();
      applyLunarShadow(lune, pourcentage);

      applySavedLuneSize(lune);
      setupLuneClickCycle(lune);
      followScrollLune(lune);
    }, 50);
  }
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
    lune.style.left = 'unset';
    lune.style.bottom = 'unset';
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
