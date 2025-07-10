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

  // 🌌 Étoile filante
  if (currentTheme === "theme-stellaire") {
    initEtoileFilante();
  }

  // 🌙 Widget lunaire
  if (currentTheme === "theme-lunaire") {
    Promise.all([
      import('https://esm.sh/suncalc'),
      import('/assets/js/newmoon.js')
    ])
    .then(([SunCalcModule, moonModule]) => {
      moonModule.updateNewMoonWidget(SunCalcModule.default);
    })
    .catch(err => console.error("❌ Échec chargement lune :", err));
  }

  // Injection du menu et footer
  injectPartial('menu-placeholder', '/menu.html');
  injectPartial('footer-placeholder', '/footer.html');

  // Chargement événements astro
  fetch('/arc/events-astro-2025.json')
    .then(res => res.json())
    .then(data => afficherNoteAstro(data));

  lancerIntroAstro();
  activerBadgeAstro();
});

// === ⬆️ Bouton de retour en haut
setupScrollButton();

// === 🍔 Log bouton burger
document.getElementById("menu-toggle")?.addEventListener("click", () => {
  console.log("Burger clicked");
});

// === 🌐 Fonction de changement de thème
window.setTheme = (theme) => {
  localStorage.setItem('codexTheme', theme);
  document.body.className = theme;
  setTheme(theme);

  // Recharge les infos astro après changement
  fetch('/arc/events-astro-2025.json')
    .then(res => res.json())
    .then(data => afficherNoteAstro(data));

  lancerIntroAstro();
};
