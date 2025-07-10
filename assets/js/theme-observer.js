import { lancerIntroAstro, afficherNoteAstro } from '/assets/js/intro-astro.js';
import { initEtoileFilante, stopEtoileFilante } from '/assets/js/etoile-filante.js';

let currentAlertText = "";
let previousTheme = null;
let astroData = null;

function detectCurrentTheme() {
  const body = document.body;
  if (body.classList.contains("theme-lunaire")) return "lunaire";
  if (body.classList.contains("theme-solaire")) return "solaire";
  if (body.classList.contains("theme-stellaire")) return "stellaire";
  if (body.classList.contains("theme-galactique")) return "galactique";
  return null;
}

function loadThemeWidget(theme, previousTheme) {
  if (previousTheme) stopPreviousThemeWidget(previousTheme);
  switch(theme) {
    case "lunaire":
      Promise.all([
        import('https://esm.sh/suncalc'),
        import('/assets/js/newmoon.js')
      ])
      .then(([SunCalcModule, moonModule]) => {
        moonModule.updateNewMoonWidget(SunCalcModule.default);
      });
      break;
    case "stellaire":
      initEtoileFilante();
      break;
    // solaire, galactique : rien pour l’instant
    default:
      // rien de spécial
  }
}

function stopPreviousThemeWidget(previousTheme) {
  if (previousTheme === "stellaire") stopEtoileFilante();
  // lunaire, solaire, galactique : rien pour l’instant
}

export function initThemeObserver() {
  if (!astroData) {
    fetch('/arc/events-astro-2025.json')
      .then(res => res.json())
      .then(data => { astroData = data; });
  }
  const observer = new MutationObserver(() => {
    const currentTheme = detectCurrentTheme();
    if (currentTheme !== previousTheme) {
      currentAlertText = "";
      if (astroData) {
        afficherNoteAstro(astroData, currentTheme);
      } else {
        lancerIntroAstro(currentTheme);
      }
      loadThemeWidget(currentTheme, previousTheme);
      previousTheme = currentTheme;
    }
  });
  observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
  previousTheme = detectCurrentTheme();
  return observer;
}

export function reloadCurrentThemeWidget() {
  const currentTheme = detectCurrentTheme();
  if (currentTheme) {
    loadThemeWidget(currentTheme, null);
  }
  if (astroData) {
    afficherNoteAstro(astroData, currentTheme);
  }
}
