export function updateNewMoonWidget(SunCalc) {
  console.log("✅ newmoon.js launched with SunCalc and original CSS structure.");

  if (!document.body.classList.contains("theme-lunaire")) {
    console.log("🌙 Lunar theme inactive, no widget displayed.");
    return;
  }

  // Remove existing widget if any
  const existingWidget = document.getElementById('svg-lune-widget');
  if (existingWidget) existingWidget.remove();

  // Create the container
  const container = document.createElement('div');
  container.id = 'svg-lune-widget';

  container.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" width="100%" height="100%">
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
          <rect width="100%" height="100%" fill="white"/>
          <circle id="ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" filter="url(#lune-fantome)"/>
      <image href="/img/lune/lune-pleine.png" width="100%" height="100%" mask="url(#mask-lune)"/>
    </svg>
  `;

  document.body.appendChild(container);

  // Update moon phase using SunCalc
  function updateMoonPhase() {
    const { fraction, phase } = SunCalc.getMoonIllumination(new Date());
    const maskCircle = document.getElementById('ombre');
    if (!maskCircle) return;

    const illumination = fraction * 100;
    let cxValue;

    if (illumination <= 0.1) {
      cxValue = 50; // New moon
    } else if (illumination >= 99.9) {
      cxValue = phase < 0.5 ? -50 : 150; // Full moon
    } else {
      cxValue = phase < 0.5
        ? 50 - (50 * illumination / 100)
        : 50 + (50 * illumination / 100);
    }

    maskCircle.setAttribute('cx', cxValue);
    console.log(`🌙 SunCalc Illumination: ${illumination.toFixed(1)}% | cx=${cxValue}`);
  }

  // Initialize
  updateMoonPhase();
  setInterval(updateMoonPhase, 3600000);
}
