/**
 * Injecte un simulateur lunaire avec slider de phase (0 = 🌑, 0.5 = 🌕, 1 = 🌑)
 */
export function launchSimulMoon() {
  // Supprimer l'existant
  const old = document.getElementById("simul-moon");
  if (old) old.remove();

  // Conteneur
  const container = document.createElement("div");
  container.id = "simul-moon";
  container.style.position = "fixed";
  container.style.bottom = "20px";
  container.style.right = "20px";
  container.style.zIndex = "9999";
  container.style.background = "rgba(0,0,0,0.8)";
  container.style.padding = "1em";
  container.style.borderRadius = "1em";
  container.style.color = "#fff";
  container.style.width = "200px";
  container.style.fontFamily = "sans-serif";

  container.innerHTML = `
    <div style="text-align:center; margin-bottom: 0.5em;">🛰️ Simulateur lunaire</div>
    <svg id="simul-svg" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <clipPath id="simul-clip">
          <circle cx="50" cy="50" r="50"/>
        </clipPath>
        <mask id="simul-mask">
          <rect width="100%" height="100%" fill="white"/>
          <path id="simul-shadow" fill="black"/>
        </mask>
      </defs>

      <image href="/img/lune/lune-pleine.png" width="100%" height="100%"
             filter="brightness(0.4) opacity(0.15)" clip-path="url(#simul-clip)"/>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%"
             mask="url(#simul-mask)" clip-path="url(#simul-clip)"/>
    </svg>

    <input type="range" min="0" max="1" step="0.001" value="0" id="moon-slider" style="width:100%; margin-top:1em">
    <div id="moon-phase-label" style="text-align:center; margin-top:0.3em; font-size: 0.8em;"></div>
  `;

  document.body.appendChild(container);

  const shadowPath = container.querySelector("#simul-shadow");
  const slider = container.querySelector("#moon-slider");
  const label = container.querySelector("#moon-phase-label");

  function updatePhase(phase) {
    const fraction = 1 - Math.abs(phase - 0.5) * 2; // 0 → 0, 0.5 → 1, 1 → 0
    const centerX = 50;
    const centerY = 50;
    const radius = 50;

    let ellipseWidth = radius * (2 * fraction - 1);
    if (phase > 0.5) ellipseWidth *= -1;

    let pathData;
    if (fraction < 0.01) {
      pathData = "M 0,0 L 100,0 L 100,100 L 0,100 Z"; // Nouvelle lune
    } else if (fraction > 0.99) {
      pathData = "M 0,0 L 0,0"; // Pleine lune
    } else if (ellipseWidth > 0) {
      pathData = `M ${centerX},${centerY - radius}
                  A ${Math.abs(ellipseWidth)},${radius} 0 0,1 ${centerX},${centerY + radius}
                  A ${radius},${radius} 0 0,0 ${centerX},${centerY - radius} Z`;
    } else {
      pathData = `M ${centerX},${centerY - radius}
                  A ${radius},${radius} 0 0,1 ${centerX},${centerY + radius}
                  A ${Math.abs(ellipseWidth)},${radius} 0 0,0 ${centerX},${centerY - radius} Z`;
    }

    shadowPath.setAttribute("d", pathData);

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
    const phase = parseFloat(slider.value);
    updatePhase(phase);
  });

  // Initialisation
  updatePhase(parseFloat(slider.value));
}
