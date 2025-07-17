const container = document.getElementById("widget-lune-container");

container.innerHTML = `
  <svg viewBox="0 0 100 100">
    <defs>
      <mask id="mask-lune">
        <rect width="100" height="100" fill="white" />
        <circle id="ombre" cx="50" cy="50" r="50" fill="black" />
      </mask>
    </defs>
    <image href="/img/lune/lune-pleine.png" width="100" height="100" filter="brightness(0.4) opacity(0.15)" />
    <image href="/img/lune/lune-pleine.png" width="100" height="100" mask="url(#mask-lune)" />
  </svg>
  <input id="slider" type="range" min="0" max="1" step="0.01" value="0.668" />
  <div class="info">
    <div id="illumination">💡 Illumination : ?%</div>
    <div id="phase">🌗 Phase : inconnue</div>
  </div>
`;

const slider = container.querySelector("#slider");
const ombre = container.querySelector("#ombre");
const infoIllum = container.querySelector("#illumination");
const infoPhase = container.querySelector("#phase");

function updateMoonMask(phase) {
  const waxing = phase < 0.5;
  const fraction = 1 - Math.cos(phase * 2 * Math.PI) / 2;
  const cx = waxing ? 50 - fraction * 50 : 50 + fraction * 50;
  ombre.setAttribute("cx", cx);
  return { cx, fraction, waxing };
}

function getPhaseName(phase) {
  if (phase === 0) return "🌑 Nouvelle lune";
  if (phase < 0.25) return "🌒 Croissant";
  if (phase === 0.25) return "🌓 Premier quartier";
  if (phase < 0.5) return "🌔 Gibbeuse croissante";
  if (phase === 0.5) return "🌕 Pleine lune";
  if (phase < 0.75) return "🌖 Gibbeuse décroissante";
  if (phase === 0.75) return "🌗 Dernier quartier";
  if (phase < 1) return "🌘 Dernier croissant";
  return "🌑 Nouvelle lune";
}

function update() {
  const phase = parseFloat(slider.value);
  const { fraction } = updateMoonMask(phase);
  const illumPercent = (fraction * 100).toFixed(1);
  infoIllum.textContent = `💡 Illumination : ${illumPercent}%`;
  infoPhase.textContent = `🌓 Phase : ${getPhaseName(phase)} (valeur ${phase.toFixed(3)})`;
}

slider.addEventListener("input", update);
update();

