// ========================================================
// theme-observer.js – Détection dynamique du changement de thème
// Gère :
//   - Lancement intro-astro
//   - Nettoyage et rechargement des widgets
//   - Logs complets
// ========================================================

// Variable globale pour stocker les événements JSON (injectée depuis main.js)
export let astroData = [];

/**
 * Retourne le nom du thème actif sous forme simple ("lunaire", "solaire", "stellaire")
 */
function detectCurrentTheme() {
  const body = document.body;
  if (body.classList.contains("theme-lunaire")) return "lunaire";
  if (body.classList.contains("theme-solaire")) return "solaire";
  if (body.classList.contains("theme-stellaire")) return "stellaire";
  return "";
}

/**
 * Relance l'affichage et widgets selon le thème actif
 */
export function initThemeObserver() {
  let previousTheme = null;

  new MutationObserver(() => {
    const currentTheme = detectCurrentTheme();
    console.log(`🔄 Changement de thème détecté : ${previousTheme} → ${currentTheme}`);

    if (!currentTheme) {
      console.warn("⚠️ Aucun thème détecté.");
      return;
    }

    // Évite de relancer si même thème
    if (currentTheme === previousTheme) {
      console.log("ℹ️ Même thème que précédemment, pas de relance.");
      return;
    }

    previousTheme = currentTheme;

    // Nettoie le widget lunaire si présent
    const moon = document.getElementById("svg-lune-widget");
    if (moon) {
      console.log("🧹 Suppression du widget lunaire.");
      moon.remove();
    }

    // Reset le texte
    if (typeof currentAlertText !== "undefined") {
      currentAlertText = "";
    } else {
      console.warn("⚠️ currentAlertText est indéfini !");
    }

    // Relance intro astro
    if (typeof afficherNoteAstro === "function" && typeof lancerIntroAstro === "function") {
      if (astroData?.length) {
        afficherNoteAstro(astroData, currentTheme);
      } else {
        console.warn("⚠️ Pas de données astro disponibles (astroData vide).");
        lancerIntroAstro(currentTheme);
      }
    } else {
      console.error("❌ Les fonctions intro-astro ne sont pas disponibles.");
    }

    // Recharger le widget lunaire si nécessaire
    if (currentTheme === "lunaire") {
      console.log("🌙 Chargement du widget lunaire...");
      Promise.all([
        import('https://esm.sh/suncalc'),
        import('/assets/js/newmoon.js')
      ])
        .then(([SunCalcModule, moonModule]) => {
          console.log("🌙 Moon widget loaded.");
          moonModule.updateNewMoonWidget(SunCalcModule.default);
        })
        .catch(err => console.error("❌ Échec chargement newmoon.js ou SunCalc :", err));
    }

    // Recharger le widget solaire si nécessaire
    if (currentTheme === "solaire") {
      console.log("☀️ Thème solaire activé. (à compléter)");
      // Exemple futur :
      // import('/assets/js/sun-widget.js').then(module => module.initSunWidget());
    }

    // Thème stellaire : juste log
    if (currentTheme === "stellaire") {
      console.log("🌌 Thème stellaire activé. Aucun widget spécifique.");
    }

  }).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
}
