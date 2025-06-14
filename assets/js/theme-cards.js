document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.dataset.theme;

    // Activer visuellement la carte sélectionnée
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.remove('active');
    });
    card.classList.add('active');

    // Mettre à jour dynamiquement la feuille de style du thème
    const themeLink = document.getElementById('theme-style');
    if (themeLink) {
      themeLink.href = `/assets/css/themes/theme-${theme}.css`;
    } else {
      console.warn("⚠️ Le lien <link id='theme-style'> est introuvable.");
    }
  });
});
