// ========================================================
// Theme engine — applique classes + canvas + effets UI
// ========================================================

import { setupCanvas, initParticles, stopParticles } from '/assets/js/canvas.js';
import { applyTabEffect, switchTabEffect } from '/assets/js/effects-tabs.js';

let soleilActif = false;
let currentTheme = null; // mémorise le dernier thème appliqué

// ---- Catalogue d'effets disponibles pour les onglets (utile pour clean/reset)
const TAB_EFFECTS = [
  'tab-effect-underline',
  'tab-effect-glow',
  'tab-effect-zoom',
  'tab-effect-aurora',
  'tab-effect-shine',
  'tab-effect-wave'
];

/**
 * Sélecteur racine de tes onglets (classeur).
 * Si tu en as plusieurs types, tu peux multiplier les appels dans applyUiEffects().
 */
const TABS_SELECTOR = '.tabs'; // ex: ".tabs" ou ".pills", etc.

/**
 * Applique un thème visuel au <body> :
 * - Mémorise le thème dans localStorage
 * - Active les effets visuels (canvas)
 * - Met à jour les petits effets UI (tabs, etc.)
 * @param {string} theme - ex: 'theme-lunaire', 'theme-stellaire', 'theme-sky', ...
 */
export async function setTheme(theme) {
  // 1) Classe sur le body (utile pour le preload CSS)
  document.body.className = theme;

  // 2) Responsive Lune (si besoin)
  if (theme === 'theme-lunaire') {
    adaptLuneResponsive();
  }

  // 3) Sauvegarder la préférence visiteur
  localStorage.setItem('codexTheme', theme);

  // 4) Arrêt des animations spécifiques du thème précédent (ex: sky)
  if (currentTheme === 'theme-sky') {
    try {
      const { stopSky } = await import('/assets/js/canvas-sky.js');
      stopSky();
    } catch {
      /* ok si le module n'a jamais été chargé */
    }
  }

  // 5) Nettoyage particules/canvas standard
  stopParticles();
  const canvas = document.getElementById('theme-canvas');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  // 6) Effets visuels par thème (canvas)
  if (theme === 'theme-sky') {
    setupCanvas();
    document.getElementById('theme-canvas').style.opacity = '1';
    const { initSky } = await import('/assets/js/canvas-sky.js');
    initSky();
    soleilActif = false;
  }
  else if (theme === 'theme-stellaire') {
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

  // 7) Effets UI (onglets, boutons, etc.)
  applyUiEffects(theme);

  // 8) Mémoriser le thème courant
  currentTheme = theme;
}

/**
 * Applique les effets UI "catalogue" selon le thème
 * (ici uniquement les onglets; tu peux rajouter boutons, headings, cartes, etc.)
 */
function applyUiEffects(theme) {
  // ---- Exemple d’affectation d’effets différents par thème
  //   switchTabEffect(selector, effectToApply, allEffectsToRemoveFirst)
  //   -> n’altère pas le layout, ajoute juste une classe d’effet

  if (theme === 'theme-sky') {
    switchTabEffect(TABS_SELECTOR, 'tab-effect-shine', TAB_EFFECTS);
    // Exemples à garder en mémoire (désactivés) :
    // switchTabEffect(TABS_SELECTOR, 'tab-effect-underline', TAB_EFFECTS);
    // switchTabEffect(TABS_SELECTOR, 'tab-effect-zoom', TAB_EFFECTS);
  }

  else if (theme === 'theme-solaire') {
    switchTabEffect(TABS_SELECTOR, 'tab-effect-aurora', TAB_EFFECTS);
    // Idées :
    // switchTabEffect(TABS_SELECTOR, 'tab-effect-glow', TAB_EFFECTS);
  }

  else if (theme === 'theme-lunaire') {
    switchTabEffect(TABS_SELECTOR, 'tab-effect-underline', TAB_EFFECTS);
    // Idées :
    // switchTabEffect(TABS_SELECTOR, 'tab-effect-wave', TAB_EFFECTS);
  }

  else if (theme === 'theme-galactique') {
    switchTabEffect(TABS_SELECTOR, 'tab-effect-aurora', TAB_EFFECTS);
  }

  else if (theme === 'theme-stellaire') {
    // Sobre : pas d’effet (on enlève tout)
    switchTabEffect(TABS_SELECTOR, '', TAB_EFFECTS);
  }

  else {
    // Thème non listé → on nettoie
    switchTabEffect(TABS_SELECTOR, '', TAB_EFFECTS);
  }
}

/**
 * Modification tailles lune sur différents écrans (Responsive Lune)
 */
export function adaptLuneResponsive() {
  const lune = document.querySelector('body.theme-lunaire #svg-lune-widget');
  if (!lune) return;

  const width = window.innerWidth;
  const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

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
  else {
    lune.style.cssText = '';
    lune.removeAttribute('style');
  }
}
