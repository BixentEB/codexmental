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
import { afficherNoteAstro, lancerIntroAstro } from '/assets/js/intro-astro.js';
import { activerBadgeAstro } from '/assets/js/badge-astro.js';
import { initEtoileFilante } from '/assets/js/etoile-filante.js';

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

  // 🌌 Étoile filante
  if (currentTheme === "theme-stellaire") {
    initEtoileFilante();
  }

  // 🌙 Lune SVG
  if (currentTheme === "theme-lunaire") {
    Promise.all([
      import('https://esm.sh/suncalc'),
      import('/assets/js/newmoon.js')
    ])
      .then(([SunCalcModule, moonModule]) => {
        moonModule.updateNewMoonWidget(SunCalcModule.default);
      })
      .catch(err => console.error("❌ Failed to load newmoon.js or SunCalc:", err));
  }

  // 📅 Charger événements et lancer intro
  fetch('/arc/events-astro-2025.json')
    .then(res => res.json())
    .then(data => {
      afficherNoteAstro(data, currentTheme);
      lancerIntroAstro(currentTheme);
    });
});

// === 🍔 Log bouton burger (si présent)
document.getElementById("menu-toggle")?.addEventListener("click", () => {
  console.log("Burger clicked");
});

// === 🌐 Rendre globale la fonction de changement de thème
window.setTheme = (theme) => {
  localStorage.setItem('codexTheme', theme);
  document.body.className = theme;
  setTheme(theme);

  // 🌌 Étoile filante
  if (theme === "theme-stellaire") {
    initEtoileFilante();
  }

  // 🌙 Lune SVG
  if (theme === "theme-lunaire") {
    Promise.all([
      import('https://esm.sh/suncalc'),
      import('/assets/js/newmoon.js')
    ])
      .then(([SunCalcModule, moonModule]) => {
        moonModule.updateNewMoonWidget(SunCalcModule.default);
      })
      .catch(err => console.error("❌ Failed to load newmoon.js or SunCalc:", err));
  }

  // 📅 Charger événements et relancer intro
  fetch('/arc/events-astro-2025.json')
    .then(res => res.json())
    .then(data => {
      afficherNoteAstro(data, theme);
      lancerIntroAstro(theme);
    });
};
