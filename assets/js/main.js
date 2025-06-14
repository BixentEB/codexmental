// ========================================================
// main.js – Point d'entrée central de Codex Mental
// ========================================================

// ================================
// 🎨 Initialisation du thème
// ================================

(function initTheme() {
  const savedTheme = localStorage.getItem('codexTheme') || 'stellaire'; // <== nom cohérent
  const themeLink = document.getElementById('theme-style');
  if (themeLink) {
    themeLink.href = `/assets/css/themes/theme-${savedTheme}.css`;
  }
})();

// === 📦 Modules à effets de bord ===
import '/assets/js/canvas.js';          
import '/assets/js/lune.js';            
import '/assets/js/theme-hours.js';     
import '/assets/js/theme-special.js';   

// === 🔧 Modules à fonctions exportées explicites ===
import { setTheme } from '/assets/js/theme-engine.js';
import { injectPartial } from '/assets/js/partials.js';
import { setupScrollButton } from '/assets/js/scroll.js';
import { afficherNoteAstro, lancerIntroAstro } from '/assets/js/intro-astro.js';
import { activerBadgeAstro } from '/assets/js/badge-astro.js';

// Rendre setTheme accessible globalement
window.setTheme = setTheme;

// === 🧩 Injecter dynamiquement le menu et le footer ===
injectPartial('menu-placeholder', '/menu.html');
injectPartial('footer-placeholder', '/footer.html');

// === ⬆️ Activer le bouton de retour en haut ===
setupScrollButton();

// === 🌠 Récupérer et afficher les événements astronomiques ===
fetch('/arc/events-astro-2025.json')
  .then(res => res.json())
  .then(data => afficherNoteAstro(data));

// === 🛰️ Lancer le message d’intro animé ===
lancerIntroAstro();

// === 💫 Afficher le badge si événement présent ===
activerBadgeAstro();

// === 🍔 Log burger menu (optionnel)
document.getElementById("menu-toggle")?.addEventListener("click", () => {
  console.log("Burger clicked");
});

// === 🌌 Étoile filante pour thème stellaire uniquement ===
import { initEtoileFilante } from "/assets/js/etoile-filante.js";

window.addEventListener("DOMContentLoaded", () => {
  if (document.body.classList.contains("theme-stellaire")) {
    console.log("🌌 Lancement de l’étoile filante...");
    initEtoileFilante();
  }
});
