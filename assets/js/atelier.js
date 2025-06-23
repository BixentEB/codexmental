// assets/js/atelier.js
fetch('/atelier/atelier-menu.html')
  .then(res => res.text())
  .then(html => {
    document.getElementById('atelier-menu').innerHTML = html;
  });
