// /dashb/modules/modules.js — point d’entrée unique du dashboard

(() => {
  const root = document.documentElement;
  const body = document.body;

  // Forcer le thème stellaire proprement
  const toRemove = [...body.classList].filter(c => c.startsWith('theme-') && c !== 'theme-stellaire');
  toRemove.forEach(c => body.classList.remove(c));
  body.classList.add('theme-stellaire', 'lab', 'dashboard');
  root.dataset.theme = 'theme-stellaire';
  try { localStorage.setItem('codex-theme', 'theme-stellaire'); } catch {}

  // Retirer un éventuel sélecteur de thème flottant dans ce contexte
  document.querySelectorAll('.theme-switcher,[data-theme-menu],.theme-panel,.theme-list,.theme-fab-container,.theme-overlay,.backdrop-blur')
    .forEach(n => n.remove());

  window.__lab = window.__lab || { booted:false, bus:new EventTarget() };
})();

document.addEventListener('DOMContentLoaded', async () => {
  console.time('[DASH] bootstrap');

  // Garder le header au-dessus
  const header = document.getElementById('menu-placeholder') || document.getElementById('site-header');
  if (header) { header.style.position = 'relative'; header.style.zIndex = '5000'; }

  // 1) UI / compat (#info-*) + miroir + pont d’événements + close-all
  try {
    await import('/dashb/modules/dashboard/ui/init.js');
  } catch (e) {
    console.warn('⚠️ UI init failed:', e);
  }

  // 2) Viewer 3D (planète + lune)
  try {
    await import('/dashb/modules/dashboard/ui/viewer-orb.js');
  } catch (e) {
    console.warn('⚠️ Viewer 3D indisponible:', e);
  }

  // 3) Radar (charge aussi tes modules métiers via ses imports)
  try {
    await import('/dashb/modules/dashboard/simul-system.js');
  } catch (e) {
    console.warn('⚠️ Radar 2D indisponible:', e);
  }

  console.timeEnd('[DASH] bootstrap');
  (window.__lab?.bus || document).dispatchEvent(new CustomEvent('dashboard:ready'));
});
