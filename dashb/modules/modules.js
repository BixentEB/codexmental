// /dashb/modules/modules.js — point d’entrée unique

document.body.classList.add('theme-stellaire', 'lab', 'dashboard');
try { localStorage.setItem('codex-theme', 'theme-stellaire'); } catch {}
document.documentElement.dataset.theme = 'theme-stellaire';

const isDash = () => location.pathname.startsWith('/dashb');
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

    // Menu thème & blur : supprimés s'ils apparaissent
    document.querySelectorAll('.theme-switcher,[data-theme-menu],.theme-chooser,.theme-panel,.theme-list').forEach(el => el.remove());
    document.body.classList.remove('menu-open');
    document.querySelectorAll('.theme-overlay,.backdrop-blur,.blur-container').forEach(el => { el.style.filter='none'; el.style.backdropFilter='none'; });
    const header = document.getElementById('menu-placeholder') || document.getElementById('site-header');
    if (header) { header.style.position='relative'; header.style.zIndex='5000'; }

    // HUD (auto ON/OFF + deselect)
    try { await import('/dashb/modules/dashboard/ui/init.js'); } catch (e) { console.warn('⚠️ UI init failed:', e); }

    // Radar 2D existant
    try { await import('/dashb/modules/dashboard/simul-system.js'); } catch (e) { console.warn('⚠️ Radar 2D indisponible:', e); }

    console.timeEnd('[DASH] bootstrap');
    flags.bus.dispatchEvent(new CustomEvent('dashboard:ready'));
  });
}
