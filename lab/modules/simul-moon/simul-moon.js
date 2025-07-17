// simul-moon.js – Simulateur lunaire avancé avec phase réelle + simulation manuelle
// ==================================================================================

(() => {
  const wrapper = document.createElement("div");
  wrapper.className = "simul-widget";

  const container = document.createElement("div");
  container.id = "simul-moon";
  container.innerHTML = `
    <h3 class="simul-title">🌙 Simulateur lunaire</h3>
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
      <button id="simul-reset" style="margin-top:0.5rem">↺ Phase actuelle</button>
    </div>
  `;

  wrapper.appendChild(container);
  document.getElementById("simul-moon-container")?.appendChild(wrapper);

  const slider = document.getElementById("simul-slider");
  const shadowPath = document.getElementById("simul-shadow-path");
  const label = document.getElementById("simul-label");
  const resetBtn = document.getElementById("simul-reset");

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

  function updatePhasePath(phase) {
    if (!shadowPath) return;

    const cx = 50, cy = 50, r = 50;
    const illum = Math.abs(0.5 - phase) * 2; // de 0 (pleine lune) à 1 (nouvelle)

    // Cas limites
    if (illum < 0.01) {
      shadowPath.setAttribute("d", "M 0,0 L 0,0"); // pleine lune
      return;
    }
    if (illum > 0.99) {
      shadowPath.setAttribute("d", "M 0,0 L 100,0 L 100,100 L 0,100 Z"); // nouvelle lune
      return;
    }

    const isWaxing = phase < 0.5;
    const ellipseW = Math.max(2, r * (2 * (1 - illum)));

    let path = "";
    if (isWaxing) {
      // ombre à gauche
      path = `M ${cx},${cy - r}
              A ${r},${r} 0 0,1 ${cx},${cy + r}
              A ${ellipseW},${r} 0 0,0 ${cx},${cy - r} Z`;
    } else {
      // ombre à droite
      path = `M ${cx},${cy - r}
              A ${ellipseW},${r} 0 0,1 ${cx},${cy + r}
              A ${r},${r} 0 0,0 ${cx},${cy - r} Z`;
    }

    shadowPath.setAttribute("d", path);
  }

  function updateFromSlider() {
    const value = parseFloat(slider.value);
    updatePhasePath(value);
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

  function resetToCurrentPhase() {
    const now = new Date();
    const { phase } = SunCalc.getMoonIllumination(now);
    slider.value = phase.toFixed(2);
    updatePhasePath(phase);
    label.textContent = `Phase : ${getPhaseName(phase)}`;
  }

  loadSunCalc(() => {
    resetToCurrentPhase();
    slider.addEventListener("input", updateFromSlider);
    resetBtn.addEventListener("click", resetToCurrentPhase);
  });
})();
