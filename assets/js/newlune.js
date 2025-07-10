export function updateLunarWidget(SunCalc) {
  // Suppression des anciens widgets
  const existingWidget = document.getElementById('svg-lune-widget');
  if (existingWidget) existingWidget.remove();

  // Création du SVG (structure optimisée)
  const widget = document.createElement('div');
  widget.id = 'svg-lune-widget';
  widget.className = 'lune-base'; // Classe de base pour le CSS
  
  widget.innerHTML = `
    <svg viewBox="0 0 100 100" width="100" height="100">
      <defs>
        <!-- Filtre de glow -->
        <filter id="lune-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feComposite in="SourceGraphic" in2="blur" operator="over"/>
        </filter>
        
        <!-- Masque lunaire -->
        <mask id="lune-mask">
          <rect width="100" height="100" fill="white"/>
          <circle id="lune-mask-circle" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      
      <!-- Couches lunaires -->
      <image href="/img/lune/lune-pleine.png" width="100" height="100" class="lune-background"/>
      <image href="/img/lune/lune-pleine.png" width="100" height="100" class="lune-foreground" mask="url(#lune-mask)"/>
    </svg>
  `;

  // Gestion du clic pour super-lune
  widget.addEventListener('click', () => {
    widget.classList.toggle('super-lune');
  });

  // Mise à jour de la phase lunaire
  function updateMoonPhase() {
    const { fraction, phase } = SunCalc.getMoonIllumination(new Date());
    const mask = document.getElementById('lune-mask-circle');
    if (!mask) return;

    const illumination = fraction * 100;
    let cxValue;

    if (illumination >= 99.9) {
      cxValue = 150; // Pleine lune (masque hors écran)
    } else if (illumination <= 0.1) {
      cxValue = 50; // Nouvelle lune (masque centré)
    } else {
      const offset = 50 * (1 - (illumination / 100));
      cxValue = phase < 0.5 ? 50 + offset : 50 - offset;
    }

    mask.setAttribute('cx', cxValue);
    console.log(`🌝 Phase: ${illumination.toFixed(1)}% | Position: ${cxValue}`);
  }

  // Initialisation
  updateMoonPhase();
  setInterval(updateMoonPhase, 3600000); // Actualisation horaire
  document.body.appendChild(widget);
}
