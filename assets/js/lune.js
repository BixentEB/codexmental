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
 * Met à jour le widget lunaire selon le thème actif
 */
export function updateLunarWidget(theme) {
  const existing = document.getElementById('lune-widget');
  if (existing) existing.remove();

  if (theme === 'theme-lunaire') {
    setTimeout(() => {
      const phase = getMoonPhaseIndex();
      const lune = document.createElement('div');
      lune.id = 'lune-widget';
      lune.style.backgroundImage = `url('/img/lune/lune-${phase}.png')`;
      document.body.appendChild(lune);

      applySavedLuneSize(lune);
      setupLuneClickCycle(lune);
      followScrollLune(lune);
    }, 50); // délai pour éviter conflits DOM
  }
}

/**
 * Suit le scroll dynamiquement (sauf en mode super lune)
 */
export function followScrollLune(lune) {
  if (!lune) return;

  const padding = 10;

  const updatePosition = () => {
    const currentLune = document.getElementById('lune-widget');
    if (!currentLune || currentLune.classList.contains('lune-super')) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const luneHeight = currentLune.offsetHeight;
    const idealTop = scrollTop + windowHeight - luneHeight - padding;

    currentLune.style.left = 'unset';
    currentLune.style.right = `${padding}px`;
    currentLune.style.top = `${idealTop}px`;
  };

  window.addEventListener('scroll', updatePosition);
  updatePosition(); // init
}

/**
 * Applique la taille sauvegardée de la lune
 */
function applySavedLuneSize(lune) {
  if (!lune || window.innerWidth <= 1024) return;

  const tailles = ["80px", "120px", "180px", "480px"];
  const classes = ["", "", "", "lune-super"];
  const index = parseInt(localStorage.getItem("luneTailleIndex")) || 1;

  lune.style.width = tailles[index];
  lune.style.height = tailles[index];
  lune.classList.remove("lune-super");
  if (classes[index]) lune.classList.add(classes[index]);
}

/**
 * Gère les clics pour changer la taille de la lune
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
    // reposition si retour en taille normale
    if (!classes[index]) followScrollLune(lune);
  });
}
