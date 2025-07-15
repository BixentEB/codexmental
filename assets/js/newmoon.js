import SunCalc from 'https://esm.sh/suncalc';

// Coordonnées Lyon (France)
const LAT = 45.75;
const LNG = 4.85;

function getSizeConfig() {
  const isMobile = window.matchMedia("(max-width: 568px), (pointer: coarse)").matches;
  const isTablet = window.matchMedia("(max-width: 900px) and (pointer: fine)").matches;
  if (isMobile) return { sizes: [ { w: "180px", h: "180px", class: "" } ], clickable: false };
  if (isTablet) return { sizes: [ { w: "150px", h: "150px", class: "" }, { w: "250px", h: "250px", class: "" } ], clickable: true };
  // Desktop/PC
  return { sizes: [
    { w: "150px", h: "150px", class: "" },
    { w: "250px", h: "250px", class: "" },
    { w: "500px", h: "500px", class: "super-lune" }
  ], clickable: true };
}

export function updateNewMoonWidget() {
  const existing = document.getElementById('svg-lune-widget');
  if (existing) existing.remove();

  const { sizes, clickable } = getSizeConfig();
  let sizeIndex = 1; // Normale par défaut sauf sur mobile

  const container = document.createElement('div');
  container.id = 'svg-lune-widget';

  function applySize() {
    container.style.width = sizes[sizeIndex].w;
    container.style.height = sizes[sizeIndex].h;
    container.classList.remove("super-lune");
    if (sizes[sizeIndex].class) container.classList.add(sizes[sizeIndex].class);
    else container.classList.remove("super-lune");
  }

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

    // SVG: lune fantôme (filtrée) + lune masquée (croissant)
    container.innerHTML = `
      <svg id="svg-lune" viewBox="0 0 200 200" width="100%" height="100%">
        <defs>
          <!-- Filtre fantôme -->
          <filter id="lune-fantome">
            <feComponentTransfer>
              <feFuncA type="table" tableValues="0 0.1"/>
            </feComponentTransfer>
            <feColorMatrix type="matrix"
              values="0.3 0 0 0 0
                      0 0.3 0 0 0
                      0 0 0.3 0 0
                      0 0 0 1 0"/>
          </filter>
          <!-- Masque croissant -->
          <mask id="mask-lune">
            <rect width="200" height="200" fill="white"/>
            <ellipse id="ombre" cx="${cx}" cy="100" rx="${r}" ry="${r}" fill="black"/>
          </mask>
        </defs>
        <!-- Lune fantôme en fond -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" filter="url(#lune-fantome)"/>
        <!-- Croissant lunaire (masqué) -->
        <image href="/img/lune/lune-pleine.png" width="200" height="200" mask="url(#mask-lune)"/>
      </svg>
    `;
  }

  // Premier affichage
  applySize();
  renderMoon();

  // Mise à jour phase chaque heure
  setInterval(renderMoon, 60 * 60 * 1000);

  // Clic pour changer la taille (si autorisé)
  if (clickable) {
    container.style.cursor = "pointer";
    container.addEventListener("click", (e) => {
      e.preventDefault();
      sizeIndex = (sizeIndex + 1) % sizes.length;
      applySize();
    });
  } else {
    container.style.cursor = "default";
  }

  document.body.appendChild(container);
}
