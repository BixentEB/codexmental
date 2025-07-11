import { setupCanvas, initParticles, stopParticles } from '/assets/js/canvas.js';

let soleilActif = false;

/**
 * Applique un thème visuel au <body> :
 * - Mémorise le thème dans localStorage
 * - Active les effets visuels (canvas uniquement)
 * @param {string} theme - Nom de la classe (ex: theme-lunaire)
 */
export async function setTheme(theme) {
  // Appliquer la classe de thème au body
  document.body.className = theme;

  // Si on vient d'activer le thème lunaire, adapter la lune responsive
  if (theme === 'theme-lunaire') {
    adaptLuneResponsive();
  }

  // Sauvegarder le thème choisi
  localStorage.setItem('codexTheme', theme);

  // Nettoyer les effets visuels précédents
  stopParticles(); // Effets canvas uniquement

  // Nettoyage du canvas pour éviter les artefacts visuels
  const canvas = document.getElementById("theme-canvas");
  if (canvas) {
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // === Effets visuels par thème ===
  if (theme === 'theme-stellaire') {
    setupCanvas();
    initParticles('stars', 120);
    document.getElementById('theme-canvas').style.opacity = '1';
    soleilActif = false;
  }

  else if (theme === 'theme-galactique') {
    setupCanvas();
    initParticles('dust', 100);
    document.getElementById('theme-canvas').style.opacity = '1';
    soleilActif = false;
  }

  else if (theme === 'theme-solaire') {
    setupCanvas();
    document.getElementById('theme-canvas').style.opacity = '1';

    if (!soleilActif) {
      const { initSoleilFlottant } = await import('/assets/js/canvas-solaire.js');
      initSoleilFlottant();
      soleilActif = true;
    }
  } else {
    soleilActif = false;
  }
}

// Modification tailles lune sur différents écrans (Responsive Lune)
export function adaptLuneResponsive() {
  const lune = document.querySelector('body.theme-lunaire #svg-lune-widget');
  if (!lune) return;

  const width = window.innerWidth;

  if (width <= 568) {
    // Petits écrans : petite lune unique
    lune.classList.remove('super-lune');
    lune.style.width = '180px';
    lune.style.height = '180px';
    lune.style.right = '15px';
    lune.style.bottom = '15px';
    lune.style.opacity = '0.7';
    lune.style.transform = 'none'; // pas d'agrandissement
    lune.style.pointerEvents = 'none'; // non cliquable
    lune.style.cursor = 'default';

  } else if (width <= 768) {
    // Tablettes et grands téléphones
    lune.style.pointerEvents = 'auto'; // cliquable
    lune.style.cursor = 'pointer';
    lune.style.opacity = '0.85';

    if (lune.classList.contains('super-lune')) {
      // Si super-lune, taille moyenne
      lune.style.width = '350px';
      lune.style.height = '350px';
      lune.style.right = '-80px';
      lune.style.bottom = '-60px';
      lune.style.transform = 'none';
    } else {
      // Taille normale
      lune.style.width = '250px';
      lune.style.height = '250px';
      lune.style.right = '20px';
      lune.style.bottom = '20px';
      lune.style.transform = 'none';
    }

  } else {
    // Grands écrans : styles normaux (laisse le CSS gérer)
    lune.style.width = '';
    lune.style.height = '';
    lune.style.right = '';
    lune.style.bottom = '';
    lune.style.opacity = '';
    lune.style.transform = '';
    lune.style.pointerEvents = '';
    lune.style.cursor = '';
  }
}

// Exécute au chargement
window.addEventListener('load', adaptLuneResponsive);
// Exécute au redimensionnement
window.addEventListener('resize', adaptLuneResponsive);
