// modules.js – Chargement centralisé des widgets du Lab Codex
// 🔧 Version 2.0 - Combinaison de vos règles et de la solution technique

// 🔁 Détection du tableau de bord du labo
if (location.pathname.includes('/lab')) {
  // 🎨 Gestion du thème (votre code original préservé)
  document.body.className = 'theme-stellaire lab';
  localStorage.setItem('codex-theme', 'theme-stellaire');

  // 📦 Ordre de chargement critique avec vos commentaires
  const MODULES = {
    // === 📚 BASES DE DONNÉES ===
    databases: [
      '/lab/modules/dashboard/planet-database.js',        // 🧠 Données principales
      '/lab/modules/dashboard/moon-database.js',          // 🌙 Lunes
      '/lab/modules/dashboard/colonization-status.js'     // 🏙️ Statuts
    ],
    
    // === 🔭 VISUALISATION CORE === 
    core: [
      '/lab/modules/dashboard/simul-system.js',           // ☀️ Radar (chargé en premier)
      '/lab/modules/dashboard/viewer-planete-3d.js',      // 🌍 Viewer 3D
      '/lab/modules/dashboard/radar-mini.js'              // 🛰️ Mini-radar
    ],
    
    // === 🧠 UI DYNAMIQUE ===
    ui: [
      '/lab/modules/dashboard/planet-sections.js',        // 📋 Sections
      '/lab/modules/dashboard/section-switcher.js',       // 🔁 Switch UI
      '/lab/modules/dashboard/planet-data.js'             // 🧩 Data manager
    ],
    
    // === 🌙 MODULES OPTIONNELS ===
    optional: [
      '/lab/modules/simul-moon/simul-moon-canvas.js'      // 🌕 Lune SVG
    ]
  };

  // ⚙️ Chargeur intelligent avec fallback
  async function loadModule(url) {
    try {
      await import(url);
      console.log(`✓ ${url.split('/').pop()}`);
      return true;
    } catch (error) {
      console.warn(`⚠️ Module non critique manquant: ${url.split('/').pop()}`);
      return false;
    }
  }

  // 🚀 Lancement séquentiel contrôlé
  async function init() {
    // 1. Bases de données (critiques)
    for (const url of MODULES.databases) {
      await loadModule(url);
    }

    // 2. Système visuel core
    await Promise.all(MODULES.core.map(loadModule));
    
    // 3. UI dynamique
    for (const url of MODULES.ui) {
      await loadModule(url);
    }

    // 4. Optionnels (parallèle)
    Promise.all(MODULES.optional.map(loadModule))
      .then(() => {
        if (window.launchSimulMoonCanvas) {
          launchSimulMoonCanvas(); // 🌕 Initialisation lune
        }
      });

    // Activation manuelle du radar
    if (window.SolarSystemRadar) {
      new window.SolarSystemRadar('simul-system'); 
    }

    console.log("✅ Modules chargés (ordre contrôlé)");
  }

  // ⏳ Lancement avec timeout de sécurité
  setTimeout(init, 100);
}
