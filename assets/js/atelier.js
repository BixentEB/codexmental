// atelier.js – Injection du menu et chargement dynamique des projets

document.addEventListener('DOMContentLoaded', () => {
  fetch('/atelier/atelier-menu.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('atelier-menu').innerHTML = html;
      // Si tu veux activer les liens data-viewer dans l'atelier, voici comment :
      document.querySelectorAll('#atelier-menu a[data-projet]').forEach(link => {
        link.addEventListener('click', e => {
          e.preventDefault();
          loadProject(link.getAttribute('data-projet'));
        });
      });
    })
    .catch(err => console.error('Erreur menu atelier:', err));
});

// Fonction de chargement de projets
function loadProject(nom) {
  fetch(`/atelier/${nom}.html`)
    .then(res => {
      if (!res.ok) throw new Error('Erreur projet introuvable');
      return res.text();
    })
    .then(html => {
      document.getElementById('article-viewer').innerHTML = html;
    })
    .catch(err => {
      document.getElementById('article-viewer').innerHTML =
        `<p class='erreur'>Erreur de chargement : ${nom}.html</p>`;
      console.error(err);
    });
}
