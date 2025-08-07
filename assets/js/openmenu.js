// openmenu.js – Accordéon exclusif pour les menus <details> - ferme auto les menus ouverts quand on ouvre un autre
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
