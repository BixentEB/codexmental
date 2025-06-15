// 📁 /assets/js/anti-copy.js

// Bloque le clic droit
window.addEventListener('contextmenu', function (e) {
  e.preventDefault();
});

// Bloque les raccourcis de copie, source, enregistrement, etc.
window.addEventListener('keydown', function (e) {
  if ((e.ctrlKey || e.metaKey) && ['c', 'x', 'u', 's', 'p'].includes(e.key.toLowerCase())) {
    e.preventDefault();
  }
});
