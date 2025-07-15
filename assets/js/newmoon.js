// ========================================================
// Moon Widget – Meeus + SunCalc + SVG
// ========================================================

// SunCalc import (ESM)
import SunCalc from "https://esm.sh/suncalc";

// Fallback: Lyon
const DEFAULT_COORDS = { lat: 45.75, lng: 4.85 };

// Meeus-like phase calculation
function calculateMoonPhase(date) {
  const synodicMonth = 29.53058867;
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const daysSince = (date - knownNewMoon) / (1000 * 60 * 60 * 24);
  const phase = (daysSince % synodicMonth) / synodicMonth;
  const age = phase * synodicMonth;
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  return {
    phaseFraction: phase,
    ageDays: age,
    illuminationPercent: +(illumination * 100).toFixed(1)
  };
}

// Create the SVG
function createMoonSVG(illumination, orientationAngle) {
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("viewBox", "0 0 200 200");
  svg.classList.add("moon-svg");

  // Full moon (ghost)
  const ghost = document.createElementNS(svgNS, "image");
  ghost.setAttribute("href", "/img/lune/lune-pleine.png");
  ghost.setAttribute("x", 0);
  ghost.setAttribute("y", 0);
  ghost.setAttribute("width", 200);
  ghost.setAttribute("height", 200);
  ghost.setAttribute("opacity", "0.2");
  svg.appendChild(ghost);

  // ClipPath for the illuminated crescent
  const defs = document.createElementNS(svgNS, "defs");
  const clip = document.createElementNS(svgNS, "clipPath");
  clip.setAttribute("id", "clipMoon");

  const phaseEllipse = document.createElementNS(svgNS, "ellipse");
  phaseEllipse.setAttribute("cx", 100 + (illumination - 0.5) * 100);
  phaseEllipse.setAttribute("cy", 100);
  phaseEllipse.setAttribute("rx", 100);
  phaseEllipse.setAttribute("ry", 100);
  clip.appendChild(phaseEllipse);
  defs.appendChild(clip);
  svg.appendChild(defs);

  // Illuminated part
  const lit = document.createElementNS(svgNS, "image");
  lit.setAttribute("href", "/img/lune/lune-pleine.png");
  lit.setAttribute("x", 0);
  lit.setAttribute("y", 0);
  lit.setAttribute("width", 200);
  lit.setAttribute("height", 200);
  lit.setAttribute("clip-path", "url(#clipMoon)");
  lit.setAttribute("transform", `rotate(${orientationAngle},100,100)`);
  svg.appendChild(lit);

  return svg;
}

// Main function
async function initMoonWidget() {
  const container = document.getElementById("moon-widget");
  if (!container) return;

  function render(coords) {
    const now = new Date();
    const phaseData = calculateMoonPhase(now);
    const pos = SunCalc.getMoonPosition(now, coords.lat, coords.lng);
    const orientation = (pos.parallacticAngle || 0) * (180 / Math.PI);

    container.innerHTML = ""; // Clear previous
    const svg = createMoonSVG(phaseData.illuminationPercent / 100, orientation);
    container.appendChild(svg);

    // Text info
    const info = document.createElement("div");
    info.className = "moon-info";
    info.innerHTML = `Illumination : ${phaseData.illuminationPercent}%`;
    container.appendChild(info);
  }

  function getCoordsAndRender() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          render({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        },
        () => {
          render(DEFAULT_COORDS);
        }
      );
    } else {
      render(DEFAULT_COORDS);
    }
  }

  getCoordsAndRender();
  // Refresh every hour
  setInterval(getCoordsAndRender, 60 * 60 * 1000);
}

document.addEventListener("DOMContentLoaded", initMoonWidget);
