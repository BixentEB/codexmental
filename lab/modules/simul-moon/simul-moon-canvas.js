// simul-moon-canvas.js

export function launchSimulMoonCanvas() {
  const old = document.getElementById("simul-moon");
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = "simul-moon";
  container.className = "widget-simul-moon";
  container.style.margin = "1em auto";
  container.style.maxWidth = "220px";
  container.style.textAlign = "center";
  container.style.background = "rgba(0,0,0,0.75)";
  container.style.padding = "1em";
  container.style.borderRadius = "1em";
  container.style.color = "#fff";
  container.style.fontFamily = "sans-serif";

  container.innerHTML = `
    <div style="margin-bottom: 0.5em;">🛰️ Simulateur lunaire (canvas)</div>
    <canvas id="simul-canvas" width="200" height="200" style="width:100%; border-radius:50%;"></canvas>
    <input type="range" min="0" max="1" step="0.001" value="0" id="moon-slider" style="width:100%; margin-top:1em">
    <div id="moon-phase-label" style="margin-top:0.3em; font-size: 0.8em;"></div>
  `;

  const target = document.getElementById("simul-moon-canvas-container");
  if (target) target.appendChild(container);
  else {
    console.warn("❌ simulateur : conteneur #simul-moon-canvas-container non trouvé");
    return;
  }

  const canvas = container.querySelector("#simul-canvas");
  const ctx = canvas.getContext("2d");
  const slider = container.querySelector("#moon-slider");
  const label = container.querySelector("#moon-phase-label");

  const img = new Image();
  img.src = "/img/lune/lune-pleine-simul.png";

  function drawMoon(phase) {
    const w = canvas.width;
    const h = canvas.height;
    const cx = w / 2;
    const cy = h / 2;
    const r = w / 2;

    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.drawImage(img, 0, 0, w, h);

    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
    ctx.beginPath();

    // Phase symétrique : 0 (new) → 1 (next new)
    let angle = (phase * 2 * Math.PI);
    let direction = phase <= 0.5 ? 1 : -1;
    let offset = Math.abs(0.5 - phase);

    // Crée une forme elliptique d'ombre légèrement décalée
    ctx.ellipse(
      cx + direction * offset * r * 1.6, // décalage horizontal
      cy,
      r,
      r,
      0,
      0,
      2 * Math.PI
    );
    ctx.fill();

    ctx.restore();

    // Étiquette
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
    drawMoon(parseFloat(slider.value));
  });

  img.onload = () => {
    drawMoon(parseFloat(slider.value));
  };
}
