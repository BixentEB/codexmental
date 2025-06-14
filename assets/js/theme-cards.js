document.querySelectorAll('.theme-card').forEach(card => {
  card.addEventListener('click', () => {
    const theme = card.dataset.theme;

    // Marquer la carte active
    document.querySelectorAll('.theme-card').forEach(c => {
      c.classList.remove('active');
    });
    card.classList.add('active');

    // Mise à jour de la feuille de style dynamique
    const themeLink = document.getElementById('theme-style');
    if (themeLink) {
      themeLink.href = `/assets/css/themes/${theme}.css`; // ✅ correction ici
    } else {
      console.warn("⚠️ Le lien <link id='theme-style'> est introuvable.");
    }

    // Sauvegarde du thème pour le restaurer plus tard
    localStorage.setItem('codexTheme', theme); // ✅ ajoute ça
  });
});
