export function updateNewMoonWidget(SunCalc) {
  console.log("✅ newmoon.js - Version corrigée");

  if (!document.body.classList.contains("theme-lunaire")) return;

  // Widget existant
  const container = document.getElementById('svg-lune-widget') || document.createElement('div');
  container.id = 'svg-lune-widget';
  container.innerHTML = `
    <svg viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <filter id="lune-fantome">
          <feComponentTransfer>
            <feFuncA type="table" tableValues="0 0.08"/>
          </feComponentTransfer>
          <feColorMatrix values="0.2 0 0 0 0 0 0.2 0 0 0 0 0 0.2 0 0 0 0 0 1 0"/>
        </filter>
        <mask id="mask-lune">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" filter="url(#lune-fantome)"/>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" mask="url(#mask-lune)"/>
    </svg>
  `;

  if (!document.body.contains(container)) {
    document.body.appendChild(container);
  }

  // Gestion responsive (identique à votre version)
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
    if (window.innerWidth > 568) { // Désactivé sur mobile
      e.preventDefault();
      sizeIndex = (sizeIndex + 1) % sizes.length;
      applySize();
    }
  });

  // Nouveau calcul précis de phase
  function updatePhase() {
    const { fraction, phase } = SunCalc.getMoonIllumination(new Date());
    const ombre = document.getElementById('ombre');
    if (!ombre) return;

    // Modèle astronomique précis
    const angle = phase * Math.PI * 2;
    const cx = 50 + (45 * Math.cos(angle)); // 45 au lieu de 50 pour lisser les extrêmes

    ombre.setAttribute('cx', cx);
    console.log(`🌙 Phase calculée: ${(fraction * 100).toFixed(1)}% (cx=${cx.toFixed(1)})`);
  }

  updatePhase();
  const phaseInterval = setInterval(updatePhase, 3600000); // Actualisation horaire

  // Nettoyage
  return () => clearInterval(phaseInterval);
}
