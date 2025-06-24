// ====================================================================================================
// lune.js – Gestion du widget lunaire dynamique (Vincent x IA – Codex Mental)
// Version simplifiée avec ::after dynamique (inspiré de madsstoumann) – Juin 2025
// ====================================================================================================

function getMoonPhasePercentage(date = new Date()) {
  // 🌑 Base réelle : Nouvelle lune du 11 janvier 2024 à 11:57 UTC
  const base = new Date('2024-01-11T11:57:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24); // jours depuis base
  const lunations = diff / 29.530588853; // moyenne synodique
  const phase = lunations % 1;

  // 🌘 Retourne pourcentage de face éclairée (0 = nouvelle lune, 1 = pleine lune, puis retour à 0)
  const illumination = Math.round(100 * (1 - Math.cos(phase * 2 * Math.PI)) / 2);
  return illumination;
}


// Applique les variables CSS pour simuler l’éclairage lunaire
function applyLunarShadow(luneElement, phasePercentage) {
  if (!luneElement) return;

  const percent = Math.round(phasePercentage);
  const isWaxing = percent <= 50;
  const lightPercent = isWaxing ? percent * 2 : (100 - percent) * 2;

  // On injecte les variables CSS pour le ::after
  luneElement.style.setProperty('--illum', `${100 - lightPercent}%`);
  luneElement.style.setProperty('--side', isWaxing ? '0%' : 'auto');

  // Classe spéciale si nouvelle lune
  const wrapper = luneElement.parentElement;
  if (wrapper) {
    if (percent <= 2) {
      wrapper.classList.add("lune-nouvelle");
    } else {
      wrapper.classList.remove("lune-nouvelle");
    }
  }
}

/**
 * Met à jour le widget lunaire en fonction du thème actif
 */
export function updateLunarWidget(theme) {
  const existing = document.getElementById('lune-widget');
  if (existing) existing.remove();

  if (theme === 'theme-lunaire') {
    setTimeout(() => {
      const wrapper = document.createElement('div');
      wrapper.id = 'lune-widget';

      const lune = document.createElement('div');
      lune.classList.add('lune-img');
      lune.style.backgroundImage = `url('/img/lune/lune-pleine.png')`;
      wrapper.appendChild(lune);

      document.body.appendChild(wrapper);

      const pourcentage = getMoonPhasePercentage();
      applyLunarShadow(lune, pourcentage);

      applySavedLuneSize(wrapper);
      setupLuneClickCycle(wrapper);
      followScrollLune(wrapper);
    }, 50);
  }
}

/**
 * Fait suivre la lune au scroll (même super)
 */
export function followScrollLune(lune) {
  if (!lune) return;

  const updatePosition = () => {
    const wrapper = document.getElementById('lune-widget');
    if (!wrapper) return;

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const luneHeight = wrapper.offsetHeight;
    const top = scrollTop + windowHeight - luneHeight - 20;

    wrapper.style.position = 'absolute';
    wrapper.style.top = `${top}px`;
    wrapper.style.left = 'unset';
    wrapper.style.bottom = 'unset';

    if (wrapper.classList.contains('lune-super')) {
      wrapper.style.right = '-200px';
    } else {
      wrapper.style.right = '20px';
    }
  };

  window.removeEventListener('scroll', followScrollLune._handler);
  window.addEventListener('scroll', updatePosition);
  followScrollLune._handler = updatePosition;
  updatePosition();
}

/**
 * Applique la taille sauvegardée à la lune
 */
function applySavedLuneSize(wrapper) {
  if (!wrapper || window.innerWidth <= 1024) return;

  const tailles = ["150px", "250px", "350px", "500px"];
  const classes = ["", "", "", "lune-super"];
  const index = parseInt(localStorage.getItem("luneTailleIndex")) || 1;

  wrapper.style.width = tailles[index];
  wrapper.style.height = tailles[index];
  wrapper.classList.remove("lune-super");
  if (classes[index]) wrapper.classList.add(classes[index]);

  followScrollLune(wrapper);
}

/**
 * Gère les clics pour changer la taille
 */
function setupLuneClickCycle(wrapper) {
  if (!wrapper || window.innerWidth <= 1024) return;

  const tailles = ["150px", "250px", "350px", "500px"];
  const classes = ["", "", "", "lune-super"];
  let index = parseInt(localStorage.getItem("luneTailleIndex")) || 1;

  wrapper.style.cursor = 'pointer';

  wrapper.addEventListener('click', () => {
    index = (index + 1) % tailles.length;
    wrapper.style.width = tailles[index];
    wrapper.style.height = tailles[index];
    wrapper.classList.remove("lune-super");
    if (classes[index]) wrapper.classList.add(classes[index]);

    localStorage.setItem("luneTailleIndex", index);
    followScrollLune(wrapper);
  });
}
