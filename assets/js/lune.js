export function updateLunarWidget(theme) {
  const existing = document.getElementById('lune-widget');
  if (existing) existing.remove();

  if (theme === 'theme-lunaire') {
    setTimeout(() => {
      const wrapper = document.createElement('div');
      wrapper.id = 'lune-widget';

      const lune = document.createElement('div');
      lune.classList.add('lune-img');
      lune.style.backgroundImage = `url('/img/lune/lune-pleine.png')`;

      wrapper.appendChild(lune);
      document.body.appendChild(wrapper);

      const pourcentage = getMoonPhasePercentage();
      const phase = getPhaseFraction();
      applyLunarShadow(lune, pourcentage, phase);

      applySavedLuneSize(wrapper);
      setupLuneClickCycle(wrapper);
      followScrollLune(wrapper);
    }, 50);
  }
}

function getMoonPhasePercentage(date = new Date()) {
  const base = new Date('2024-01-11T11:57:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = diff / 29.530588853;
  const phase = lunations % 1;
  const illumination = Math.round(100 * (1 - Math.cos(phase * 2 * Math.PI)) / 2);
  return illumination;
}

function getPhaseFraction(date = new Date()) {
  const base = new Date('2024-01-11T11:57:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = diff / 29.530588853;
  return lunations % 1;
}

function applyLunarShadow(luneElement, phasePercentage, phaseFraction) {
  if (!luneElement) return;

  const percent = Math.round(phasePercentage);
  const isWaxing = phaseFraction < 0.5; // Croissante
  const side = isWaxing ? '0%' : 'auto';
  const inverseSide = isWaxing ? 'auto' : '0%';

  luneElement.style.setProperty('--illum', `${percent}%`);
  luneElement.style.setProperty('--side', side);
  luneElement.style.setProperty('--side-inverse', inverseSide);

  const wrapper = luneElement.parentElement;
  if (wrapper) {
    wrapper.classList.toggle('lune-nouvelle', percent <= 2);
  }
}
