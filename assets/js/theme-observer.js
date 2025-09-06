// ========================================================
// theme-observer.js – Détection dynamique du changement de thème
// (ajout du thème 'sky' et prise en charge de l’alias 'theme-main')
// ========================================================

import { afficherNoteAstro, lancerIntroAstro, setCurrentAlertText } from "/assets/js/intro-astro.js";

/**
 * Retourne un identifiant de thème normalisé :
 *  'lunaire' | 'solaire' | 'stellaire' | 'galactique' | 'sky' | ''
 * On tient compte de l’alias 'theme-main' -> body.dataset.effectiveTheme si dispo.
 */
function detectCurrentTheme() {
  const b = document.body;
  // 1) Si main.js a posé le thème effectif, on l’utilise
  const eff = b.dataset?.effectiveTheme || "";

  // 2) Détecte la classe CSS (utile pour le preload ou si dataset absent)
  const has = (c) => b.classList.contains(c);

  // alias 'theme-main' -> utiliser le thème effectif si présent
  if (has("theme-main")) {
    if (eff.includes("sky")) return "sky";
    if (eff.includes("stellaire")) return "stellaire";
    if (eff.includes("galactique")) return "galactique";
    if (eff.includes("solaire")) return "solaire";
    if (eff.includes("lunaire")) return "lunaire";
    // à défaut, considère 'sky' par défaut pour main
    return "sky";
  }

  if (has("theme-sky")) return "sky";
  if (has("theme-lunaire")) return "lunaire";
  if (has("theme-solaire")) return "solaire";
  if (has("theme-stellaire")) return "stellaire";
  if (has("theme-galactique")) return "galactique";

  return "";
}

/**
 * Gère l'activation d'un thème (charge les bons modules + texte d'alerte)
 */
function handleThemeChange(currentTheme) {
  console.log(`🔄 Activation du thème : ${currentTheme}`);

  // Nettoyer le widget lunaire si présent
  const moon = document.getElementById("svg-lune-widget");
  if (moon) {
    console.log("🧹 Suppression du widget lunaire.");
    moon.remove();
  }

  // ———— LUNAIRE
  if (currentTheme === "lunaire") {
    console.log("🌙 Thème lunaire : chargement modules...");
    Promise.all([
      import("https://esm.sh/suncalc"),
      import("/assets/js/newmoon.js"),
      import("/assets/js/astro-lunaire.js")
    ])
      .then(([SunCalcModule, moonModule, lunarModule]) => {
        moonModule.updateNewMoonWidget(SunCalcModule.default);
        if (typeof lunarModule.getFullMoonInfo === "function") {
          setCurrentAlertText(lunarModule.getFullMoonInfo());
        } else {
          setCurrentAlertText("🌙 Aucune donnée lunaire disponible.");
        }
        lancerIntroAstro(currentTheme);
      })
      .catch(err => console.error("❌ Échec chargement modules lunaires:", err));
    return;
  }

  // ———— SOLAIRE
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

  // ———— SKY (ciel clair) — pas de calcul astro lourd
  if (currentTheme === "sky") {
    setCurrentAlertText("🌤️ Ciel calme pour l’instant — rien d’important à signaler.");
    lancerIntroAstro(currentTheme);
    return;
  }

  // ———— STELLAIRE
  if (currentTheme === "stellaire") {
    console.log("🌟 Thème stellaire : calcul des planètes visibles...");
    import("/assets/js/astro-stellaire.js")
      .then(mod => mod.getStellarInfo())
      .then(text => {
        setCurrentAlertText(text || "🪐 Aucune donnée stellaire.");
        lancerIntroAstro(currentTheme);
      })
      .catch(err => {
        console.error("❌ Erreur stellaire:", err);
        setCurrentAlertText("🪐 Impossible de calculer les données stellaires.");
        lancerIntroAstro(currentTheme);
      });
    return;
  }

  // ———— GALACTIQUE (inchangé pour l’instant)
  if (currentTheme === "galactique") {
    fetch('/arc/events-astro-2025.json')
      .then(res => res.json())
      .then(data => {
        afficherNoteAstro(data, currentTheme);
      })
      .catch(err => {
        console.error("❌ Erreur chargement événements astro:", err);
        setCurrentAlertText("🛰️ Impossible de charger les événements.");
        lancerIntroAstro(currentTheme);
      });
    return;
  }

  // ———— Thème inconnu
  setCurrentAlertText('🌌 Thème inconnu.');
  lancerIntroAstro(currentTheme);
}

/** Initialise l'observateur de thème */
export function initThemeObserver() {
  let previousTheme = null;

  const observer = new MutationObserver(() => {
    const currentTheme = detectCurrentTheme();
    if (!currentTheme || currentTheme === previousTheme) return;
    previousTheme = currentTheme;
    handleThemeChange(currentTheme);
  });

  observer.observe(document.body, { attributes: true, attributeFilter: ["class", "data-effective-theme"] });

  // Activation initiale
  handleThemeChange(detectCurrentTheme());
}
