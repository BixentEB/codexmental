document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.dataset.theme;

    // Mémoriser dans le localStorage
    localStorage.setItem('codexTheme', `theme-${theme}`);

    // Appliquer dynamiquement la feuille de style
    const themeLink = document.getElementById('theme-style');
    if (themeLink) {
      themeLink.href = `/assets/css/themes/theme-${theme}.css`;
    }

    // Mettre à jour visuellement la carte active
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
  });
});
