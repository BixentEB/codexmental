document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.dataset.theme;

    // Appliquer le thème si la fonction est disponible
    if (typeof setTheme === "function") {
      setTheme(theme);
    } else {
      console.warn("⚠️ La fonction setTheme(theme) n’est pas définie.");
    }

    // Gérer la classe "active"
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.remove('active');
    });
    card.classList.add('active');
  });
});
