// 📁 /assets/js/anti-copy.js (corrigé)

// Bloque le clic droit sauf sur .btn-share-article ou .share-menu
document.addEventListener('contextmenu', e => {
  if (e.target.closest('.btn-share-article') || e.target.closest('.share-menu')) return;
  e.preventDefault();
});

// Bloque certains raccourcis clavier sauf si l'élément actif est un champ ou bouton prévu
document.addEventListener('keydown', e => {
  const key = e.key.toLowerCase();
  const isCtrl = e.ctrlKey || e.metaKey;
  const tag = document.activeElement.tagName.toLowerCase();

  // Autorise clipboard sur les boutons de partage
  const allowClipboard = e.target.closest('.btn-share-article') || e.target.closest('.share-menu');

  if (
    (isCtrl && ['c', 's', 'u', 'p'].includes(key) && !allowClipboard && tag !== 'input' && tag !== 'textarea') ||
    e.keyCode === 123 // F12
  ) {
    e.preventDefault();
  }
});
