// modules.js – Chargement centralisé des widgets du Lab Codex

  //Chargement theme stellaire forcé
if (location.pathname === '/lab/index.html') {
    document.body.className = 'theme-stellaire lab';
    localStorage.setItem('codex-theme', 'theme-stellaire');
  }

// Chargement manuel des modules à activer
import { launchSimulMoonCanvas } from "/lab/modules/simul-moon/simul-moon-canvas.js";
if (window.location.pathname.endsWith("/lab/index.html")) {
  launchSimulMoonCanvas();
}

console.log("✅ Modules du lab chargés");

// Module central - radar galactique
if (window.location.pathname.endsWith("/lab/index.html")) {
  launchSimulMoonCanvas();
  import("/lab/modules/dashboard/radar-galactique.js");
}



// D'autres imports à activer au besoin :
// import "/lab/modules/widget-solaire/widget-solaire.js";
// import "/lab/modules/widget-astro/widget-astro.js";








