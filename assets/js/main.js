// ========================================================
// main.js – Point d'entrée central de Codex Mental
// ========================================================

// === 📦 Modules à effets de bord ===
import '/assets/js/canvas.js';

/*import '/assets/js/theme-hours.js';
import '/assets/js/theme-special.js';*/ /*supprimés car vides*/

import '/assets/js/theme-cards.js';
import '/assets/js/anti-copy.js';
import '/assets/js/viewer.js';
import '/assets/js/cookie.js';
import '/assets/js/onglets.js';
import '/assets/js/table.js';
import '/assets/js/new-badge.js'; // Module ajoutant un badge "new" aux articles récemment ajoutés avec mention data-date
import '/assets/js/openmenu.js'; // Module pour ouvrir et fermer auto les menus <details> blogs et atelier

// === 🔧 Modules à fonctions exportées ===
import { setTheme } from '/assets/js/theme-engine.js';
import { injectPartial } from '/assets/js/partials.js';
import { setupScrollButton } from '/assets/js/scroll.js';
import { activerBadgeAstro } from '/assets/js/badge-astro.js';
import { initEtoileFilante } from '/assets/js/etoile-filante.js';
import { initThemeObserver } from '/assets/js/theme-observer.js';

// === 🧭 Alias de thème (main -> favori admin), tout en respectant le choix visiteur
import { resolveInitialTheme, resolveAlias } from '/assets/js/theme-alias.js';

// === 🌠 Initialiser le thème visuel dès le chargement
(function initTheme() {
  if (location.pathname === '/lab/index.html') return; // 🧪 Cas spécial : dashboard impose son propre thème

  // 1) Choix visiteur (localStorage) sinon 'theme-main'
  const initial = resolveInitialTheme();            // ex: 'theme-main' si aucun choix visiteur
  document.body.className = initial;                // on pose la classe telle quelle (utile pour le preload CSS)

  // 2) Résolution d'alias (si 'theme-main' -> thème favori admin)
  const effective = resolveAlias(initial);          // ex: 'theme-stellaire' selon ta config admin

  // 3) Application des effets via theme-engine (gère canvas/particles/soleil…)
  setTheme(effective);

  // 4) Mémoriser sur le DOM le thème effectif (pratique pour d'autres modules)
  document.body.dataset.effectiveTheme = effective;
})();

// === DOM Ready
window.addEventListener("DOMContentLoaded", () => {
  // Utilise le thème effectif (après alias) pour déclencher les effets optionnels
  const currentEffective =
    document.body.dataset.effectiveTheme || resolveAlias(document.body.className);

  injectPartial('menu-placeholder', '/menu.html');
  injectPartial('footer-placeholder', '/footer.html');
  activerBadgeAstro();
  setupScrollButton();

  if (currentEffective === "theme-stellaire") {
    // étoile filante uniquement pour stellaire (comme avant)
    initEtoileFilante();
  }

  if (currentEffective === "theme-lunaire") {
    import('/assets/js/newmoon.js')
      .then(module => module.updateNewMoonWidget())
      .catch(err => console.error("❌ Failed to load newmoon.js:", err));
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
  // 1) Sauvegarder le choix explicite de l'utilisateur
  localStorage.setItem('codexTheme', theme);

  // 2) Afficher immédiatement la classe demandée (utile pour CSS)
  document.body.className = theme;

  // 3) Résoudre l'alias si l'utilisateur passe 'theme-main'
  const effective = resolveAlias(theme);

  // 4) Appliquer via theme-engine
  setTheme(effective);

  // 5) Mettre à jour le dataset pour les autres modules
  document.body.dataset.effectiveTheme = effective;

  // 6) Déclencher effets optionnels selon le thème effectif
  if (effective === "theme-stellaire") {
    initEtoileFilante();
  }

  if (effective === "theme-lunaire") {
    import('/assets/js/newmoon.js')
      .then(module => module.updateNewMoonWidget())
      .catch(err => console.error("❌ Failed to load newmoon.js:", err));
  }
};
