// modules.js – Chargement centralisé des widgets du Lab Codex

// Chargement thème stellaire forcé
if (location.pathname === '/lab/index.html') {
  document.body.className = 'theme-stellaire lab';
  localStorage.setItem('codex-theme', 'theme-stellaire');
}

// Chargement manuel des modules à activer
if (window.location.pathname.endsWith("/lab/index.html")) {
  import("/lab/modules/dashboard/radar-mini.js");
  import("/lab/modules/simul-moon/simul-moon-canvas.js")
    .then(mod => mod.launchSimulMoonCanvas());
  import("/lab/modules/dashboard/simul-system.js"); // ✅ sans fonction appelée
}

console.log("✅ Modules du lab chargés");
