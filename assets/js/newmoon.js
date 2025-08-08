// newmoon.js – Widget lunaire refondu (terminateur géométrique + angle réel)

function loadSunCalc(callback) {
  if (window.SunCalc) {
    callback();
  } else {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.min.js";
    script.onload = callback;
    document.head.appendChild(script);
  }
}

export function updateNewMoonWidget() {
  // Supprimer l'ancien widget si présent
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();

  const container = document.createElement("div");
  container.id = "svg-lune-widget";

  // Structure SVG identique à ton widget actuel
  container.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <clipPath id="moon-clip">
          <circle cx="50" cy="50" r="50"/>
        </clipPath>
        <mask id="moon-mask">
          <rect width="100%" height="100%" fill="white"/>
          <path id="shadow-path" fill="black"/>
        </mask>
      </defs>

      <!-- Lune fantôme (arrière-plan sombre) -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%"
             filter="brightness(0.4) opacity(0.15)" clip-path="url(#moon-clip)"/>

      <!-- Lune éclairée (masquée par l'ombre) -->
      <image id="moon-lit" href="/img/lune/lune-pleine.png" width="100%" height="100%"
             mask="url(#moon-mask)" clip-path="url(#moon-clip)"/>
    </svg>
  `;

  document.body.appendChild(container);

  // Gestion tailles au clic
  const sizes = [
    { w: "150px", h: "150px", class: "" },
    { w: "250px", h: "250px", class: "" },
    { w: "500px", h: "500px", class: "super-lune" }
  ];
  let sizeIndex = 1;

  function applySize() {
    container.style.width = sizes[sizeIndex].w;
    container.style.height = sizes[sizeIndex].h;
    container.className = sizes[sizeIndex].class;
  }

  applySize();

  container.addEventListener("click", (e) => {
    e.preventDefault();
    sizeIndex = (sizeIndex + 1) % sizes.length;
    applySize();
  });

  // Charger SunCalc et lancer mise à jour
  loadSunCalc(() => {
    updateMoon();
    setInterval(updateMoon, 3600000); // toutes les heures
  });
}

function updateMoon() {
  const now = new Date();
  const { fraction, phase, angle } = SunCalc.getMoonIllumination(now);
  const shadowPath = document.getElementById("shadow-path");
  const litImage = document.getElementById("moon-lit");
  if (!shadowPath || !litImage) return;

  const cx = 50;
  const cy = 50;
  const r = 50;

  // Cas extrêmes : nouvelle lune ou pleine lune
  if (fraction < 0.01) {
    shadowPath.setAttribute("d", "M0,0L100,0L100,100L0,100Z");
    litImage.setAttribute("transform", "");
    return;
  }
  if (fraction > 0.99) {
    shadowPath.setAttribute("d", "");
    litImage.setAttribute("transform", "");
    return;
  }

  // Largeur du terminateur : projection sphérique
  // Formellement : distance horizontale au centre liée à la fraction éclairée
  const k = 2 * fraction - 1; // -1 = nouvelle lune, 0 = quartier, +1 = pleine lune
  const terminatorOffset = Math.sqrt(1 - k * k) * r;

  // Orientation réelle selon angle SunCalc
  const rotationDeg = angle * (180 / Math.PI);
  litImage.setAttribute("transform", `rotate(${rotationDeg}, ${cx}, ${cy})`);

  // Sens croissant / décroissant selon phase
  const isWaxing = phase < 0.5;
  const ellipseX = isWaxing ? cx + terminatorOffset : cx - terminatorOffset;

  // Tracé du terminateur en path
  const d = `
    M ${cx},${cy - r}
    A ${r},${r} 0 0,1 ${cx},${cy + r}
    A ${r},${r} 0 0,1 ${cx},${cy - r}
    Z
    M ${ellipseX},${cy - r}
    A ${terminatorOffset},${r} 0 0,${isWaxing ? 0 : 1} ${ellipseX},${cy + r}
    A ${terminatorOffset},${r} 0 0,${isWaxing ? 1 : 0} ${ellipseX},${cy - r}
    Z
  `;

  shadowPath.setAttribute("d", d.trim());

  // Log debug
  console.log(
    `Phase=${phase.toFixed(3)} | Illum=${(fraction * 100).toFixed(1)}% | Angle=${rotationDeg.toFixed(1)}°`
  );
}
