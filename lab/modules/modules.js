// modules.js – Chargement centralisé des widgets du Lab Codex

// 🔁 Détection du tableau de bord du labo
if (location.pathname === '/lab/index.html') {
  document.body.className = 'theme-stellaire lab';
  localStorage.setItem('codex-theme', 'theme-stellaire');
}

// 📦 Chargement conditionnel si on est bien sur le dashboard du Lab
if (window.location.pathname.endsWith("/lab/index.html")) {
  // === 📚 BASES DE DONNÉES ===
  import("/lab/modules/dashboard/planet-database.js");     // 🧠 Données principales des planètes
  import("/lab/modules/dashboard/moon-database.js");       // 🌙 Dictionnaire structuré des lunes

  // === 🧠 GESTION UI / DONNÉES ===
  import("/lab/modules/dashboard/planet-data.js");         // 🧩 Injection des données dans les 5 blocs
  import("/lab/modules/dashboard/display-moons.js");       // 🌘 Affichage enrichi des lunes

  // === 🔭 VISUALISATION ===
  import("/lab/modules/dashboard/viewer-planete-3d.js");   // 🌍 Canvas 3D rotatif (WebGL)
  import("/lab/modules/dashboard/simul-system.js");        // ☀️ Radar interactif du système solaire
  import("/lab/modules/dashboard/radar-mini.js");          // 🛰️ Radar circulaire décoratif

  // === 🌙 MODULE LUNAIRE ===
  import("/lab/modules/simul-moon/simul-moon-canvas.js")
    .then(mod => mod.launchSimulMoonCanvas());             // 🌕 Simulation canvas de la Lune
}

console.log("✅ Modules du lab chargés");
