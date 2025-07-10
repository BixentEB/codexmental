// ========================================================
// theme-observer.js – Observer les changements de thème
// ========================================================

import { lancerIntroAstro, afficherNoteAstro } from '/assets/js/intro-astro.js';
import { initEtoileFilante, stopEtoileFilante } from '/assets/js/etoile-filante.js';

// Variable pour éviter les déclenchements multiples
let currentAlertText = "";
let previousTheme = null;
let astroData = null; // Cache pour les données astro

// === 🎯 Fonction pour charger le widget approprié selon le thème
function loadThemeWidget(theme, previousTheme) {
  // D'abord, arrête les widgets du thème précédent
  if (previousTheme) {
    stopPreviousThemeWidget(previousTheme);
  }
  
  // Puis démarre le nouveau widget
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

// === 🛑 Fonction pour arrêter les widgets du thème précédent
function stopPreviousThemeWidget(previousTheme) {
  switch(previousTheme) {
    case "stellaire":
      console.log("🛑 Arrêt des étoiles filantes...");
      stopEtoileFilante();
      break;
      
    case "lunaire":
      // Si tu as besoin d'arrêter quelque chose pour le widget lunaire
      console.log("🛑 Nettoyage du widget lunaire...");
      break;
      
    case "solaire":
      // Si tu as besoin d'arrêter quelque chose pour le widget solaire
      console.log("🛑 Nettoyage du widget solaire...");
      break;
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
  // Charge les données astro une seule fois
  if (!astroData) {
    fetch('/arc/events-astro-2025.json')
      .then(res => res.json())
      .then(data => {
        astroData = data;
        console.log("📡 Données astro chargées");
      })
      .catch(err => console.error("❌ Erreur chargement données astro:", err));
  }
  
  const observer = new MutationObserver(() => {
    const currentTheme = detectCurrentTheme();
    const fullClassName = document.body.className;
    
    // Ne déclenche l'action que si le thème a vraiment changé
    if (currentTheme !== previousTheme) {
      console.log(`🔄 Changement de thème: ${previousTheme} → ${currentTheme}`);
      
      // Réinitialise l'intro et recharge les données astro
      currentAlertText = "";
      
      // Recharge les données astro pour le nouveau thème
      if (astroData) {
        afficherNoteAstro(astroData, fullClassName);
      } else {
        // Si les données ne sont pas encore chargées, lance juste l'intro
        lancerIntroAstro(fullClassName);
      }
      
      // Charge le widget approprié
      if (currentTheme) {
        loadThemeWidget(currentTheme, previousTheme);
      } else {
        // Si aucun thème spécifique, arrête quand même l'ancien
        stopPreviousThemeWidget(previousTheme);
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
  const fullClassName = document.body.className;
  
  if (currentTheme) {
    console.log(`🔄 Rechargement forcé du widget: ${currentTheme}`);
    loadThemeWidget(currentTheme);
  }
  
  // Recharge aussi les données astro
  if (astroData) {
    afficherNoteAstro(astroData, fullClassName);
  }
}
