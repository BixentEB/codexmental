// ========================================================
// main.js – Point d'entrée central de Codex Mental
// ========================================================

// === 📦 Modules à effets de bord ===
// Ces modules s’auto-initialisent à l’importation si nécessaire
import './canvas.js';          // Canvas d’arrière-plan dynamique (stellar/galactic)
import './lune.js';            // Widget lunaire flottant
import './theme-hours.js';     // Thèmes en fonction de l’heure
import './theme-special.js';   // Thèmes pour fêtes/saisons

// === 🔧 Modules à fonctions exportées explicites ===
import { setTheme } from './theme-engine.js';
import { injectPartial } from './partials.js';
import { setupScrollButton } from './scroll.js';
import { afficherNoteAstro, lancerIntroAstro } from './intro-astro.js';
import { activerBadgeAstro } from './badge-astro.js';

// === 🪐 Appliquer le thème au chargement ===
const savedTheme = localStorage.getItem('codexTheme') || 'theme-stellaire';
setTheme(savedTheme);

// === 🧩 Injecter dynamiquement le menu et le footer ===
injectPartial('menu-placeholder', '/menu.html');
injectPartial('footer-placeholder', '/footer.html');

// === ⬆️ Activer le bouton de retour en haut ===
setupScrollButton();

// === 🌠 Récupérer et afficher les événements astronomiques ===
fetch('./arc/events-astro-2025.json')
  .then(res => res.json())
  .then(data => afficherNoteAstro(data));

// === 🛰️ Lancer le message d’intro animé ===
lancerIntroAstro();

// === 💫 Afficher le badge si événement présent ===
activerBadgeAstro();
