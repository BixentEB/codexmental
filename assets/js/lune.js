// ====================================================================================================
// lune.js – Widget lunaire dynamique injecté (Codex Mental, Vincent x IA)
// ====================================================================================================

// Calcule le pourcentage précis de lunaison (0 à 100 %)
function getMoonPhasePercentage(date = new Date()) {
  const base = new Date('2001-01-01T00:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = 0.20439731 + diff * 0.03386319269;
  return (lunations % 1) * 100;
}

// Applique les variables CSS pour simuler l’éclairage lunaire
function applyLunarShadow(luneElement, phasePercentage) {
  if (!luneElement) return;
  const percent = Math.round(phasePercentage);
  const isWaxing = percent <= 50;
  const ombreStart = isWaxing ? 0 : (percent - 50) * 2;
  const ombreEnd = isWaxing ? percent * 2 : 100;

  luneElement.style.setProperty('--ombre-cote', isWaxing ? 'left' : 'right');
  luneElement.style.setProperty('--ombre-start', `${ombreStart}%`);
  luneElement.style.setProperty('--ombre-end', `${ombreEnd}%`);

  const wrapper = luneElement.parentElement;
  if (wrapper) {
    if (percent <= 2) {
      wrapper.classList.add("lune-nouvelle");
    } else {
      wrapper.classList.remove("lune-nouvelle");
    }
  }
}

// Injection du widget lunaire (auto si theme lunaire)
function injectLunarWidgetIfNeeded() {
  const theme = document.body.className;
  if (!theme.includes("theme-lunaire")) return;

  if (document.getElementById('lune-widget')) return;

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

// Suit le scroll
function followScrollLune(lune) {
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

// Taille sauvegardée
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

// Cycle de clics
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

// Lancement auto au chargement
document.addEventListener("DOMContentLoaded", injectLunarWidgetIfNeeded);
