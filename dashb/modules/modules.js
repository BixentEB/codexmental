// /dashb/modules/modules.js — point d’entrée unique du dashboard (corrigé)

(() => {
  // 0) Forcer le thème stellaire très tôt
  const root = document.documentElement;
  const body = document.body;
  const toRemove = [...body.classList].filter(c => c.startsWith('theme-') && c !== 'theme-stellaire');
  toRemove.forEach(c => body.classList.remove(c));
  body.classList.add('theme-stellaire', 'lab', 'dashboard');
  root.dataset.theme = 'theme-stellaire';
  try { localStorage.setItem('codex-theme', 'theme-stellaire'); } catch {}

  // Nettoyage des widgets de thème si présents
  const kill = (sel) => document.querySelectorAll(sel).forEach(n => n.remove());
  kill('.theme-switcher, [data-theme-menu], .theme-panel, .theme-list, .theme-fab-container, .theme-overlay, .backdrop-blur');

  // Exposer un petit bus si besoin (optionnel)
  window.__lab = window.__lab || { booted:false, bus:new EventTarget() };
})();

document.addEventListener('DOMContentLoaded', async () => {
  console.time('[DASH] bootstrap');

  // Mettre le header au dessus
  const header = document.getElementById('menu-placeholder') || document.getElementById('site-header');
  if (header) { header.style.position = 'relative'; header.style.zIndex = '5000'; }

  // 1) UI / HUD (compat blocs → chips, conteneurs #info-*)
  try {
    await import('/dashb/modules/dashboard/ui/init.js');
  } catch (e) {
    console.warn('⚠️ UI init failed:', e);
  }

  // 2) Radar 2D (simul)
  try {
    await import('/dashb/modules/dashboard/simul-system.js');
  } catch (e) {
    console.warn('⚠️ Radar 2D indisponible:', e);
  }

  console.timeEnd('[DASH] bootstrap');
  (window.__lab?.bus || document).dispatchEvent(new CustomEvent('dashboard:ready'));
});
