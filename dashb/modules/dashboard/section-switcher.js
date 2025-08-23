// section-switcher.js — gestion centralisée des menus de sections par bloc

export function setupSectionSwitcher(containerSelector, modes, data) {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const select = container.querySelector('select[data-section]');
  const target = container.querySelector('.section-content');

  if (!select || !target) {
    console.warn(`❌ SectionSwitcher : select ou target manquant dans ${containerSelector}`);
    return;
  }

  function updateSection(mode) {
    const renderFn = modes[mode];
    if (typeof renderFn === 'function') {
      target.innerHTML = renderFn(data);
    }
  }

  // Initialisation (mode par défaut)
  updateSection(select.value);

  select.addEventListener('change', (e) => {
    updateSection(e.target.value);
  });
}
