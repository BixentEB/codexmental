// /assets/js/theme-engine.js
import { setupCanvas, initParticles, stopParticles } from '/assets/js/canvas.js';

let soleilActif = false;
let currentTheme = null; // mémorise le dernier thème appliqué

/**
 * Applique un thème visuel au <body> :
 * - Mémorise le thème dans localStorage
 * - Active les effets visuels (canvas uniquement)
 * @param {string} theme - Nom de la classe (ex: 'theme-lunaire', 'theme-stellaire', etc.)
 */
export async function setTheme(theme) {
  // Appliquer la classe de thème au body (utile pour le preload CSS)
  document.body.className = theme;

  // Si on vient d'activer le thème lunaire, adapter la lune responsive
  if (theme === 'theme-lunaire') {
    adaptLuneResponsive();
  }

  // Sauvegarder le thème choisi (préférence visiteur)
  localStorage.setItem('codexTheme', theme);

  // --- Arrêter l’animation spécifique du thème précédent si besoin ---
  if (currentTheme === 'theme-sky') {
    try {
      const { stopSky } = await import('/assets/js/canvas-sky.js');
      stopSky();
    } catch (e) {
      // ok si le module n'a jamais été chargé
      console.warn('stopSky non disponible (normal si non chargé)', e);
    }
  }

  // Nettoyer les effets visuels précédents (particules standard)
  stopParticles();

  // Nettoyage du canvas pour éviter les artefacts visuels
  const canvas = document.getElementById('theme-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // === Effets visuels par thème ===
  if (theme === 'theme-sky') {
    // thème clair "ciel + étoiles tombantes" (module séparé, safe)
    setupCanvas();
    document.getElementById('theme-canvas').style.opacity = '1';
    const { initSky } = await import('/assets/js/canvas-sky.js');
    initSky();
    soleilActif = false;
  }

  else if (theme === 'theme-stellaire') {
    // ciel étoilé sombre (particules stars)
    setupCanvas();
    initParticles('stars', 120);
    document.getElementById('theme-canvas').style.opacity = '1';
    soleilActif = false;
  }

  else if (theme === 'theme-galactique') {
    // poussière cosmique (particules dust)
    setupCanvas();
    initParticles('dust', 100);
    document.getElementById('theme-canvas').style.opacity = '1';
    soleilActif = false;
  }

  else if (theme === 'theme-solaire') {
    // soleil flottant (module séparé)
    setupCanvas();
    document.getElementById('theme-canvas').style.opacity = '1';

    if (!soleilActif) {
      const { initSoleilFlottant } = await import('/assets/js/canvas-solaire.js');
      initSoleilFlottant();
      soleilActif = true;
    }
  }

  else {
    // autre thème : pas d'effet canvas dédié
    soleilActif = false;
  }

  // mémoriser le thème courant (utile pour stopper proprement au prochain switch)
  currentTheme = theme;
}

/**
 * Modification tailles lune sur différents écrans (Responsive Lune)
 */
export function adaptLuneResponsive() {
  const lune = document.querySelector('body.theme-lunaire #svg-lune-widget');
  if (!lune) return;

  const width = window.innerWidth;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

  // ===== MOBILE (petit écran OU appareil tactile) =====
  if (width <= 568 || isTouchDevice) {
    // Reset complet de l'état
    lune.classList.remove('super-lune');

    // Application des styles forcés
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

    // Désactivation totale des interactions
    lune.onclick = null;
    lune.ontouchstart = null;
    lune.ontouchend = null;

    // Blocage des events sur le SVG et ses enfants
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
    // On force la taille moyenne (pas de super-lune)
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
    // Reset complet pour laisser le CSS gérer
    lune.style.cssText = '';
    lune.removeAttribute('style');
  }
}
