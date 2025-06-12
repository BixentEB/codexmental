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
    }, 50); // Laisse le DOM respirer
  }
}

/**
 * Gère le positionnement dynamique de la lune au scroll
 */
function followScrollLune(lune) {
  if (!lune) return;

  const updatePosition = () => {
    const currentLune = document.getElementById('lune-widget');
    if (!currentLune) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const luneHeight = currentLune.offsetHeight;
    const padding = 10;

    // Valeurs par défaut
    let top = scrollTop + windowHeight - luneHeight - padding;
    let right = 20;

    // Ajustements pour super lune
    if (currentLune.classList.contains("lune-super")) {
      right = -160;
      top += 40;
    }

    currentLune.style.left = 'unset';
    currentLune.style.right = `${right}px`;
    currentLune.style.top = `${top}px`;
  };

  window.addEventListener('scroll', updatePosition);
  updatePosition(); // Appel initial
}

/**
 * Applique la taille enregistrée (localStorage) à la lune
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
 * Gère l’interaction au clic pour faire évoluer la taille de la lune
 */
function setupLuneClickCycle(lune) {
  if (!lune || window.innerWidth <= 1024) return;

  const tailles = ["80px", "120px", "180px", "480px"];
  const classes = ["", "", "", "lune-super"];
  let index = parseInt(localStorage.getItem("luneTailleIndex")) || 1;

  const applySize = () => {
    lune.style.width = tailles[index];
    lune.style.height = tailles[index];
    lune.classList.remove("lune-super");
    if (classes[index]) lune.classList.add(classes[index]);
    localStorage.setItem("luneTailleIndex", index);
  };

  lune.style.cursor = 'pointer';
  lune.addEventListener('click', () => {
    index = (index + 1) % tailles.length;
    applySize();
  });
}
