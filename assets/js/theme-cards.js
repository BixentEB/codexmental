document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.dataset.theme; // Récupère "solaire", "lunaire", etc.

    // Mise à jour du localStorage
    localStorage.setItem('codexTheme', `theme-${theme}`);

    // Changer dynamiquement le lien vers la feuille de style du thème
    const themeLink = document.getElementById('theme-style');
    if (themeLink) {
      themeLink.href = `/assets/css/themes/theme-${theme}.css`;
    } else {
      console.warn("⚠️ Le lien <link id='theme-style'> est introuvable.");
    }

    // Appliquer visuellement la carte active
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.remove('active');
    });
    card.classList.add('active');
  });
});
