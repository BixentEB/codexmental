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
    document.querySelectorAll(
      '.theme-switcher,[data-theme-menu],.theme-chooser,.theme-panel,.theme-list,.theme-fab-container' // ← FAB thème
    ).forEach(el => el.remove());
    document.body.classList.remove('menu-open');
    document.querySelectorAll('.theme-overlay,.backdrop-blur,.blur-container')
      .forEach(el => { el.style.filter='none'; el.style.backdropFilter='none'; });

    // Header au-dessus
    const header = document.getElementById('menu-placeholder') || document.getElementById('site-header');
    if (header) { header.style.position='relative'; header.style.zIndex='5000'; }

    // HUD (auto ON/OFF + deselect)
    try { await import('/dashb/modules/dashboard/ui/init.js'); } catch (e) { console.warn('⚠️ UI init failed:', e); }

    // Radar 2D existant
    try { await import('/dashb/modules/dashboard/simul-system.js'); } catch (e) { console.warn('⚠️ Radar 2D indisponible:', e); }

    // (Optionnel) Lune : garde-fou déjà présent — laisse commenté si tu veux un v0 minimal
    // try {
    //   const m = await import('/dashb/modules/simul-moon/simul-moon-canvas.js');
    //   if (!flags.has('moonInit') && typeof m?.launchSimulMoonCanvas === 'function') {
    //     m.launchSimulMoonCanvas();
    //     flags.mark('moonInit');
    //   }
    // } catch (err) { console.warn('ℹ️ simul-moon indisponible:', err); }

    // Note locale (si présente)
    const toggleBtn   = document.getElementById('toggle-note-btn');
    const noteContent = document.getElementById('codex-note-content');
    const icon        = toggleBtn?.querySelector('.note-icon');
    if (toggleBtn && noteContent) {
      toggleBtn.addEventListener('click', () => {
        noteContent.classList.toggle('hidden');
        if (icon) icon.textContent = noteContent.classList.contains('hidden') ? '▶' : '▼';
      });
    }

    console.timeEnd('[DASH] bootstrap');
    flags.bus.dispatchEvent(new CustomEvent('dashboard:ready'));
  });
}
