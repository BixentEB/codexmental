// ====================================================================================================
// lune.js – Gestion du widget lunaire dynamique - nouvelle correction intégrant nouvel index lunaire
// ====================================================================================================

/**
 * Calcule l’index de phase lunaire (28 à 30 phases)
 * Basé sur la date de référence du 1er janvier 2001
 */
function getMoonPhasePercentage(date = new Date()) {
  const base = new Date('2001-01-01T00:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = 0.20439731 + diff * 0.03386319269;
  return (lunations % 1) * 100; // pourcentage de 0 à 100
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
    }, 50);
  }
}

/**
 * Fait suivre la lune au scroll, quelle que soit sa taille
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

    // Ajustement latéral : normale vs super
    if (lune.classList.contains('lune-super')) {
      lune.style.right = '-200px';
    } else {
      lune.style.right = '20px';
    }

    lune.style.left = 'unset';
    lune.style.bottom = 'unset';
  };

  window.removeEventListener('scroll', followScrollLune._handler);
  window.addEventListener('scroll', updatePosition);
  followScrollLune._handler = updatePosition;
  updatePosition();
}

/**
 * Applique la taille sauvegardée de la lune
 */
function applySavedLuneSize(lune) {
  if (!lune || window.innerWidth <= 1024) return;

  const tailles = ["150px", "250px", "350px", "500px"];
  const classes = ["", "", "", "lune-super"];
  const index = parseInt(localStorage.getItem("luneTailleIndex")) || 1;

  lune.style.width = tailles[index];
  lune.style.height = tailles[index];
  lune.classList.remove("lune-super");
  if (classes[index]) lune.classList.add(classes[index]);

  followScrollLune(lune);
}

/**
 * Gère les clics pour changer la taille de la lune
 */
function setupLuneClickCycle(lune) {
  if (!lune || window.innerWidth <= 1024) return;

  const tailles = ["150px", "250px", "350px", "500px"];
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
    followScrollLune(lune);
  });
}
