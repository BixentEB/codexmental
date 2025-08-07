// ========================================================
// openmenu.js
// Accordéon exclusif pour les balises <details>
// S'applique à tous les menus de type <details> (Blog, Atelier, Rêves, etc.)
// ========================================================

document.querySelectorAll('details').forEach((menu) => {
  menu.addEventListener('toggle', () => {
    if (menu.open) {
      document.querySelectorAll('details').forEach((other) => {
        if (other !== menu) {
          other.removeAttribute('open');
        }
      });
    }
  });
});
