// /dashb/modules/modules.js — point d’entrée unique du dashboard

// 0) Reset agressif de thème le plus tôt possible
(() => {
  const root = document.documentElement;
  const body = document.body;

  // Nettoie toutes les classes theme-* sauf stellaire
  const toRemove = [...body.classList].filter(c => c.startsWith('theme-') && c !== 'theme-stellaire');
  toRemove.forEach(c => body.classList.remove(c));

  body.classList.add('theme-stellaire', 'lab', 'dashboard');
  root.dataset.theme = 'theme-stellaire';
  try { localStorage.setItem('codex-theme', 'theme-stellaire'); } catch {}

  // Supprime synchronement les widgets de thème s'ils sont déjà là
  document.querySelectorAll(
    '.theme-switcher,[data-theme-menu],.theme-chooser,.theme-panel,.theme-list,.theme-fab-container'
  ).forEach(el => el.remove());

  // Et s'ils réapparaissent plus tard → on les enlève immédiatement
  const killer = (node) => {
    if (!(node instanceof HTMLElement)) return;
    if (node.matches?.('.theme-switcher,[data-theme-menu],.theme-chooser,.theme-panel,.theme-list,.theme-fab-container')) {
      node.remove();
    }
    node.querySelectorAll?.('.theme-switcher,[data-theme-menu],.theme-chooser,.theme-panel,.theme-list,.theme-fab-container')
      .forEach(el => el.remove());
  };
  const mo = new MutationObserver(muts => muts.forEach(m => {
    [...m.addedNodes].forEach(killer);
  }));
  mo.observe(document.documentElement, { childList:true, subtree:true });
})();

// Détection page dashboard
const isDash = () => location.pathname.startsWith('/dashb');

// Bus/flags globaux légers
const flags = (window.__lab ||= {
  booted: false,
  bus: new EventTarget(),
  mark: k => { window.__lab[k] = true; },
  has:  k => !!window.__lab[k],
});

if (!isDash() || flags.has('booted')) {
  console.warn('[DASH] bootstrap ignoré (hors /dashb ou déjà booté)');
} else {
  flags.mark('booted');

  document.addEventListener('DOMContentLoaded', async () => {
    console.time('[DASH] bootstrap');

    // Header au-dessus
    const header = document.getElementById('menu-placeholder') || document.getElementById('site-header');
    if (header) { header.style.position='relative'; header.style.zIndex='5000'; }

    // HUD (auto ON/OFF + deselect + miroir)
    try { await import('/dashb/modules/dashboard/ui/init.js'); } catch (e) { console.warn('⚠️ UI init failed:', e); }

    // Radar 2D existant
    try { await import('/dashb/modules/dashboard/simul-system.js'); } catch (e) { console.warn('⚠️ Radar 2D indisponible:', e); }

    console.timeEnd('[DASH] bootstrap');
    flags.bus.dispatchEvent(new CustomEvent('dashboard:ready'));
  });
}
