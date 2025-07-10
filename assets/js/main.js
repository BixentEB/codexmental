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
import { initThemeObserver } from '/assets/js/theme-observer.js';

// === 🌠 Initialiser le thème visuel dès le chargement
(function initTheme() {
  const savedTheme = localStorage.getItem('codexTheme') || 'theme-stellaire';
  // Retire toutes les anciennes classes de thème avant d'ajouter la nouvelle
  document.body.classList.remove(
    ...Array.from(document.body.classList).filter(c => c.startsWith('theme-'))
  );
  document.body.classList.add(savedTheme);
  setTheme(savedTheme);
})();

// === DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  injectPartial('menu-placeholder', '/menu.html');
  injectPartial('footer-placeholder', '/footer.html');
  activerBadgeAstro();
  setupScrollButton();

  // === Démarre l'observateur de thème (il gère tout l'astro et les widgets)
  initThemeObserver();
});

// === 🍔 Log bouton burger (si présent)
document.getElementById("menu-toggle")?.addEventListener("click", () => {
  console.log("Burger clicked");
});

// === 🌐 Rendre globale la fonction de changement de thème
window.setTheme = (theme) => {
  localStorage.setItem('codexTheme', theme);
  // Retire toutes les anciennes classes de thème avant d'ajouter la nouvelle
  document.body.classList.remove(
    ...Array.from(document.body.classList).filter(c => c.startsWith('theme-'))
  );
  document.body.classList.add(theme);
  setTheme(theme);
};
