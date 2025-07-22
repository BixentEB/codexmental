// modules.js – Chargement centralisé des widgets du Lab Codex

if (location.pathname === '/lab/index.html') {
  document.body.className = 'theme-stellaire lab';
  localStorage.setItem('codex-theme', 'theme-stellaire');
}

if (window.location.pathname.endsWith("/lab/index.html")) {
  import("/lab/modules/dashboard/planet-data.js");
  import("/lab/modules/dashboard/planet-database.js"); // ✅ Ajout requis ici
  import("/lab/modules/dashboard/radar-mini.js");
  import("/lab/modules/simul-moon/simul-moon-canvas.js")
    .then(mod => mod.launchSimulMoonCanvas());
  import("/lab/modules/dashboard/viewer-planete-3d.js");
  import("/lab/modules/dashboard/simul-system.js");
}

console.log("✅ Modules du lab chargés");
