// modules.js – Chargement centralisé des widgets du Lab Codex

// Chargement manuel des modules à activer
import { launchSimulMoon } from "/lab/modules/simul-moon/simul-moon.js";

// D'autres imports à activer au besoin :
// import "/lab/modules/widget-solaire/widget-solaire.js";
// import "/lab/modules/widget-astro/widget-astro.js";

// Ne lancer le simulateur que sur /lab/index.html
if (window.location.pathname.endsWith("/lab/index.html")) {
  launchSimulMoon();
}

console.log("✅ Modules du lab chargés");






