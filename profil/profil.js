const burgerBtn = document.querySelector('.burger-btn');
const nav = document.querySelector('.profil-nav');
const links = document.querySelectorAll('.profil-nav li[data-section]');
const visualizer = document.querySelector('.profil-visualizer');

// Burger toggle
burgerBtn.addEventListener('click', () => {
  nav.classList.toggle('open');
});

// Chargement dynamique
links.forEach(link => {
  link.addEventListener('click', () => {
    const section = link.getAttribute('data-section');
    fetch(`sections/${section}.html`)
      .then(res => res.text())
      .then(html => {
        visualizer.innerHTML = html;
        nav.classList.remove('open'); // Fermer le menu mobile
      });
  });
});

// Optionnel : charger une section par défaut
window.addEventListener('DOMContentLoaded', () => {
  fetch(`sections/profil.html`)
    .then(res => res.text())
    .then(html => {
      visualizer.innerHTML = html;
    });
});


// menu dynamique svg
document.querySelectorAll('.icon-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.content-block').forEach(div => div.classList.remove('active'));
    const id = btn.dataset.target;
    if (id) {
      document.getElementById(id).classList.add('active');
    }
  });
});

