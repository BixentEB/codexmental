// newmoon.js - VERSION STABLE
function initMoon() {
  const container = document.createElement('div');
  container.id = 'moon-widget';
  container.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: 200px;
    height: 200px;
    border-radius: 50%;
    background: conic-gradient(
      from 90deg,
      #0000 0%,
      #0000 ${(1 - illumination) * 100}%,
      white ${(1 - illumination) * 100}%,
      white 100%
    );
    cursor: pointer;
    z-index: 1000;
  `;
  document.body.appendChild(container);
}

// Chargement simple
if (!window.moonLoaded) {
  window.moonLoaded = true;
  loadSunCalc(() => {
    const {fraction} = SunCalc.getMoonIllumination(new Date());
    initMoon(fraction);
  });
}
