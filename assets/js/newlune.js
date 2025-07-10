export function updateLunarWidget(SunCalc) {
  console.log("✅ newlune.js lancé avec SunCalc + structure compatible CSS historique.");

  // Suppression des anciens widgets
  const existingWidget = document.getElementById('svg-lune-widget');
  if (existingWidget) existingWidget.remove();

  // Création du conteneur
  const widget = document.createElement('div');
  widget.id = 'svg-lune-widget';

  widget.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
      <defs>
        <!-- Filtre fantôme comme avant -->
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
        <!-- Masque lunaire -->
        <mask id="mask-lune">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      
      <!-- Couches lunaires sans classe -->
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" filter="url(#lune-fantome)"/>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" mask="url(#mask-lune)"/>
    </svg>
  `;

  // Gestion du clic pour super-lune
  widget.addEventListener('click', () => {
    widget.classList.toggle('super-lune');
  });

  // Mise à jour de la phase lunaire
  function updateMoonPhase() {
    const { fraction, phase } = SunCalc.getMoonIllumination(new Date());
    const mask = document.getElementById('ombre');
    if (!mask) return;

    const illumination = fraction * 100;
    let cxValue;

    if (illumination >= 99.9) {
      cxValue = 150; // Pleine lune
    } else if (illumination <= 0.1) {
      cxValue = 50; // Nouvelle lune
    } else {
      const offset = 50 * (1 - illumination / 100);
      cxValue = phase < 0.5 ? 50 + offset : 50 - offset;
    }

    mask.setAttribute('cx', cxValue);
    console.log(`🌝 Phase SunCalc: ${illumination.toFixed(1)}% | cx=${cxValue}`);
  }

  // Initialisation
  updateMoonPhase();
  setInterval(updateMoonPhase, 3600000);

  document.body.appendChild(widget);
}
