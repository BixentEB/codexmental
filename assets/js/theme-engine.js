// ========================================================
// theme-engine.js – Applique le thème et initialise les effets associés
// ========================================================

import { setupCanvas, initParticles, stopParticles } from './canvas.js';
import { updateLunarWidget, followScrollLune } from './lune.js';

/**
 * Applique un thème visuel au <body> :
 * - Mémorise le thème dans localStorage
 * - Active les effets visuels (canvas, lune, etc.)
 * - Gère les listeners spécifiques
 * @param {string} theme - Nom de la classe (ex: theme-lunaire)
 */
export function setTheme(theme) {
  // Appliquer la classe de thème au body
  document.body.className = theme;

  // Sauvegarder le thème choisi
  localStorage.setItem('codexTheme', theme);

  // Nettoyer les effets visuels précédents
  stopParticles();                    // Effets canvas
  updateLunarWidget(theme);          // Widget lune

  // === Effets visuels par thème ===
  if (theme === 'theme-stellaire') {
    setupCanvas();
    initParticles('stars', 120);
    document.getElementById('theme-canvas').style.opacity = '1';
  }

  else if (theme === 'theme-galactique') {
    setupCanvas();
    initParticles('dust', 100);
    document.getElementById('theme-canvas').style.opacity = '1';
  }

  // === Scroll dynamique pour thème lunaire ===
  if (theme === 'theme-lunaire') {
    window.addEventListener('scroll', followScrollLune);
    window.addEventListener('resize', followScrollLune);
  } else {
    window.removeEventListener('scroll', followScrollLune);
    window.removeEventListener('resize', followScrollLune);
  }
}
