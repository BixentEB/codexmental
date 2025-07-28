// ship-module-narratif.js — Module narratif autonome basé sur l'état du vaisseau
let lastNarrationTime = 0;
let lastNarratedTarget = null;
let currentScenario = null;
let activeLines = [];

const LOG_SCENARIOS = {
  mission: [
    "Analyse spectrographique en cours...",
    "Cartographie topographique temporaire.",
    "Réception du signal de balise planétaire.",
    "Observation du champ magnétique local.",
    "Identification de structures orbitales passives..."
  ],
  standby: [
    "Système en attente d'instructions.",
    "Stabilisation orbitale enclenchée.",
    "Réalignement du gyroscope stellaire.",
    "Monitorage des flux cosmiques passifs...",
    "Cycle d'économie d'énergie engagé."
  ]
};

// Fonction appelée à chaque tick du radar
export function narrate(ship) {
  const now = Date.now();
  const box = document.getElementById('info-missions');
  if (!box || now - lastNarrationTime < 4000) return;

  // Détection de mission active
  if (ship.following && ship.followUntil > now) {
    const name = ship.following.obj.label || ship.following.obj.name || "Cible";
    if (name !== lastNarratedTarget) {
      lastNarratedTarget = name;
      currentScenario = "mission";
      logTitle(`🛰️ MISSION : Survol de ${name}`, box);
      logRandom(currentScenario, box);
      lastNarrationTime = now;
    }
    return;
  }

  // Détection d'attente ou veille
  if (!ship.following && !ship.target && Math.random() < 0.2) {
    currentScenario = "standby";
    logTitle(`⏳ STANDBY`, box);
    logRandom(currentScenario, box);
    lastNarrationTime = now;
  }
}

// Ajoute une ligne de titre
function logTitle(msg, box) {
  const line = document.createElement('div');
  line.textContent = `[${timeNow()}] ${msg}`;
  line.style.color = "cyan";
  line.style.fontWeight = "bold";
  box.appendChild(line);
  activeLines.push(line);
  cleanup(line);
}

// Ajoute une ligne aléatoire du scénario
function logRandom(type, box) {
  const all = LOG_SCENARIOS[type];
  if (!all) return;
  const msg = all[Math.floor(Math.random() * all.length)];
  const line = document.createElement('div');
  line.textContent = `→ ${msg}`;
  line.style.color = "white";
  box.appendChild(line);
  activeLines.push(line);
  cleanup(line, true);
}

function cleanup(line, slow = false) {
  setTimeout(() => line.classList.add("fade-out"), slow ? 8000 : 5000);
  setTimeout(() => line.remove(), slow ? 15000 : 9000);
}

function timeNow() {
  return new Date().toLocaleTimeString();
}
