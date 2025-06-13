// ========================================================
// main.js – Point d'entrée central de Codex Mental
// ========================================================

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

// === ☀️🌌 Effets visuels selon le thème actif ===
import { initEtoileFilante } from "/assets/js/etoile-filante.js";

window.addEventListener("DOMContentLoaded", async () => {
  const bodyClass = document.body.classList;

  if (bodyClass.contains("theme-stellaire")) {
    console.log("🌌 Lancement de l’étoile filante...");
    initEtoileFilante();
  }

  if (bodyClass.contains("theme-solaire")) {
    console.log("☀️ Lancement du soleil flottant...");
    const { initSoleilFlottant } = await import("/assets/js/canvas-solaire.js");
    initSoleilFlottant();
  }
});
