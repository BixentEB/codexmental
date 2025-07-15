// ========================================================
// theme-observer.js – Détection dynamique du changement de thème
// ========================================================

import { afficherNoteAstro, lancerIntroAstro, setCurrentAlertText } from "/assets/js/intro-astro.js";

let astroData = [];
let dataLoaded = false;

/**
 * Retourne le nom du thème actif
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
 * Gère l'activation d'un thème
 */
function handleThemeChange(currentTheme) {
  console.log(`🔄 Activation du thème : ${currentTheme}`);

  // Nettoyer le widget lunaire
  const moon = document.getElementById("svg-lune-widget");
  if (moon) {
    console.log("🧹 Suppression du widget lunaire.");
    moon.remove();
  }

  if (currentTheme === "lunaire") {
    console.log("🌙 Thème lunaire : chargement modules...");
    import('/assets/js/newmoon.js')
      .catch(err => console.error("❌ Échec chargement newmoon.js:", err));
    return;
  }

  if (currentTheme === "solaire") {
    console.log("☀️ Thème solaire : chargement des données SunCalc...");
    Promise.all([
      import("https://esm.sh/suncalc"),
      import("/assets/js/astro-solaire.js")
    ])
      .then(([SunCalcModule, solarModule]) => {
        if (typeof solarModule.getSunInfo === "function") {
          setCurrentAlertText(solarModule.getSunInfo());
        } else {
          setCurrentAlertText("☀️ Aucune donnée solaire disponible.");
        }
        lancerIntroAstro(currentTheme);
      })
      .catch(err => {
        console.error("❌ Erreur modules solaires:", err);
        setCurrentAlertText("☀️ Impossible de charger les données solaires.");
        lancerIntroAstro(currentTheme);
      });
    return;
  }

  if (currentTheme === "stellaire" || currentTheme === "galactique") {
    if (!dataLoaded) {
      fetch('/arc/events-astro-2025.json')
        .then(res => res.json())
        .then(data => {
          astroData = data;
          dataLoaded = true;
          console.log("✅ Événements astro chargés.");
          afficherNoteAstro(astroData, currentTheme);
        })
        .catch(err => {
          console.error("❌ Erreur chargement événements astro:", err);
          setCurrentAlertText("🪐 Impossible de charger les événements.");
          lancerIntroAstro(currentTheme);
        });
    } else {
      afficherNoteAstro(astroData, currentTheme);
    }
    return;
  }

  setCurrentAlertText('🌌 Thème inconnu.');
  lancerIntroAstro(currentTheme);
}

/**
 * Initialise l'observateur de thème
 */
export function initThemeObserver() {
  let previousTheme = null;

  const observer = new MutationObserver(() => {
    const currentTheme = detectCurrentTheme();
    if (!currentTheme || currentTheme === previousTheme) return;
    previousTheme = currentTheme;
    handleThemeChange(currentTheme);
  });

  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  // Activation initiale
  const initialTheme = detectCurrentTheme();
  handleThemeChange(initialTheme);
}
