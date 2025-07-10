// ========================================================
// theme-observer.js – Observer les changements de thème
// ========================================================

import { lancerIntroAstro } from '/assets/js/intro-astro.js';
import { initEtoileFilante } from '/assets/js/etoile-filante.js';

// Variable pour éviter les déclenchements multiples
let currentAlertText = "";
let previousTheme = null;

// === 🎯 Fonction pour charger le widget approprié selon le thème
function loadThemeWidget(theme) {
  switch(theme) {
    case "lunaire":
      console.log("🌙 Chargement du widget lunaire...");
      Promise.all([
        import('https://esm.sh/suncalc'),
        import('/assets/js/newmoon.js')
      ])
        .then(([SunCalcModule, moonModule]) => {
          console.log("🌙 Moon widget loaded.");
          moonModule.updateNewMoonWidget(SunCalcModule.default);
        })
        .catch(err => console.error("❌ Échec chargement newmoon.js :", err));
      break;
      
    case "solaire":
      console.log("☀️ Chargement du widget solaire...");
      // Quand tu auras ton module solaire :
      // import('/assets/js/sun-widget.js')
      //   .then(sunModule => {
      //     console.log("☀️ Sun widget loaded.");
      //     sunModule.updateSunWidget();
      //   })
      //   .catch(err => console.error("❌ Échec chargement sun-widget.js :", err));
      break;
      
    case "stellaire":
      console.log("⭐ Activation des étoiles filantes...");
      initEtoileFilante();
      break;
      
    default:
      console.log("🎨 Thème par défaut, pas de widget spécifique");
  }
}

// === 🔄 Fonction pour détecter le thème actuel
function detectCurrentTheme() {
  const body = document.body;
  
  if (body.classList.contains("theme-lunaire")) {
    return "lunaire";
  } else if (body.classList.contains("theme-solaire")) {
    return "solaire";
  } else if (body.classList.contains("theme-stellaire")) {
    return "stellaire";
  }
  
  return null;
}

// === 🌗 Fonction principale d'initialisation de l'observer
export function initThemeObserver() {
  const observer = new MutationObserver(() => {
    const currentTheme = detectCurrentTheme();
    const fullClassName = document.body.className;
    
    // Ne déclenche l'action que si le thème a vraiment changé
    if (currentTheme !== previousTheme) {
      console.log(`🔄 Changement de thème: ${previousTheme} → ${currentTheme}`);
      
      // Réinitialise l'intro
      currentAlertText = "";
      lancerIntroAstro(fullClassName);
      
      // Charge le widget approprié
      if (currentTheme) {
        loadThemeWidget(currentTheme);
      }
      
      previousTheme = currentTheme;
    }
  });
  
  // Démarre l'observation
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
  
  // Initialise le thème actuel
  previousTheme = detectCurrentTheme();
  
  console.log("🎯 Theme observer initialized");
  return observer;
}

// === 🔧 Fonction utilitaire pour forcer un rechargement du widget
export function reloadCurrentThemeWidget() {
  const currentTheme = detectCurrentTheme();
  if (currentTheme) {
    console.log(`🔄 Rechargement forcé du widget: ${currentTheme}`);
    loadThemeWidget(currentTheme);
  }
}
