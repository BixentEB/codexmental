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

  // Gestion des thèmes spécifiques
  if (currentTheme === "theme-stellaire") {
    initEtoileFilante();
  }

  if (currentTheme === "theme-lunaire") {
    loadMoonWidget();
  }

  // Log bouton burger (debug)
  document.getElementById("menu-toggle")?.addEventListener("click", () => {
    console.log("Burger clicked");
  });
});

// === 🌐 Fonction de changement de thème
window.setTheme = (theme) => {
  localStorage.setItem('codexTheme', theme);
  document.body.className = theme;
  setTheme(theme);

  // Gestion des effets spécifiques
  if (theme === "theme-stellaire") {
    initEtoileFilante();
  } else if (theme === "theme-lunaire") {
    loadMoonWidget();
  }
};

// === 🌙 Chargement asynchrone du widget lunaire
function loadMoonWidget() {
  // Nettoyage préalable
  const existingWidget = document.getElementById('svg-lune-widget');
  if (existingWidget) existingWidget.remove();

  // Chargement dynamique
  Promise.all([
    import('https://esm.sh/suncalc'),
    import('/assets/js/newmoon.js')
  ])
    .then(([SunCalc, moonModule]) => {
      moonModule.updateNewMoonWidget(SunCalc.default);
    })
    .catch(err => {
      console.error("Erreur de chargement du widget lunaire:", err);
      // Fallback visuel optionnel
      document.body.insertAdjacentHTML('beforeend', 
        '<div id="moon-error">🌙</div>');
    });
}
