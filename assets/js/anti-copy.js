// 📁 /assets/js/anti-copy.js

// Bloque le clic droit (menu contextuel)
document.addEventListener('contextmenu', e => e.preventDefault());

// Bloque certains raccourcis clavier (Ctrl/Cmd + C, S, U, P, I, etc.)
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  const isCtrl = e.ctrlKey || e.metaKey;

  if (
    (isCtrl && ['c', 's', 'u', 'p'].includes(key)) || // copier, sauvegarder, code source, imprimer
    (e.keyCode === 123) // F12 (DevTools)
  ) {
    e.preventDefault();
  }
});
