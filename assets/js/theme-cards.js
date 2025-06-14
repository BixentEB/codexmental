document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.dataset.theme;

    // Met à jour le localStorage
    localStorage.setItem('codexTheme', `theme-${theme}`);

    // Change visuellement la carte active
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');

    // Change le <link> vers la feuille de style
    const themeLink = document.getElementById('theme-style');
    if (themeLink) {
      themeLink.href = `/assets/css/themes/theme-${theme}.css`;
    }

    // Applique les effets visuels si setTheme est défini
    if (typeof setTheme === 'function') {
      setTheme(`theme-${theme}`);
    }
  });
});
