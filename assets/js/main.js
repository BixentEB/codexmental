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
import { activerBadgeAstro } from '/assets/js/badge-astro.js';
import { initEtoileFilante } from '/assets/js/etoile-filante.js';
import { initThemeObserver } from '/assets/js/theme-observer.js';

// ===== MOON WIDGET LOADER =====
async function loadMoonWidget() {
  try {
    const SunCalc = await import('https://esm.sh/suncalc');
    const { updateNewMoonWidget } = await import('/assets/js/newmoon.js');
    
    // Cleanup
    const existing = document.getElementById('svg-lune-widget');
    if (existing) existing.remove();
    
    // Init
    updateNewMoonWidget(SunCalc.default);
    
    // Force redraw
    requestAnimationFrame(() => {
      const widget = document.getElementById('svg-lune-widget');
      if (widget) {
        widget.style.display = 'none';
        requestAnimationFrame(() => widget.style.display = '');
      }
    });
  } catch (err) {
    console.error("Moon widget error:", err);
  }
}

// ===== THEME HANDLING =====
window.setTheme = (theme) => {
  localStorage.setItem('codexTheme', theme);
  document.body.className = theme;
  setTheme(theme);

  if (theme === "theme-stellaire") {
    initEtoileFilante();
  } else if (theme === "theme-lunaire") {
    loadMoonWidget();
  }
};

// ===== INIT =====
window.addEventListener("DOMContentLoaded", () => {
  // ... (votre code existant)
  
  if (document.body.classList.contains("theme-lunaire")) {
    loadMoonWidget();
  }
});
