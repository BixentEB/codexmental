// simul-moon.js – Simulateur lunaire avancé avec phase réelle + simulation manuelle
// ==================================================================================

(() => {
  const container = document.createElement("div");
  container.id = "simul-moon";
  container.innerHTML = `
    <div class="moon-wrapper">
      <svg id="simul-svg" viewBox="0 0 100 100" class="moon-phase">
        <defs>
          <clipPath id="simul-clip">
            <circle cx="50" cy="50" r="50" />
          </clipPath>
          <mask id="simul-mask">
            <rect width="100" height="100" fill="white" />
            <path id="simul-shadow-path" fill="black" />
          </mask>
        </defs>
        <circle cx="50" cy="50" r="50" fill="#fff" mask="url(#simul-mask)" clip-path="url(#simul-clip)" />
      </svg>
      <input type="range" id="simul-slider" min="0" max="1" step="0.01" value="0.5">
      <div id="simul-label">Phase : ...</div>
    </div>
  `;

  document.getElementById("simul-moon-container")?.appendChild(container);

  const slider = document.getElementById("simul-slider");
  const shadowPath = document.getElementById("simul-shadow-path");
  const label = document.getElementById("simul-label");

  function getPhaseName(p) {
    if (p < 0.03 || p > 0.97) return "🌑 Nouvelle Lune";
    if (p < 0.22) return "🌒 Premier Croissant";
    if (p < 0.28) return "🌓 Premier Quartier";
    if (p < 0.47) return "🌔 Gibbeuse Croissante";
    if (p <= 0.53) return "🌕 Pleine Lune";
    if (p < 0.72) return "🌖 Gibbeuse Décroissante";
    if (p < 0.78) return "🌗 Dernier Quartier";
    if (p <= 0.97) return "🌘 Dernier Croissant";
    return "🌑 Nouvelle Lune";
  }

  function updatePhasePath(phase, fraction) {
    if (!shadowPath) return;
    let pathData;

    if (fraction < 0.01) {
      pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z"; // nouvelle lune
    } else if (fraction > 0.99) {
      pathData = "M 0,0 L 0,0"; // pleine lune → pas d’ombre visible
    } else {
      const centerX = 50, centerY = 50, radius = 50;
      const isWaxing = phase < 0.5;
      let ellipseWidth = radius * (2 * fraction - 1);

      if (ellipseWidth > 0) {
        pathData = `M ${centerX},${centerY - radius}
                    A ${Math.abs(ellipseWidth)},${radius} 0 0,1 ${centerX},${centerY + radius}
                    A ${radius},${radius} 0 0,0 ${centerX},${centerY - radius} Z`;
      } else {
        pathData = `M ${centerX},${centerY - radius}
                    A ${radius},${radius} 0 0,1 ${centerX},${centerY + radius}
                    A ${Math.abs(ellipseWidth)},${radius} 0 0,0 ${centerX},${centerY - radius} Z`;
      }
    }

    shadowPath.setAttribute("d", pathData);
  }

  function updateFromSlider() {
    const value = parseFloat(slider.value);
    const fraction = value < 0.5 ? value * 2 : (1 - value) * 2;
    updatePhasePath(value, fraction);
    label.textContent = `Phase : ${getPhaseName(value)}`;
  }

  function loadSunCalc(callback) {
    if (window.SunCalc) callback();
    else {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.min.js";
      script.onload = callback;
      document.head.appendChild(script);
    }
  }

  // Lancer phase réelle au départ
  loadSunCalc(() => {
    const now = new Date();
    const { fraction, phase } = SunCalc.getMoonIllumination(now);
    slider.value = phase.toFixed(2);
    updatePhasePath(phase, fraction);
    label.textContent = `Phase : ${getPhaseName(phase)}`;
  });

  slider.addEventListener("input", updateFromSlider);
})();
