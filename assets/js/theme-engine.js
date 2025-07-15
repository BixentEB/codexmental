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
  const lune = document.getElementById("svg-lune-widget");
  if (!lune) return;

  const width = window.innerWidth;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // ===== MOBILE (petit écran OU appareil tactile) =====
  if (width <= 568 || isTouchDevice) {
    lune.classList.remove('super-lune');
    lune.style.cssText = `
      width: 180px !important;
      height: 180px !important;
      right: 15px !important;
      bottom: 15px !important;
      opacity: 0.7 !important;
      transform: none !important;
      pointer-events: none !important;
      cursor: default !important;
      transition: none !important;
    `;
    lune.onclick = null;
    lune.ontouchstart = null;
    lune.ontouchend = null;

    const svg = lune.querySelector('svg');
    if (svg) {
      svg.style.cssText = `
        pointer-events: none !important;
        touch-action: none !important;
      `;
    }
  }
  // ===== TABLETTE (568px - 768px) =====
  else if (width <= 768) {
    lune.classList.remove('super-lune');
    lune.style.cssText = `
      width: 250px !important;
      height: 250px !important;
      right: 20px !important;
      bottom: 20px !important;
      opacity: 0.85 !important;
      pointer-events: auto !important;
      cursor: pointer !important;
      transform: none !important;
    `;
  }
  // ===== DESKTOP (>768px) =====
  else {
    lune.style.cssText = '';
    lune.removeAttribute('style');
  }
}
