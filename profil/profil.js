// 🌿 Sélecteurs communs
const visualizer = document.querySelector('.profil-visualizer');

// 🌟 Burger Menu
const burgerBtn = document.querySelector('.burger-btn');
const nav = document.querySelector('.profil-nav');

// Toggle du menu burger
if (burgerBtn && nav) {
  burgerBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

// 🌿 Liens du Burger Menu
document.querySelectorAll('.profil-nav li[data-section]').forEach(link => {
  link.addEventListener('click', () => {
    const section = link.dataset.section;
    loadSection(section);
    nav.classList.remove('open'); // Fermer le menu après clic
  });
});

// 🌟 Boutons du menu SVG
document.querySelectorAll('.menu-icons-svg .icon-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section || btn.dataset.target; // Pour compatibilité
    loadSection(section);
  });
});

// 🌱 Fonction centrale de chargement
function loadSection(section) {
  if (!section) return;
  fetch(`sections/${section}.html`)
    .then(res => {
      if (!res.ok) throw new Error("Fichier introuvable");
      return res.text();
    })
    .then(html => {
      visualizer.innerHTML = html;
    })
    .catch(err => {
      visualizer.innerHTML = `<p style="color:red;">Erreur : ${err.message}</p>`;
    });
}

// 🌱 Section par défaut au démarrage
window.addEventListener('DOMContentLoaded', () => {
  loadSection('profil');
});
