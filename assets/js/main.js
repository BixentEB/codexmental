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

  injectPartial('menu-placeholder', '/menu.html');
  injectPartial('footer-placeholder', '/footer.html');
  activerBadgeAstro();
  setupScrollButton();

  if (currentTheme === "theme-stellaire") {
    initEtoileFilante();
  }

  if (currentTheme === "theme-lunaire") {
    loadMoonWidget();
  }

  // Init observer qui gère affichage dynamique et animation
  initThemeObserver();
});

// === 🍔 Log bouton burger
document.getElementById("menu-toggle")?.addEventListener("click", () => {
  console.log("Burger clicked");
});

// === 🌐 Fonction de changement de thème
window.setTheme = (theme) => {
  // Nettoyage avant changement
  if (window.cleanupMoonWidget) {
    window.cleanupMoonWidget();
    window.cleanupMoonWidget = null;
  }

  localStorage.setItem('codexTheme', theme);
  document.body.className = theme;
  setTheme(theme);

  if (theme === "theme-stellaire") {
    initEtoileFilante();
  }

  if (theme === "theme-lunaire") {
    loadMoonWidget();
  }
};

// === 🌙 Fonction dédiée au chargement du widget lunaire
function loadMoonWidget() {
  import('/assets/js/newmoon.js')
    .then(module => {
      window.cleanupMoonWidget = module.updateNewMoonWidget();
      console.log("✅ Widget lunaire chargé");
    })
    .catch(err => {
      console.error("❌ Erreur de chargement du module lunaire:", err);
      // Fallback visuel si échec
      const fallback = document.createElement('div');
      fallback.textContent = '🌙';
      fallback.style.position = 'fixed';
      fallback.style.right = '20px';
      fallback.style.bottom = '20px';
      fallback.style.fontSize = '2rem';
      document.body.appendChild(fallback);
      window.cleanupMoonWidget = () => fallback.remove();
    });
}
