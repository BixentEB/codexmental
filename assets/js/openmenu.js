/* gérer le comportement exclusif d’ouverture des menus <details> */
/* Se déclenche à chaque ouverture - Ferme tous les autres <details> sauf celui qu'on vient d’ouvrir */

<script>
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
</script>
