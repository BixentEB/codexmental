// assets/js/atelier.js
fetch('/partials/atelier-menu.html')
  .then(r => r.text())
  .then(html => {
    document.getElementById('atelier-menu').innerHTML = html;
  });
