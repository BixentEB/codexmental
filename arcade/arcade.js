function loadGame(url) {
  const screen = document.getElementById('arcade-screen');

  screen.innerHTML = '<p style="color:#0f0; text-align:center;">⏳ Chargement en cours...</p>';

  document.querySelectorAll('link[data-arcade-style]').forEach(link => link.remove());
  screen.querySelectorAll('script').forEach(s => s.remove());

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
