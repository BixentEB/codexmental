import SunCalc from 'https://esm.sh/suncalc';

export function updateNewMoonWidget() {
  // Lyon, France
  const lat = 45.75;
  const lng = 4.85;
  const date = new Date();

  // Calcule la phase et l'illumination
  const moon = SunCalc.getMoonIllumination(date);
  const phase = moon.phase; // 0 = nouvelle, 0.5 = pleine, 1 = nouvelle
  const fraction = moon.fraction; // % illuminé

  // Création du widget
  const container = document.createElement('div');
  container.id = 'svg-lune-widget';

  // Taille responsive
  container.style.width = '250px';
  container.style.height = '250px';
  container.style.position = 'fixed';
  container.style.right = '30px';
  container.style.bottom = '30px';
  container.style.zIndex = 1000;

  // Dessin SVG
  container.innerHTML = getMoonSVG(phase, fraction);

  // Ajout au DOM
  document.body.appendChild(container);
}

// Fonction qui retourne le SVG lunaire pro
function getMoonSVG(phase, fraction) {
  // Calcul pro de la séparation ombre/lumière
  // Algorithme inspiré des sites pros (projection ellipse sphère)
  // phase: 0 = new, 0.5 = full, 1 = new
  // fraction: [0,1] illuminé

  // Angle de phase
  const phi = phase * 2 * Math.PI;
  // Calcul du centre de l'ombre
  const r = 100; // rayon SVG
  const sep = Math.cos(phi) * r;

  // SVG : lune pleine + masque ellipse d'ombre
  return `
  <svg viewBox="0 0 200 200" width="100%" height="100%">
    <defs>
      <clipPath id="moon-clip">
        <circle cx="100" cy="100" r="100"/>
      </clipPath>
    </defs>
    <!-- Disque lunaire -->
    <image href="/img/lune/lune-pleine.png" x="0" y="0" width="200" height="200" clip-path="url(#moon-clip)" style="filter:brightness(1.1)"/>
    <!-- Ombre lunaire -->
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
