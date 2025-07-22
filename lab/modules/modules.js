// modules.js – Chargement centralisé des widgets du Lab Codex

if (location.pathname === '/lab/index.html') {
  document.body.className = 'theme-stellaire lab';
  localStorage.setItem('codex-theme', 'theme-stellaire');
}

if (window.location.pathname.endsWith("/lab/index.html")) {
  import("/lab/modules/dashboard/planet-database.js");     // 🧠 Données planètes
  import("/lab/modules/dashboard/moon-database.js");       // 🌙 Données lunes
  import("/lab/modules/dashboard/planet-data.js");         // 🧩 Injection UI
  import("/lab/modules/dashboard/display-moons.js");       // 🌘 Affichage lune
  import("/lab/modules/dashboard/viewer-planete-3d.js");   // 🔭 Canvas 3D
  import("/lab/modules/dashboard/simul-system.js");        // ☀️ Radar solaire
  import("/lab/modules/dashboard/radar-mini.js");          // 🎯 Radar décoratif
  import("/lab/modules/simul-moon/simul-moon-canvas.js")
    .then(mod => mod.launchSimulMoonCanvas());
}

console.log("✅ Modules du lab chargés");
