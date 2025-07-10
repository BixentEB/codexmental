// ========================================================
// theme-observer.js – Détection dynamique du changement de thème
// ========================================================

import { afficherNoteAstro, lancerIntroAstro } from "/assets/js/intro-astro.js";

// Variable globale pour stocker les événements JSON (injectée depuis main.js)
export let astroData = [];

/**
 * Retourne le nom du thème actif sous forme simple ("lunaire", "solaire", "stellaire", "galactique")
 */
function detectCurrentTheme() {
  const body = document.body;
  if (body.classList.contains("theme-lunaire")) return "lunaire";
  if (body.classList.contains("theme-solaire")) return "solaire";
  if (body.classList.contains("theme-stellaire")) return "stellaire";
  if (body.classList.contains("theme-galactique")) return "galactique";
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

    if (currentTheme === previousTheme) {
      console.log("ℹ️ Même thème que précédemment, pas de relance.");
      return;
    }

    previousTheme = currentTheme;

    // Nettoyer le widget lunaire si présent
    const moon = document.getElementById("svg-lune-widget");
    if (moon) {
      console.log("🧹 Suppression du widget lunaire.");
      moon.remove();
    }

    // Reset du texte
    if (typeof currentAlertText !== "undefined") {
      currentAlertText = "";
    } else {
      console.warn("⚠️ currentAlertText est indéfini !");
    }

    // Recharger le widget et infos selon thème
    if (currentTheme === "lunaire") {
      console.log("🌙 Thème lunaire : chargement SunCalc + astro-lunaire + newmoon.js");
      Promise.all([
        import("https://esm.sh/suncalc"),
        import("/assets/js/newmoon.js"),
        import("/assets/js/astro-lunaire.js")
      ])
        .then(([SunCalcModule, moonModule, lunarModule]) => {
          console.log("🌙 Modules lunaires chargés.");
          // Met à jour la lune SVG
          moonModule.updateNewMoonWidget(SunCalcModule.default);
          // Récupère et injecte le texte
          if (typeof lunarModule.getFullMoonInfo === "function") {
            window.currentAlertText = lunarModule.getFullMoonInfo();
          } else {
            window.currentAlertText = "🌙 Aucune donnée lunaire disponible.";
          }
          lancerIntroAstro(currentTheme);
        })
        .catch(err => console.error("❌ Échec chargement modules lunaires:", err));
      return; // Ne passe pas plus bas
    }

    // Pour le thème solaire (bientôt)
    if (currentTheme === "solaire") {
      console.log("☀️ Thème solaire activé. (à compléter)");
      window.currentAlertText = "☀️ Les données solaires ne sont pas encore disponibles.";
      lancerIntroAstro(currentTheme);
      return;
    }

    // Pour stellaire ou galactique
    if (currentTheme === "stellaire" || currentTheme === "galactique") {
      console.log(`🌌 Thème ${currentTheme} activé, chargement des événements.`);
      if (astroData?.length) {
        afficherNoteAstro(astroData, currentTheme);
      } else {
        window.currentAlertText = `🌌 Aucune donnée pour le thème ${currentTheme}.`;
        lancerIntroAstro(currentTheme);
      }
      return;
    }

  }).observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
}
