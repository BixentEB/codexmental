// newmoon.js — refonte stable (terminateur correct + rotation du path)

function loadSunCalc(cb) {
  if (window.SunCalc) cb();
  else {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.min.js";
    s.onload = cb;
    document.head.appendChild(s);
  }
}

export function updateNewMoonWidget() {
  const old = document.getElementById("svg-lune-widget");
  if (old) old.remove();

  const el = document.createElement("div");
  el.id = "svg-lune-widget";
  el.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <clipPath id="moon-clip"><circle cx="50" cy="50" r="50"/></clipPath>
        <!-- IMPORTANT: userSpaceOnUse + fill-rule evenodd -->
        <mask id="moon-mask" maskContentUnits="userSpaceOnUse">
          <!-- noir = caché par défaut -->
          <rect width="100" height="100" fill="black"/>
          <!-- on dessinera en BLANC la partie éclairée -->
          <path id="shadow-path" fill="white" fill-rule="evenodd"/>
        </mask>
      </defs>

      <!-- Fond fantôme -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%"
             filter="brightness(0.4) opacity(0.15)" clip-path="url(#moon-clip)"/>

      <!-- Texture éclairée (masquée par le path ci-dessus) -->
      <image id="moon-lit" href="/img/lune/lune-pleine.png" width="100%" height="100%"
             mask="url(#moon-mask)" clip-path="url(#moon-clip)"/>
    </svg>
  `;
  document.body.appendChild(el);

  const sizes = [
    { w: "150px", h: "150px", class: "" },
    { w: "250px", h: "250px", class: "" },
    { w: "500px", h: "500px", class: "super-lune" }
  ];
  let i = 1;
  const applySize = () => {
    el.style.width = sizes[i].w;
    el.style.height = sizes[i].h;
    el.className = sizes[i].class;
  };
  applySize();
  el.addEventListener("click", e => { e.preventDefault(); i = (i + 1) % sizes.length; applySize(); });

  loadSunCalc(() => {
    updateMoon();
    setInterval(updateMoon, 3600000);
  });
}

function updateMoon() {
  const now = new Date();
  const { fraction, phase, angle } = SunCalc.getMoonIllumination(now);
  const path = document.getElementById("shadow-path");
  if (!path) return;

  const cx = 50, cy = 50, r = 50;

  // clamps anti-glitch
  const f = Math.min(0.999, Math.max(0.001, fraction));
  const k = 2 * f - 1;                // -1 .. +1
  const off = Math.max(0.001, Math.sqrt(1 - k * k) * r); // largeur demi-ellipse

  // quel côté est éclairé ? (doc SunCalc: angle < 0 => croissante)
  const waxing = angle < 0;

  // on dessine la ZONE ÉCLAIRÉE en blanc via "evenodd":
  // cercle complet – demi-ellipse d'ombre => croissant/gibbeuse éclairé
  const ex = waxing ? cx - off : cx + off;

  const d = `
    M ${cx},${cy - r}
    A ${r},${r} 0 0 1 ${cx},${cy + r}
    A ${r},${r} 0 0 1 ${cx},${cy - r}
    Z
    M ${ex},${cy - r}
    A ${off},${r} 0 0 ${waxing ? 1 : 0} ${ex},${cy + r}
    A ${off},${r} 0 0 ${waxing ? 0 : 1} ${ex},${cy - r}
    Z
  `.trim();

  path.setAttribute("d", d);

  // orientation réelle du terminateur : on fait tourner le PATH, pas l'image
  const rotDeg = angle * 180 / Math.PI; // (si on veut la perspective observateur: angle - parallacticAngle)
  path.setAttribute("transform", `rotate(${rotDeg}, ${cx}, ${cy})`);

  // debug concis
  console.log(`Phase=${phase.toFixed(3)} | Illum=${(fraction*100).toFixed(1)}% | Angle=${rotDeg.toFixed(1)}° | Waxing=${waxing}`);
}
