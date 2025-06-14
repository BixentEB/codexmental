document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.dataset.theme;

    // Appliquer le thème si possible
    if (typeof setTheme === "function") {
      setTheme(theme);
    } else {
      console.warn("⚠️ La fonction setTheme(theme) n’est pas définie.");
    }

    // Retirer "active" et "flipped" des autres cartes
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.remove('active');
      c.classList.remove('flipped');
    });

    // Appliquer à la carte cliquée
    card.classList.add('active');
    card.classList.add('flipped');

    // Revenir automatiquement à la face après 5 secondes
    setTimeout(() => {
      card.classList.remove('flipped');
    }, 5000);
  });
});
