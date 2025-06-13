// ========================================================
// main.js – Point d'entrée central de Codex Mental
// ========================================================

// === 📦 Modules à effets de bord ===
// Ces modules s’auto-initialisent à l’importation si nécessaire
import '/assets/js/canvas.js';          // Canvas d’arrière-plan dynamique (stellar/galactic)
import '/assets/js/lune.js';            // Widget lunaire flottant
import '/assets/js/theme-hours.js';     // Thèmes en fonction de l’heure
import '/assets/js/theme-special.js';   // Thèmes pour fêtes/saisons

// === 🔧 Modules à fonctions exportées explicites ===
import { setTheme } from '/assets/js/theme-engine.js';
import { injectPartial } from '/assets/js/partials.js';
import { setupScrollButton } from '/assets/js/scroll.js';
import { afficherNoteAstro, lancerIntroAstro } from '/assets/js/intro-astro.js';
import { activerBadgeAstro } from '/assets/js/badge-astro.js';

window.setTheme = setTheme;

// === 🪐 Appliquer le thème au chargement ===
const savedTheme = localStorage.getItem('codexTheme') || 'theme-stellaire';
setTheme(savedTheme);

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

document.getElementById("menu-toggle")?.addEventListener("click", () => {
  console.log("Burger clicked");
});

import { initSoleilFlottant } from "/assets/js/canvas-solaire.js";

if (document.body.classList.contains("theme-solaire")) {
  initSoleilFlottant();
}

import { initEtoileFilante } from "/assets/js/etoile-filante.js";
