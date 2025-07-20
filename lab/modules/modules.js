// modules.js – Chargement centralisé des widgets du Lab Codex

// Chargement theme stellaire forcé
if (location.pathname === '/lab/index.html') {
  document.body.className = 'theme-stellaire lab';
  localStorage.setItem('codex-theme', 'theme-stellaire');
}

// Chargement manuel des modules à activer
if (window.location.pathname.endsWith("/lab/index.html")) {
  import("/lab/modules/dashboard/radar-mini.js");
  import("/lab/modules/simul-moon/simul-moon-canvas.js")
    .then(mod => mod.launchSimulMoonCanvas());
  import("/lab/modules/dashboard/simul-systeme.js"); // ✅ ne pas appeler de fonction
}

console.log("✅ Modules du lab chargés");
