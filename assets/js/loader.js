// ========================================================
// loader.js – Initialisation globale et effets d’interface Codex Mental
// ========================================================

// Exemple : loader d'intro (si existant)
console.log("\u2728 Lancement de l’étoile filante...");

// Thèmes dynamiques ou animations peuvent être lancées ici
// Exemple : document.body.classList.add('theme-stellaire');

// Rendu du header/footer dynamique (si tu utilises l’injection HTML)
fetch('/menu.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('menu-placeholder').innerHTML = html;
  });

fetch('/footer.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('footer-placeholder').innerHTML = html;
  });

// Initialisation des éléments interactifs globaux (ex. : switch de thème, menu mobile)
window.addEventListener('DOMContentLoaded', () => {
  // Mobile menu
  const toggleBtn = document.getElementById('menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggleBtn && nav) {
    toggleBtn.addEventListener('click', () => {
      nav.classList.toggle('open');
    });
  }

  // Système de thèmes (si présent)
  const themeButtons = document.querySelectorAll('.theme-switcher-icons button');
  themeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      if (theme) {
        document.body.className = `theme-${theme}`;
        localStorage.setItem('theme', theme);
      }
    });
  });

  // Rétablir le dernier thème choisi
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    document.body.className = `theme-${savedTheme}`;
  }
});
