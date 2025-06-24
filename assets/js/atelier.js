// assets/js/atelier.js

// Injection du menu
fetch('/atelier/atelier-menu.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('atelier-menu').innerHTML = html;
  });

// Injection du viewer dynamique
window.chargerProjet = function(nom) {
  fetch(`/atelier/${nom}.html`)
    .then(response => response.text())
    .then(html => {
      document.getElementById("article-viewer").innerHTML = html;
    })
    .catch(error => {
      document.getElementById("article-viewer").innerHTML = `<p class='erreur'>Erreur de chargement : ${nom}.html</p>`;
    });
};
