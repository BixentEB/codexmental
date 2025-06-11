// ========================================================
// lune.js – Gestion du widget lunaire pour le thème lunaire
// ========================================================

/**
 * Calcule l’index de phase lunaire (0 à 7)
 * Basé sur la date de référence du 1er janvier 2001
 * @param {Date} date
 * @returns {number} index de phase (0 = nouvelle lune, 4 = pleine lune, etc.)
 */
function getMoonPhaseIndex(date = new Date()) {
  const base = new Date('2001-01-01T00:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24); // en jours
  const lunations = 0.20439731 + diff * 0.03386319269;
  return Math.floor((lunations % 1) * 8);
}

/**
 * Met à jour le widget lunaire selon le thème
 * @param {string} theme - nom du thème appliqué
 */
export function updateLunarWidget(theme) {
  const existing = document.getElementById('lune-widget');
  if (existing) existing.remove();

  if (theme === 'theme-lunaire') {
    const phase = getMoonPhaseIndex();
    const lune = document.createElement('div');
    lune.id = 'lune-widget';
    lune.style.backgroundImage = `url('/img/lune/lune-${phase}.png')`;
    document.body.appendChild(lune);
    followScrollLune();
  }
}

/**
 * Positionne dynamiquement la lune lors du scroll
 */
export function followScrollLune() {
  const lune = document.getElementById('lune-widget');
  if (!lune) return;

  const padding = 10;
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const luneHeight = lune.offsetHeight;

  const idealTop = scrollTop + windowHeight - luneHeight - padding;

  lune.style.left = 'unset';
  lune.style.right = `${padding}px`;
  lune.style.top = `${idealTop}px`;
}
