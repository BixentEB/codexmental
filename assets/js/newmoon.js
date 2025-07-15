// ========================================================
// newmoon.js – Version cohérente Codex Mental
// ========================================================

import SunCalc from "https://esm.sh/suncalc";

// Calcul Meeus-like de la phase
function calculateMoonPhase(date) {
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = (daysSince % synodicMonth) / synodicMonth;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  return {
    phaseFraction: phase,
    illuminationPercent: +(illumination * 100).toFixed(1)
  };
}

// Création du SVG
function createMoonSVG(illumination, orientationAngle) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.style.width = "100%";
  svg.style.height = "100%";

  // Image de lune fantôme
  const ghost = document.createElementNS(svgNS, "image");
  ghost.setAttribute("href", "/img/lune/lune-pleine.png");
  ghost.setAttribute("x", "0");
  ghost.setAttribute("y", "0");
  ghost.setAttribute("width", "200");
  ghost.setAttribute("height", "200");
  svg.appendChild(ghost);

  // ClipPath
  const defs = document.createElementNS(svgNS, "defs");
  const clip = document.createElementNS(svgNS, "clipPath");
  clip.setAttribute("id", "clipMoon");
  const phaseEllipse = document.createElementNS(svgNS, "ellipse");
  phaseEllipse.setAttribute("cx", 100 + (illumination - 0.5) * 100);
  phaseEllipse.setAttribute("cy", "100");
  phaseEllipse.setAttribute("rx", "100");
  phaseEllipse.setAttribute("ry", "100");
  clip.appendChild(phaseEllipse);
  defs.appendChild(clip);
  svg.appendChild(defs);

  // Image éclairée
  const lit = document.createElementNS(svgNS, "image");
  lit.setAttribute("href", "/img/lune/lune-pleine.png");
  lit.setAttribute("x", "0");
  lit.setAttribute("y", "0");
  lit.setAttribute("width", "200");
  lit.setAttribute("height", "200");
  lit.setAttribute("clip-path", "url(#clipMoon)");
  lit.setAttribute("transform", `rotate(${orientationAngle},100,100)`);
  svg.appendChild(lit);

  return svg;
}

// Initialisation
async function initMoonWidget() {
  // Recherche ou création du conteneur
  let container = document.getElementById("svg-lune-widget");
  if (!container) {
    container = document.createElement("div");
    container.id = "svg-lune-widget";
    document.body.appendChild(container);
  }

  function render(coords) {
    const now = new Date();
    const phaseData = calculateMoonPhase(now);
    const pos = SunCalc.getMoonPosition(now, coords.lat, coords.lng);
    const orientation = (pos.parallacticAngle || 0) * (180 / Math.PI);

    container.innerHTML = "";
    const svg = createMoonSVG(phaseData.illuminationPercent / 100, orientation);
    container.appendChild(svg);

    // Pour le debug
    console.log("🌙 Widget lunaire mis à jour", phaseData);
  }

  function getCoordsAndRender() {
    const fallback = { lat: 45.75, lng: 4.85 };
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => render({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => render(fallback)
      );
    } else {
      render(fallback);
    }
  }

  getCoordsAndRender();
  setInterval(getCoordsAndRender, 60 * 60 * 1000);
}

document.addEventListener("DOMContentLoaded", initMoonWidget);
