function loadGame(url) {
  const screen = document.getElementById('arcade-screen');

  // Vérifie si c'est PacBunny
  const isPacBunny = url.includes('/arcade/games/pacbunny/');

  if (isPacBunny) {
    // Intro avec la tête du lapin et son
    screen.innerHTML = `
      <div style="text-align:center;">
        <img src="https://bixenteb.github.io/cdxmt/games/bunny_intro.png" width="96" height="96" alt="Lapin IA">
        <p style="color:#0f0;">🐰 Prêt à collecter les octets...</p>
      </div>
    `;

    const audio = new Audio('https://bixenteb.github.io/cdxmt/games/sound/gstart1.mp3');
    audio.play();

    // Délai avant chargement
    setTimeout(() => {
      loadGameContent(url, screen);
    }, 2000);
  } else {
    // Autres jeux : pas d'intro
    loadGameContent(url, screen);
  }
}

/**
 * Fonction qui charge le HTML/CSS/JS du jeu
 * @param {string} url
 * @param {Element} screen
 */
function loadGameContent(url, screen) {
  // Affiche message
  screen.innerHTML = '<p style="color:#0f0; text-align:center;">⏳ Chargement en cours...</p>';

  // Nettoyage CSS
  document.querySelectorAll('link[data-arcade-style]').forEach(link => link.remove());

  // Nettoyage scripts
  screen.querySelectorAll('script').forEach(s => s.remove());

  // Fetch du contenu
  fetch(url)
    .then(response => response.text())
    .then(html => {
      screen.innerHTML = html;

      let cssPath = '';
      let scriptPath = '';

      if (url.includes('/arcade/games/pacbunny/v1/pacbunny-v1.html')) {
        cssPath = '/arcade/games/pacbunny/v1/pacbunny-v1.css';
        scriptPath = '/arcade/games/pacbunny/v1/pacbunny-v1.js';
      }

      if (url.includes('/arcade/games/pacbunny/v2/pacbunny-v2.html')) {
        cssPath = '/arcade/games/pacbunny/v2/pacbunny-v2.css';
        scriptPath = '/arcade/games/pacbunny/v2/pacbunny-v2.js';
      }

      if (url.includes('/arcade/games/pacbunny/v3/pacbunny-v3.html')) {
        cssPath = '/arcade/games/pacbunny/v3/pacbunny-v3.css';
        scriptPath = '/arcade/games/pacbunny/v3/pacbunny-v3.js';
      }

      if (url.includes('flappy-bunny.html')) {
        cssPath = '/arcade/games/flappy-bunny.css';
        scriptPath = '/arcade/games/flappy-bunny.js';
      }

      if (cssPath) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = cssPath;
        link.dataset.arcadeStyle = 'true';
        document.head.appendChild(link);
      }

      if (scriptPath) {
        const script = document.createElement('script');
        script.src = scriptPath;
        script.defer = true;
        screen.appendChild(script);
      }
    })
    .catch(error => {
      console.error('Erreur lors du chargement du jeu:', error);
      screen.innerHTML = '<p style="color:red;">❌ Impossible de charger le jeu.</p>';
    });
}
