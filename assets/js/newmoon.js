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
  container.classList.add('lune-svg-container'); // Utilise ton CSS

  // Cycle de tailles
  const sizes = [
    { w: "150px", h: "150px", class: "" },
    { w: "250px", h: "250px", class: "" },
    { w: "500px", h: "500px", class: "super-lune" }
  ];
  let sizeIndex = 1; // Medium par défaut

  function applySize() {
    container.style.width = sizes[sizeIndex].w;
    container.style.height = sizes[sizeIndex].h;
    container.classList.remove("super-lune");
    if (sizes[sizeIndex].class) {
      container.classList.add(sizes[sizeIndex].class);
    }
  }

  // SVG lune avec effet "fantôme"
  function renderMoon() {
    const now = new Date();
    const moon = SunCalc.getMoonIllumination(now);
    const phase = moon.phase; // 0 = new, 0.5 = full, 1 = new
    const fraction = moon.fraction; // [0, 1]
    const r = 100;

    // Sens de la phase
    let cx;
    if (phase <= 0.5) {
      // Croissante : ombre à droite
      cx = 100 + (r * (1 - fraction));
    } else {
      // Décroissante : ombre à gauche
      cx = 100 - (r * (1 - fraction));
    }

    // SVG avec deux images lune : une "fantôme" (ombre douce) + une masquée
    container.innerHTML = `
      <svg id="svg-lune" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <filter id="lune-fantome">
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.08"/>
            </feComponentTransfer>
            <feColorMatrix type="matrix"
              values="0.2 0 0 0 0
                      0 0.2 0 0 0
                      0 0 0.2 0 0
                      0 0 0 1 0"/>
          </filter>
          <mask id="mask-lune">
            <rect width="200" height="200" fill="white"/>
            <ellipse id="ombre" cx="${cx}" cy="100" rx="${r}" ry="${r}" fill="black"/>
          </mask>
        </defs>
        <!-- Lune fantôme, effet doux -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" filter="url(#lune-fantome)" clip-path="url(#moon-clip)"/>
        <!-- Lune réelle, masquée selon la phase -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" mask="url(#mask-lune)"/>
      </svg>
    `;
  }

  // Premier affichage
  applySize();
  renderMoon();

  // Mise à jour auto chaque heure
  setInterval(renderMoon, 60 * 60 * 1000);

  // Changement de taille au clic
  container.addEventListener("click", (e) => {
    e.preventDefault();
    sizeIndex = (sizeIndex + 1) % sizes.length;
    applySize();
  });

  // Ajout au DOM
  document.body.appendChild(container);
}
