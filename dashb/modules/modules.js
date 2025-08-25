// /dashb/modules/modules.js
// Chargement centralisé, unique point d’entrée du dashboard

// — classes de page (compat + nouvelle référence)
document.body.classList.add('theme-stellaire', 'lab', 'dashboard');
try { localStorage.setItem('codex-theme', 'theme-stellaire'); } catch {}
// Force aussi le data-theme au niveau <html> pour éviter les surcharges globales
document.documentElement.dataset.theme = 'theme-stellaire';

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

  // Démarrage quand le DOM est prêt (les modules internes ne doivent pas écouter DOMContentLoaded)
  document.addEventListener('DOMContentLoaded', async () => {
    console.time('[DASH] bootstrap');

    // --- Garde‑fous DASHBOARD : header au-dessus, pas de switcher de thème, pas de blur ---
    document.querySelectorAll('.theme-switcher,[data-theme-menu],.theme-chooser,.theme-panel,.theme-list')
      .forEach(el => el.remove());
    document.body.classList.remove('menu-open');
    document.querySelectorAll('.theme-overlay,.backdrop-blur,.blur-container').forEach(el => {
      el.style.filter = 'none';
      el.style.backdropFilter = 'none';
    });
    const header = document.getElementById('menu-placeholder') || document.getElementById('site-header');
    if (header) { header.style.position = 'relative'; header.style.zIndex = '2000'; }
    // -------------------------------------------------------------------------------

    // HUD : habillage + ON/OFF auto
    try {
      await import('/dashb/modules/dashboard/ui/init.js');
      console.log('✅ UI init');
    } catch (e) { console.warn('⚠️ UI init failed:', e); }

    // Visualisation — radar 2D (baseline)
    try {
      await import('/dashb/modules/dashboard/simul-system.js');
      console.log('✅ Radar 2D prêt');
    } catch (e) { console.warn('⚠️ Radar 2D indisponible:', e); }

    // (Optionnel) Lune (protégé + idempotence douce)
    try {
      const m = await import('/dashb/modules/simul-moon/simul-moon-canvas.js');
      if (!flags.has('moonInit') && typeof m?.launchSimulMoonCanvas === 'function') {
        m.launchSimulMoonCanvas();
        flags.mark('moonInit');
      }
    } catch (err) { console.warn('ℹ️ simul-moon indisponible:', err); }

    // Petits comportements locaux (si le bloc note existe)
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
    console.log('✅ Dashboard prêt');
    flags.bus.dispatchEvent(new CustomEvent('dashboard:ready'));
  });
}
