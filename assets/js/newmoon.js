export function updateNewMoonWidget(SunCalc) {
  // 1. Initialisation du widget
  let container = document.getElementById('svg-lune-widget');
  if (!container) {
    container = document.createElement('div');
    container.id = 'svg-lune-widget';
    container.innerHTML = `
      <svg viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <mask id="moon-mask">
            <rect width="100" height="100" fill="white"/>
            <circle id="moon-shadow" cx="50" cy="50" r="50" fill="black"/>
          </mask>
        </defs>
        <image href="/img/lune/lune-pleine.png" width="100" height="100" mask="url(#moon-mask)"/>
      </svg>
    `;
    document.body.appendChild(container);
  }

  // 2. Gestion des tailles (identique à votre version originale)
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

  // 3. Mise à jour précise de la phase
  function updateMoonPhase() {
    const { phase } = SunCalc.getMoonIllumination(new Date());
    const shadow = document.getElementById('moon-shadow');
    if (!shadow) return;

    // Calcul précis de la position de l'ombre
    const angle = phase * Math.PI * 2;
    const cx = 50 + (45 * Math.cos(angle));
    shadow.setAttribute('cx', cx);
  }

  // 4. Initialisation et intervalle
  updateMoonPhase();
  const interval = setInterval(updateMoonPhase, 3600000); // Actualisation horaire

  // 5. Nettoyage
  return () => clearInterval(interval);
}
