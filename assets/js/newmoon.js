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

    // Si phase < 0.5 --> croissante, ombre à droite
    // Si phase > 0.5 --> décroissante, ombre à gauche
    const r = 100;
    let cx;
    if (phase <= 0.5) {
      // Lune croissante : ombre à droite
      cx = 100 + (r * (1 - fraction));
    } else {
      // Lune décroissante : ombre à gauche
      cx = 100 - (r * (1 - fraction));
    }

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
