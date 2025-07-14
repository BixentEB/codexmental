// Import correct avec vérification
import { moon } from "https://cdn.jsdelivr.net/npm/astronomia/+esm";

export function updateNewMoonWidget() {
  console.log("✅ Module lunaire chargé");

  if (!document.body.classList.contains("theme-lunaire")) return;

  // Nettoyage
  document.getElementById('svg-lune-widget')?.remove();

  // Création du SVG dynamique (sans dépendance à une image externe)
  const container = document.createElement('div');
  container.id = 'svg-lune-widget';
  container.innerHTML = `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <filter id="lune-glow">
          <feGaussianBlur stdDeviation="2" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        <mask id="lune-mask">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="lune-ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <circle cx="50" cy="50" r="49" fill="#f0f0ff" filter="url(#lune-glow)"/>
      <circle cx="50" cy="50" r="49" fill="#f0f0ff" mask="url(#lune-mask)"/>
    </svg>
  `;
  document.body.appendChild(container);

  // Gestion des tailles (identique à votre version)
  const sizes = [
    { w: "150px", h: "150px" },
    { w: "250px", h: "250px" },
    { w: "500px", h: "500px", class: "super-lune" }
  ];
  let sizeIndex = 1;
  const applySize = () => {
    container.style.width = sizes[sizeIndex].w;
    container.style.height = sizes[sizeIndex].h;
    container.className = sizes[sizeIndex].class || "";
  };

  // Mise à jour de la phase lunaire
  const updatePhase = () => {
    const date = new Date();
    const illum = moon.illum(date); // Fraction éclairée (0-1)
    const phase = moon.phase(date); // Angle de phase en radians

    const ombre = document.getElementById('lune-ombre');
    if (ombre) {
      const posX = 50 + 50 * Math.cos(phase);
      ombre.setAttribute('cx', posX);
      console.log(`Phase: ${(illum*100).toFixed(1)}% | X: ${posX.toFixed(1)}`);
    }
  };

  // Initialisation
  applySize();
  updatePhase();
  setInterval(updatePhase, 3600000); // Mise à jour horaire
}
