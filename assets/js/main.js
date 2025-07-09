// ========================================================
// main.js – Point d'entrée central de Codex Mental
// ========================================================

// === 📦 Modules à effets de bord ===
import '/assets/js/canvas.js';
import '/assets/js/theme-hours.js';
import '/assets/js/theme-special.js';
import '/assets/js/theme-cards.js';
import '/assets/js/anti-copy.js';
import '/assets/js/viewer.js'; // ✅ nouveau moteur unifié blog + atelier
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

  // 🌌 Étoile filante pour le thème stellaire
  if (currentTheme === "theme-stellaire") {
    console.log("🌌 Lancement de l’étoile filante...");
    initEtoileFilante();
  }

  // 🌙 Widget lunaire SVG pour thème lunaire
  if (currentTheme === "theme-lunaire") {
    import('/assets/js/lune-svg.js')
      .then(module => {
        console.log("🌙 Lune SVG chargée.");
        module.updateLunarWidget(currentTheme);
      })
      .catch(err => console.error("❌ Échec chargement lune-svg.js :", err));
  }

  // 🧩 Injection menu & footer
  injectPartial('menu-placeholder', '/menu.html');
  injectPartial('footer-placeholder', '/footer.html');

  // CHARGEMENT EVENTS DYNAMIQUES ASTRO
  // 📅 Charger événements astronomiques
  import { getLunarPhaseEvent } from '/assets/js/lune-phase.js';

// 🟢 Appel du calcul dynamique
const lunarEvent = getLunarPhaseEvent();

// 🟢 Fetch du JSON des autres événements
fetch('/arc/events-astro-2025.json')
  .then(res => res.json())
  .then(data => {
    // On conserve tous les événements qui tombent aujourd'hui
    const today = new Date();
    const todayExtraEvents = data.filter(ev => {
      const date = new Date(ev.date);
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      );
    });

    // On regroupe la lune + les autres événements
    const allEventsToday = [lunarEvent, ...todayExtraEvents];

    // On affiche le tout
    afficherNoteAstro(allEventsToday);
  });


  // 🛰️ Intro animée + badge astro
  lancerIntroAstro();
  activerBadgeAstro();
});

// === ⬆️ Bouton de retour en haut
setupScrollButton();

// === 🍔 Log bouton burger (si présent)
document.getElementById("menu-toggle")?.addEventListener("click", () => {
  console.log("Burger clicked");
});

// === 🌐 Rendre globale la fonction de changement de thème
window.setTheme = setTheme;
