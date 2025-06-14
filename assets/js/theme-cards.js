// Vérifie la présence de la fonction setTheme
if (typeof setTheme === "function") {
  document.querySelectorAll('.theme-card').forEach(card => {
    card.addEventListener('click', () => {
      const theme = card.dataset.theme;
      setTheme(theme); // Applique le thème cliqué
    });
  });
} else {
  console.warn("⚠️ La fonction setTheme(theme) n’est pas définie.");
}

// Ajoute une classe "active" à la carte sélectionnée
document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
    card.classList.add('active');
    const theme = card.dataset.theme;
    if (typeof setTheme === "function") setTheme(theme);
  });
});
