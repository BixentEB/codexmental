// ========================================================
// main.js – Point d'entrée central de Codex Mental 
// ========================================================

// === 📦 Modules à effets de bord ===
import '/assets/js/canvas.js';
import '/assets/js/theme-hours.js';
import '/assets/js/theme-special.js';
import '/assets/js/theme-cards.js';
import '/assets/js/anti-copy.js';
import '/assets/js/viewer.js';
import '/assets/js/cookie.js';
import '/assets/js/onglets.js';
import '/assets/js/table.js';

// === 🔧 Modules à fonctions exportées ===
import { setTheme } from '/assets/js/theme-engine.js';
import { injectPartial } from '/assets/js/partials.js';
import { setupScrollButton } from '/assets/js/scroll.js';
import { activerBadgeAstro } from '/assets/js/badge-astro.js';
import { initEtoileFilante } from '/assets/js/etoile-filante.js';
import { initThemeObserver } from '/assets/js/theme-observer.js';

// === 🌠 Initialiser le thème visuel dès le chargement
(function initTheme() {
  const savedTheme = localStorage.getItem('codexTheme') || 'theme-stellaire';
  document.body.className = savedTheme;
  setTheme(savedTheme);
})();

// === 🌙 Chargeur du widget lunaire
async function loadMoonWidget() {
  try {
    // Chargement dynamique des dépendances
    const SunCalc = await import('https://esm.sh/suncalc');
    const { updateNewMoonWidget } = await import('/assets/js/newmoon.js');
    
    // Nettoyage avant initialisation
    const existingWidget = document.getElementById('svg-lune-widget');
    if (existingWidget) existingWidget.remove();
    
    // Initialisation du widget
    updateNewMoonWidget(SunCalc.default);
    
    // Correction du rendu (force le redraw)
    requestAnimationFrame(() => {
      const widget = document.getElementById('svg-lune-widget');
      if (widget) {
        widget.style.display = 'none';
        requestAnimationFrame(() => widget.style.display = 'block');
      }
    });
  } catch (err) {
    console.error("Erreur de chargement du widget lunaire:", err);
    // Fallback visuel minimaliste
    const fallback = document.createElement('div');
    fallback.id = 'moon-fallback';
    fallback.innerHTML = '🌙';
    document.body.appendChild(fallback);
  }
}

// === DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  const currentTheme = document.body.className;

  // Injection des partials
  injectPartial('menu-placeholder', '/menu.html');
  injectPartial('footer-placeholder', '/footer.html');
  
  // Initialisation des composants
  activerBadgeAstro();
  setupScrollButton();
  initThemeObserver();

  // Effets spécifiques au thème
  if (currentTheme === "theme-stellaire") {
    initEtoileFilante();
  } else if (currentTheme === "theme-lunaire") {
    loadMoonWidget();
  }

  // Debug bouton burger
  document.getElementById("menu-toggle")?.addEventListener("click", () => {
    console.log("Menu burger cliqué");
  });
});

// === 🌐 Fonction de changement de thème
window.setTheme = (theme) => {
  // Sauvegarde et application du thème
  localStorage.setItem('codexTheme', theme);
  document.body.className = theme;
  setTheme(theme);

  // Effets spécifiques
  if (theme === "theme-stellaire") {
    initEtoileFilante();
  } else if (theme === "theme-lunaire") {
    loadMoonWidget();
  }
};
