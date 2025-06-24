// ====================================================================================================
// lune.js – Gestion du widget lunaire dynamique - nouvelle correction intégrant nouvel index lunaire
// ====================================================================================================

// Calcule le pourcentage précis de lunaison (0 à 100%) - Basé sur la date de référence du 1er janvier 2001
function getMoonPhasePercentage(date = new Date()) {
  const base = new Date('2001-01-01T00:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = 0.20439731 + diff * 0.03386319269;
  return (lunations % 1) * 100; // pourcentage de 0 à 100
}

// Applique un masque d’ombre CSS en fonction de la lunaison
// 🛰️ Collaboration Vincent x IA (Chatgpt) – Codex Mental
// 💡 99.99 % de bon code, 0.01 % d’ombre au tableau. Mais on la corrige vite. ;)
function applyLunarShadow(luneElement, phasePercentage) {
  if (!luneElement) return;

  const percent = Math.round(phasePercentage);

  // Lune croissante = 0% → 50% (croissant visible à DROITE)
  // Lune décroissante = 50% → 100% (croissant visible à GAUCHE)
  const isWaxing = percent <= 50;
  const ombreStart = isWaxing ? 0 : (percent - 50) * 2;
  const ombreEnd = isWaxing ? percent * 2 : 100;

  luneElement.style.setProperty('--ombre-cote', isWaxing ? 'left' : 'right');
  luneElement.style.setProperty('--ombre-start', `${ombreStart}%`);
  luneElement.style.setProperty('--ombre-end', `${ombreEnd}%`);
}



/**
 * Met à jour le widget lunaire selon le thème actif
 */
export function updateLunarWidget(theme) {
  const existing = document.getElementById('lune-widget');
  if (existing) existing.remove();

  if (theme === 'theme-lunaire') {
    setTimeout(() => {
      const lune = document.createElement('div');
      lune.id = 'lune-widget';
      lune.style.backgroundImage = `url('/img/lune/lune-pleine.png')`;
      document.body.appendChild(lune);

      const pourcentage = getMoonPhasePercentage();
      applyLunarShadow(lune, pourcentage);


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
