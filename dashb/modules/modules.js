// /dashb/modules/modules.js — Chargement centralisé (compat, sûr & simple)

// Ce fichier n'est chargé que sur /dashb → on pose directement le thème
document.body.classList.add('theme-stellaire', 'lab');
try { localStorage.setItem('codex-theme', 'theme-stellaire'); } catch {}

// Tout après que le DOM soit prêt (évite les wraps à vide du HUD)
document.addEventListener('DOMContentLoaded', async () => {
  try {
    // === HUD (habillage des 6 blocs autour du radar)
    await import('/dashb/modules/hud-panels-init.js');
  } catch (e) {
    console.warn('HUD init failed:', e);
  }

  // === 📚 BASES DE DONNÉES ===
  import('/dashb/modules/dashboard/planet-database.js');        // 🧠 Données planètes
  import('/dashb/modules/dashboard/moon-database.js');          // 🌙 Dictionnaire lunes
  import('/dashb/modules/dashboard/colonization-status.js');    // 🏙️ Statuts colonisation

  // === 🧠 GESTION UI / AFFICHAGE ===
  import('/dashb/modules/dashboard/planet-data.js');            // 🧩 Injection dans les 5 blocs
  import('/dashb/modules/dashboard/planet-sections.js');        // 📋 Rendu par section
  import('/dashb/modules/dashboard/section-switcher.js');       // 🔁 Menus dynamiques

  // === 🔭 VISUALISATION ===
  import('/dashb/modules/dashboard/viewer-planete-3d.js');      // 🌍 Canvas 3D (WebGL)
  import('/dashb/modules/dashboard/simul-system.js');           // ☀️ Radar interactif
  import('/dashb/modules/dashboard/radar-mini.js');             // 🛰️ Radar décoratif

  // === 🌙 MODULE LUNAIRE (canvas)
  import('/dashb/modules/simul-moon/simul-moon-canvas.js')
    .then(m => m?.launchSimulMoonCanvas?.())
    .catch(err => console.warn('simul-moon init failed:', err));

  // === 📝 Toggle bloc note d'observation (dashboard)
  const toggleBtn   = document.getElementById('toggle-note-btn');
  const noteContent = document.getElementById('codex-note-content');
  const icon        = toggleBtn?.querySelector('.note-icon');

  if (toggleBtn && noteContent) {
    toggleBtn.addEventListener('click', () => {
      noteContent.classList.toggle('hidden');
      if (icon) icon.textContent = noteContent.classList.contains('hidden') ? '▶' : '▼';
    });
  }

  console.log('✅ Modules du lab chargés');
});
