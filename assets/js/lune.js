// ========================================================
// lune.js – Gestion du widget lunaire dynamique
// ========================================================

/**
 * Calcule l’index de phase lunaire (0 à 7)
 * Basé sur la date de référence du 1er janvier 2001
 */
function getMoonPhaseIndex(date = new Date()) {
  const base = new Date('2001-01-01T00:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24); // jours
  const lunations = 0.20439731 + diff * 0.03386319269;
  return Math.floor((lunations % 1) * 8);
}

/**
 * Met à jour le widget lunaire selon le thème
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
    applySavedLuneSize(lune);
    followScrollLune(lune);
    setupLuneClickCycle(lune);
  }
}

/**
 * Positionne dynamiquement la lune lors du scroll
 */
export function followScrollLune(lune) {
  if (!lune) return;

  const padding = 10;
  const updatePosition = () => {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const luneHeight = lune.offsetHeight;
    const idealTop = scrollTop + windowHeight - luneHeight - padding;

    lune.style.left = 'unset';
    lune.style.right = `${padding}px`;
    lune.style.top = `${idealTop}px`;
  };

  window.addEventListener('scroll', updatePosition);
  updatePosition(); // initial
}

/**
 * Applique la taille sauvegardée à la lune (si existante)
 */
function applySavedLuneSize(lune) {
  if (!lune || window.innerWidth <= 1024) return;

  const tailles = ["80px", "120px", "180px", "480px"];
  const classes = ["", "", "", "lune-super"];
  let index = parseInt(localStorage.getItem("luneTailleIndex")) || 1;

  lune.style.width = tailles[index];
  lune.style.height = tailles[index];
  lune.classList.remove("lune-super");
  if (classes[index]) lune.classList.add(classes[index]);
}

/**
 * Ajoute l'interaction de clic pour changer la taille de la lune
 */
function setupLuneClickCycle(lune) {
  if (!lune || window.innerWidth <= 1024) return;

  const tailles = ["80px", "120px", "180px", "480px"];
  const classes = ["", "", "", "lune-super"];
  let index = parseInt(localStorage.getItem("luneTailleIndex")) || 1;

  lune.style.cursor = 'pointer';

  lune.addEventListener('click', () => {
    index = (index + 1) % tailles.length;
    lune.style.width = tailles[index];
    lune.style.height = tailles[index];

    lune.classList.remove("lune-super");
    if (classes[index]) lune.classList.add(classes[index]);

    localStorage.setItem("luneTailleIndex", index);
  });
}
