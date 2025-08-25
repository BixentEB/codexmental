// /dashb/modules/modules.js
// Chargement centralisé, unique point d’entrée du dashboard

document.body.classList.add('theme-stellaire','lab');
try { localStorage.setItem('codex-theme','theme-stellaire'); } catch {}

const isDash = () => location.pathname.startsWith('/dashb');

const flags = (window.__lab ||= {
  booted:false,
  bus:new EventTarget(),                   // bus global (léger)
  mark:k=>{window.__lab[k]=true},
  has:k=>!!window.__lab[k],
});

if (!isDash() || flags.has('booted')) {
  console.warn('[LAB] bootstrap ignoré (hors /dashb ou déjà booté)');
} else {
  flags.mark('booted');

  // Démarrage quand le DOM est prêt (modules ne doivent pas re‑écouter DOMContentLoaded)
  document.addEventListener('DOMContentLoaded', async () => {
    console.time('[LAB] bootstrap');

    // 1) HUD v3 : habillage + ON/OFF auto (idempotent)
    try {
      await import('/dashb/modules/dashboard/ui/init.js'); // HUD v3 (habillage + ON/OFF auto)
      console.log('✅ UI v3 prête');
    } catch (e) {
      console.warn('⚠️ UI v3 init failed:', e);
    }

    // 2) Données (chargement parallèle, side‑effect OK)
    await Promise.allSettled([
      import('/dashb/modules/dashboard/planet-database.js'),
      import('/dashb/modules/dashboard/moon-database.js'),
      import('/dashb/modules/dashboard/colonization-status.js'),
    ]);

    // 3) Affichage (idéalement modules “purs”, exportant des init(); sinon side‑effect)
    await Promise.allSettled([
      import('/dashb/modules/dashboard/planet-data.js'),
      import('/dashb/modules/dashboard/planet-sections.js'),
      import('/dashb/modules/dashboard/section-switcher.js'),
    ]);

    // 4) Visualisation (radars/viewers). Lourd → après bases.
    await Promise.allSettled([
      import('/dashb/modules/dashboard/viewer-planete-3d.js'), // Canvas 3D
      import('/dashb/modules/dashboard/simul-system.js'),      // Radar système
      import('/dashb/modules/dashboard/radar-mini.js'),        // Mini-radar décoratif
    ]);

    // 5) Lune (optionnel) — protégé + idempotence soft
    try {
      const m = await import('/dashb/modules/simul-moon/simul-moon-canvas.js');
      if (!flags.has('moonInit') && typeof m?.launchSimulMoonCanvas === 'function') {
        m.launchSimulMoonCanvas();
        flags.mark('moonInit');
      }
    } catch (err) {
      console.warn('ℹ️ simul-moon indisponible:', err);
    }

    // 6) Petits comportements locaux
    const toggleBtn   = document.getElementById('toggle-note-btn');
    const noteContent = document.getElementById('codex-note-content');
    const icon        = toggleBtn?.querySelector('.note-icon');
    if (toggleBtn && noteContent) {
      toggleBtn.addEventListener('click', () => {
        noteContent.classList.toggle('hidden');
        if (icon) icon.textContent = noteContent.classList.contains('hidden') ? '▶' : '▼';
      });
    }

    console.timeEnd('[LAB] bootstrap');
    console.log('✅ Modules du lab chargés');
    flags.bus.dispatchEvent(new CustomEvent('lab:ready'));
  });
}
