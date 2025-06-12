// ========================================================
// lune.js – Gestion du widget lunaire dynamique
// ========================================================

/**
 * Calcule l’index de phase lunaire (0 à 7)
 */
function getMoonPhaseIndex(date = new Date()) {
  const base = new Date('2001-01-01T00:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = 0.20439731 + diff * 0.03386319269;
  return Math.floor((lunations % 1) * 8);
}

// === VARIABLE GLOBALE POUR TRACKER LE SCROLL HANDLER ===
let scrollHandler = null;

/**
 * Applique dynamiquement la position de la lune selon scroll
 */
function startScrollTracking() {
  if (scrollHandler) window.removeEventListener('scroll', scrollHandler);

  scrollHandler = () => {
    const lune = document.getElementById('lune-widget');
    if (!lune) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const luneHeight = lune.offsetHeight;
    const idealTop = scrollTop + windowHeight - luneHeight - 10;

    lune.style.position = 'absolute';
    lune.style.left = 'unset';

    // Décalage selon taille
    lune.style.right = lune.classList.contains("lune-super") ? '-200px' : '20px';
    lune.style.top = `${idealTop}px`;
    lune.style.bottom = 'unset';
  };

  window.addEventListener('scroll', scrollHandler);
  scrollHandler(); // init immédiat
}

/**
 * Applique la taille sauvegardée (locale)
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

  startScrollTracking();
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
    startScrollTracking();
  });
}

/**
 * Crée et affiche le widget lunaire
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
      startScrollTracking();
    }, 50);
  }
}
