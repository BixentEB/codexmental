export function launchSimulMoon() {
  const old = document.getElementById("simul-moon");
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = "simul-moon";
  container.style.margin = "1em auto";
  container.style.maxWidth = "220px";
  container.style.textAlign = "center";
  container.style.background = "rgba(0,0,0,0.75)";
  container.style.padding = "1em";
  container.style.borderRadius = "1em";
  container.style.color = "#fff";
  container.style.fontFamily = "sans-serif";

  container.innerHTML = `
    <div style="margin-bottom: 0.5em;">🛰️ Simulateur lunaire (reset)</div>
    <svg id="simul-svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <clipPath id="moon-clip">
          <circle cx="50" cy="50" r="50" />
        </clipPath>
        <mask id="light-mask">
          <rect width="100%" height="100%" fill="black" />
          <path id="shadow-path" fill="white" />
        </mask>
      </defs>

      <!-- Lune visible (fixe) -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" clip-path="url(#moon-clip)" />

      <!-- Zone éclairée -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%"
             mask="url(#light-mask)" clip-path="url(#moon-clip)" />
    </svg>

    <input type="range" min="0" max="1" step="0.001" value="0" id="moon-slider" style="width:100%; margin-top:1em">
    <div id="moon-phase-label" style="margin-top:0.3em; font-size: 0.8em;"></div>
  `;

  const target = document.getElementById("simul-moon-container");
  if (target) target.appendChild(container);
  else {
    console.warn("❌ simulateur : conteneur #simul-moon-container non trouvé");
    return;
  }

  const shadowPath = container.querySelector("#shadow-path");
  const slider = container.querySelector("#moon-slider");
  const label = container.querySelector("#moon-phase-label");

  function polarToCartesian(cx, cy, r, angleDeg) {
    const rad = (angleDeg - 90) * Math.PI / 180;
    return {
      x: cx + r * Math.cos(rad),
      y: cy + r * Math.sin(rad)
    };
  }

  function describeArc(cx, cy, r, angleDeg) {
    const start = polarToCartesian(cx, cy, r, angleDeg);
    const end = polarToCartesian(cx, cy, r, angleDeg + 180);
    return `
      M ${start.x},${start.y}
      A ${r},${r} 0 0,1 ${end.x},${end.y}
      A ${r},${r} 0 0,1 ${start.x},${start.y}
      Z
    `;
  }

  function updatePhase(phase) {
    const angle = (phase * 360) % 360;
    const pathData = describeArc(50, 50, 50, angle);
    shadowPath.setAttribute("d", pathData.trim());

    let emoji = "🌑";
    if (phase < 0.125) emoji = "🌑 Nouvelle lune";
    else if (phase < 0.25) emoji = "🌒 Croissant croissant";
    else if (phase < 0.375) emoji = "🌓 Premier quartier";
    else if (phase < 0.5) emoji = "🌔 Gibbeuse croissante";
    else if (phase < 0.625) emoji = "🌕 Pleine lune";
    else if (phase < 0.75) emoji = "🌖 Gibbeuse décroissante";
    else if (phase < 0.875) emoji = "🌗 Dernier quartier";
    else emoji = "🌘 Croissant décroissant";

    label.textContent = `${emoji} (phase: ${phase.toFixed(3)})`;
  }

  slider.addEventListener("input", () => {
    updatePhase(parseFloat(slider.value));
  });

  updatePhase(parseFloat(slider.value));
}
