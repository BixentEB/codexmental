// simul-moon.js – Simulateur de phases lunaires (module labo)
// ================================================

// Initialisation une fois le DOM chargé
window.addEventListener("DOMContentLoaded", () => {
  const container = document.createElement("div");
  container.id = "simul-moon";
  container.innerHTML = `
    <div class="moon-wrapper">
      <svg viewBox="0 0 100 100" class="moon-phase">
        <defs>
          <mask id="moon-mask">
            <rect width="100" height="100" fill="white" />
            <circle id="shadow" cx="50" cy="50" r="50" fill="black" />
          </mask>
        </defs>
        <circle cx="50" cy="50" r="50" fill="white" mask="url(#moon-mask)" />
      </svg>
      <input type="range" id="phase-slider" min="0" max="1" step="0.01" value="0.5">
    </div>
  `;

  document.body.appendChild(container);

  const shadow = document.getElementById("shadow");
  const slider = document.getElementById("phase-slider");

  function updatePhase(phase) {
    // phase va de 0 (nouvelle lune) à 1 (nouvelle lune suivante)
    const illuminated = Math.abs(0.5 - phase) * 2;
    const direction = phase < 0.5 ? -1 : 1;
    const offset = 50 + direction * illuminated * 50;
    shadow.setAttribute("cx", offset);
  }

  // Initialisation
  updatePhase(parseFloat(slider.value));

  slider.addEventListener("input", (e) => {
    updatePhase(parseFloat(e.target.value));
  });
});
