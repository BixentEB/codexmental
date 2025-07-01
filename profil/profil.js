// 🌿 Sélecteurs communs
const visualizer = document.querySelector('.profil-visualizer');
const iconButtons = document.querySelectorAll('.menu-icons-svg .icon-btn');
const burgerBtn = document.querySelector('.burger-btn');
const nav = document.querySelector('.profil-nav');

// 🌟 Toggle du menu burger
if (burgerBtn && nav) {
  burgerBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

// 🌿 Liens du menu burger
document.querySelectorAll('.profil-nav li[data-section]').forEach(link => {
  link.addEventListener('click', () => {
    const section = link.dataset.section;
    loadSection(section);
    nav.classList.remove('open');
    // Retirer l'état actif des icônes
    iconButtons.forEach(btn => btn.classList.remove('active'));
  });
});

// 🌟 Boutons du menu SVG
iconButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section || btn.dataset.target;
    loadSection(section);
    // Activer le bouton cliqué
    iconButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
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

// 🌱 Section par défaut si on est dans /profil/
window.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname;

  // Si l'URL correspond à /profil/ ou /profil/index.html
  if (/\/profil(\/(index\.html)?)?$/.test(currentPage)) {
    loadSection('bio');
    const bioBtn = document.querySelector('.menu-icons-svg .icon-btn[data-section="bio"]');
    if (bioBtn) bioBtn.classList.add('active');
  }
});

// 🌟 Survol plus clair
iconButtons.forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.querySelector("svg").style.opacity = "0.8";
  });
  btn.addEventListener("mouseleave", () => {
    btn.querySelector("svg").style.opacity = "1";
  });
});
