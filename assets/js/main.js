// ========================================================
// main.js – Point d'entrée central de Codex Mental
// ========================================================

// === 📦 Modules à effets de bord ===
import '/assets/js/canvas.js';
import '/assets/js/theme-hours.js';
import '/assets/js/theme-special.js';
import '/assets/js/theme-cards.js';
import '/assets/js/anti-copy.js';


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
  setTheme(savedTheme); // ← important pour réactiver les effets visuels !
})();

// === 🌌 Activer les étoiles filantes (si thème stellaire)
window.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("theme-stellaire")) {
    console.log("🌌 Lancement de l’étoile filante...");
    initEtoileFilante();
  }
});

// === ⬆️ Bouton de retour en haut
setupScrollButton();

// === 🧩 Injection menu & footer
injectPartial('menu-placeholder', '/menu.html');
injectPartial('footer-placeholder', '/footer.html');

// === 📅 Charger événements astronomiques
fetch('/arc/events-astro-2025.json')
  .then(res => res.json())
  .then(data => afficherNoteAstro(data));

// === 🛰️ Intro animée + badge astro
lancerIntroAstro();
activerBadgeAstro();

// === 🍔 Log bouton burger (si présent)
document.getElementById("menu-toggle")?.addEventListener("click", () => {
  console.log("Burger clicked");
});

// === 🌐 Rendre la fonction globale pour les boutons
window.setTheme = setTheme;

// === Import Lune dynamique SVG 
if (currentTheme === 'theme-lunaire') {
  import('/assets/js/lune-svg.js').then(module => {
    module.updateLunarWidget(currentTheme);
  });
}


