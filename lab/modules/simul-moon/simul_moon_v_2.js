// simul-moon-v2.js – Version SVG dynamique réaliste améliorée
// ===============================================================

(() => {
  const wrapper = document.createElement("div");
  wrapper.className = "simul-widget";

  const container = document.createElement("div");
  container.id = "simul-moon-v2";
  container.innerHTML = `
    <h3 class="simul-title">🌗 Simulateur lunaire (v2)</h3>
    <div class="moon-wrapper">
      <svg viewBox="0 0 100 100" class="moon-phase">
        <circle cx="50" cy="50" r="50" fill="#fff" />
        <path id="lune-shadow" fill="black" />
      </svg>
      <input type="range" id="simul-slider-v2" min="0" max="1" step="0.01" value="0.5">
      <div id="simul-label-v2">Phase : ...</div>
      <button id="simul-reset-v2" style="margin-top:0.5rem">↺ Phase actuelle</button>
    </div>
  `;

  wrapper.appendChild(container);
  document.getElementById("simul-moon-v2-container")?.appendChild(wrapper);

  const slider = document.getElementById("simul-slider-v2");
  const shadowPath = document.getElementById("lune-shadow");
  const label = document.getElementById("simul-label-v2");
  const resetBtn = document.getElementById("simul-reset-v2");

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

  function updateShadow(phase) {
    const cx = 50, cy = 50, r = 50;
    const illum = (1 - Math.cos(phase * 2 * Math.PI)) / 2; // sinusoïde réaliste
 // de 0 (pleine) à 1 (nouvelle)

    if (illum > 0.98) {
      shadowPath.setAttribute("d", "M 0,0 L 100,0 L 100,100 L 0,100 Z"); // nouvelle lune
      return;
    }
    if (illum < 0.02) {
      shadowPath.setAttribute("d", ""); // pleine lune
      return;
    }

    const isWaxing = phase < 0.5;
    const width = r * (1 - illum);

    let d;
    if (isWaxing) {
      // Ombre à gauche, lumière à droite
      d = `M ${cx},${cy - r}
           A ${r},${r} 0 0,1 ${cx},${cy + r}
           A ${width},${r} 0 0,0 ${cx},${cy - r} Z`;
    } else {
      // Ombre à droite, lumière à gauche
      d = `M ${cx},${cy - r}
           A ${width},${r} 0 0,1 ${cx},${cy + r}
           A ${r},${r} 0 0,0 ${cx},${cy - r} Z`;
    }

    shadowPath.setAttribute("d", d);
  }

  function updateUI(val) {
    const p = parseFloat(val);
    updateShadow(p);
    label.textContent = `Phase : ${getPhaseName(p)}`;
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

  function resetPhase() {
    const now = new Date();
    const { phase } = SunCalc.getMoonIllumination(now);
    slider.value = phase.toFixed(2);
    updateUI(phase);
  }

  loadSunCalc(() => {
    resetPhase();
    slider.addEventListener("input", (e) => updateUI(e.target.value));
    resetBtn.addEventListener("click", resetPhase);
  });
})();
