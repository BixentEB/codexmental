// modules.js – Chargement centralisé des widgets du Lab Codex

// 🔁 Détection du tableau de bord du labo
if (location.pathname === '/lab/index.html') {
  document.body.className = 'theme-stellaire lab';
  localStorage.setItem('codex-theme', 'theme-stellaire');
}

// 📦 Chargement conditionnel si on est bien sur le dashboard du Lab
if (window.location.pathname.endsWith("/lab/index.html")) {
  // === 📚 BASES DE DONNÉES ===
  import("/lab/modules/dashboard/planet-database.js");        // 🧠 Données principales des planètes
  import("/lab/modules/dashboard/moon-database.js");          // 🌙 Dictionnaire structuré des lunes
  import("/lab/modules/dashboard/colonization-status.js");    // 🏙️ Statuts de colonisation centralisés

  // === 🧠 GESTION UI / AFFICHAGE ===
  import("/lab/modules/dashboard/planet-data.js");            // 🧩 Injection dans les 5 blocs
  import("/lab/modules/dashboard/planet-sections.js");        // 📋 Fonctions de rendu par section
  import("/lab/modules/dashboard/section-switcher.js");       // 🔁 Menu dynamique dans chaque bloc

  // === 🔭 VISUALISATION ===
  import("/lab/modules/dashboard/viewer-planete-3d.js");      // 🌍 Canvas 3D rotatif (WebGL)
  import("/lab/modules/dashboard/simul-system.js");           // ☀️ Radar interactif du système solaire
  import("/lab/modules/dashboard/radar-mini.js");             // 🛰️ Radar circulaire décoratif

  // === 🌙 MODULE LUNAIRE SVG (widget lunaire fixe)
  import("/lab/modules/simul-moon/simul-moon-canvas.js")
    .then(mod => mod.launchSimulMoonCanvas());                // 🌕 Simulation canvas de la Lune
}


// === 📝 Toggle bloc note d'observation (dashboard)
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("toggle-note-btn");
  const noteContent = document.getElementById("codex-note-content");

  if (toggleBtn && noteContent) {
    toggleBtn.addEventListener("click", () => {
      noteContent.classList.toggle("hidden");
    });
  }
});

console.log("✅ Modules du lab chargés");


