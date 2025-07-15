import SunCalc from 'https://esm.sh/suncalc';

// Coordonnées Lyon (France)
const LAT = 45.75;
const LNG = 4.85;

export function updateNewMoonWidget() {
  const existing = document.getElementById('svg-lune-widget');
  if (existing) existing.remove();

  const container = document.createElement('div');
  container.id = 'svg-lune-widget';
  container.style.width = '250px';
  container.style.height = '250px';
  container.style.position = 'fixed';
  container.style.right = '30px';
  container.style.bottom = '30px';
  container.style.zIndex = 1000;

  function renderMoon() {
    const now = new Date();
    const moon = SunCalc.getMoonIllumination(now);
    const phase = moon.phase; // 0 = new, 0.5 = full, 1 = new
    const fraction = moon.fraction; // [0, 1]

    // Calcul du "décalage" de l'ombre, inspiré des sites pros
    // Sens de la phase : croissante (<0.5) = ombre à droite, décroissante (>0.5) = ombre à gauche
    const r = 100;
    // Calcul du centre de l'ombre (ellipse)
    const k = (fraction - 0.5) * 2; // [-1, 1], -1 = nouvelle, 0 = pleine, 1 = nouvelle
    // Décroissante : k < 0, ombre à gauche
    const cx = 100 - (k * r);

    container.innerHTML = `
      <svg viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <clipPath id="moon-clip">
            <circle cx="100" cy="100" r="100"/>
          </clipPath>
        </defs>
        <!-- Disque lunaire -->
        <image href="/img/lune/lune-pleine.png" x="0" y="0" width="200" height="200" clip-path="url(#moon-clip)" style="filter:brightness(1.1)"/>
        <!-- Ombre lunaire, ellipse sur le bon côté -->
        <ellipse 
          cx="${cx}" cy="100"
          rx="${r}" ry="${r}" 
          fill="black"
          opacity="0.85"
          clip-path="url(#moon-clip)"
        />
      </svg>
    `;
  }

  renderMoon();
  setInterval(renderMoon, 60 * 60 * 1000);
  document.body.appendChild(container);
}
