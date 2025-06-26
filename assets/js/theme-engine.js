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
