// Version complète et testée - Plus besoin d'image externe
import { moon } from "https://cdn.jsdelivr.net/npm/astronomia/+esm";

export function updateNewMoonWidget() {
  console.log("🌙 Initialisation du widget lunaire");

  // Vérification du thème
  if (!document.body.classList.contains("theme-lunaire")) return;

  // Suppression de l'ancien widget si existant
  const existingWidget = document.getElementById('svg-lune-widget');
  if (existingWidget) existingWidget.remove();

  // Création du SVG dynamique
  const widgetHTML = `
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

  // Insertion dans le DOM
  const container = document.createElement('div');
  container.id = 'svg-lune-widget';
  container.innerHTML = widgetHTML;
  document.body.appendChild(container);

  // Gestion des tailles
  const sizes = [
    { w: "150px", h: "150px" },
    { w: "250px", h: "250px" },
    { w: "500px", h: "500px", class: "super-lune" }
  ];
  let sizeIndex = 1;

  function applySize() {
    container.style.width = sizes[sizeIndex].w;
    container.style.height = sizes[sizeIndex].h;
    container.className = sizes[sizeIndex].class || "";
  }
  applySize();

  // Interaction clic
  container.addEventListener("click", (e) => {
    if (window.innerWidth > 568) {
      e.preventDefault();
      sizeIndex = (sizeIndex + 1) % sizes.length;
      applySize();
    }
  });

  // Mise à jour de la phase lunaire
  function updatePhase() {
    try {
      const date = new Date();
      const illum = moon.illum(date);
      const phase = moon.phase(date);
      const posX = 50 + 50 * Math.cos(phase);

      const ombre = document.getElementById('lune-ombre');
      if (ombre) ombre.setAttribute('cx', posX);

      console.debug(`Phase lunaire: ${(illum*100).toFixed(1)}%`);
    } catch (error) {
      console.error("Erreur de calcul lunaire:", error);
    }
  }

  // Initialisation et intervalle
  updatePhase();
  const intervalId = setInterval(updatePhase, 3600000); // 1h

  // Nettoyage (exporté pour main.js)
  return () => {
    clearInterval(intervalId);
    container.remove();
  };
}
