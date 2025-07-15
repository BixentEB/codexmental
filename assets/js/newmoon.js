import SunCalc from 'https://esm.sh/suncalc';

// Coordonnées Lyon (France)
const LAT = 45.75;
const LNG = 4.85;

export function updateNewMoonWidget() {
  // Nettoyage éventuel
  const existing = document.getElementById('svg-lune-widget');
  if (existing) existing.remove();

  // Création du widget
  const container = document.createElement('div');
  container.id = 'svg-lune-widget';
  container.style.width = '250px';
  container.style.height = '250px';
  container.style.position = 'fixed';
  container.style.right = '30px';
  container.style.bottom = '30px';
  container.style.zIndex = 1000;

  // Calcul dynamique de la phase
  function renderMoon() {
    const now = new Date();
    const moon = SunCalc.getMoonIllumination(now);
    // Pour la forme : projection sphérique réaliste
    const phi = moon.phase * 2 * Math.PI; // phase [0,1], 0 = new, 0.5 = full, 1 = new
    const r = 100; // rayon SVG
    const sep = Math.cos(phi) * r; // position séparatrice ombre/lumière

    container.innerHTML = `
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <clipPath id="moon-clip">
            <circle cx="100" cy="100" r="100"/>
          </clipPath>
        </defs>
        <image href="/img/lune/lune-pleine.png" x="0" y="0" width="200" height="200" clip-path="url(#moon-clip)" style="filter:brightness(1.1)"/>
        <ellipse 
          cx="${100 + sep}" cy="100"
          rx="${r}" ry="${r}" 
          fill="black" 
          opacity="0.85"
          clip-path="url(#moon-clip)"
        />
      </svg>
    `;
  }

  // Premier affichage
  renderMoon();

  // Mise à jour auto chaque heure (modifiable)
  setInterval(renderMoon, 60 * 60 * 1000);

  // Ajout au DOM
  document.body.appendChild(container);
}
