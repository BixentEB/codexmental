// ========================================================
// main.js – Point d'entrée central de Codex Mental
// ========================================================

// === 📦 Modules à effets de bord ===
import '/assets/js/canvas.js';
import '/assets/js/theme-cards.js';
import '/assets/js/anti-copy.js';
import '/assets/js/viewer.js';
import '/assets/js/cookie.js';
import '/assets/js/onglets.js';
import '/assets/js/table.js';
import '/assets/js/new-badge.js';
import '/assets/js/openmenu.js';

// === 🔧 Modules à fonctions exportées ===
import { setTheme } from '/assets/js/theme-engine.js';
import { injectPartial } from '/assets/js/partials.js';
import { setupScrollButton } from '/assets/js/scroll.js';
import { activerBadgeAstro } from '/assets/js/badge-astro.js';
import { initEtoileFilante } from '/assets/js/etoile-filante.js';
import { initThemeObserver } from '/assets/js/theme-observer.js';

// === 🧭 Alias de thème
import { resolveInitialTheme, resolveAlias } from '/assets/js/theme-alias.js';

// === 🌠 Initialiser le thème visuel dès le chargement
(function initTheme() {
  // 🧪 Cas spécial : dashboard ne doit pas être altéré
  if (location.pathname.startsWith('/dashb/')) return;

  const params = new URLSearchParams(window.location.search);
  const forceTheme = params.get('forceTheme'); // "main" si on vient de l'intro

  // 1) Choix visiteur (localStorage) sinon 'theme-main', sauf si ?forceTheme=main
  const initial = (forceTheme === 'main')
    ? 'theme-main'
    : resolveInitialTheme();

  // On pose la classe (utile pour preload CSS)
  document.body.className = initial;

  // 2) Résolution d'alias (si 'theme-main' -> thème favori admin)
  const effective = resolveAlias(initial);

  // 3) Application via theme-engine (canvas/particles/soleil…)
  setTheme(effective);

  // 4) Mémoriser le thème effectif (pour d'autres modules)
  document.body.dataset.effectiveTheme = effective;
})();

// === DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  const currentEffective =
    document.body.dataset.effectiveTheme || resolveAlias(document.body.className);

  injectPartial('menu-placeholder', '/menu.html');
  injectPartial('footer-placeholder', '/footer.html');

  // 🃏 Cartes de thèmes (partial)
  const cardsTarget = document.getElementById('theme-cards-placeholder');
  if (cardsTarget) {
    injectPartial('theme-cards-placeholder', '/assets/partials/theme-cards.html');
  }

  activerBadgeAstro();
  setupScrollButton();

  if (currentEffective === "theme-stellaire") {
    initEtoileFilante();
  }
  if (currentEffective === "theme-lunaire") {
    import('/assets/js/newmoon.js')
      .then(m => m.updateNewMoonWidget())
      .catch(err => console.error("❌ Failed to load newmoon.js:", err));
  }

  initThemeObserver();
});

// === 🍔 Log bouton burger
document.getElementById("menu-toggle")?.addEventListener("click", () => {
  console.log("Burger clicked");
});

// === 🌐 Changement de thème manuel
window.setTheme = (theme) => {
  localStorage.setItem('codexTheme', theme);      // 1) mémorise choix visiteur
  document.body.className = theme;                // 2) classe immédiate
  const effective = resolveAlias(theme);          // 3) alias
  setTheme(effective);                            // 4) effets
  document.body.dataset.effectiveTheme = effective;

  if (effective === "theme-stellaire") initEtoileFilante();
  if (effective === "theme-lunaire") {
    import('/assets/js/newmoon.js')
      .then(m => m.updateNewMoonWidget())
      .catch(err => console.error("❌ Failed to load newmoon.js:", err));
  }
};
