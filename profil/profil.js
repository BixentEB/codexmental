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

    // Retirer l'état actif des icônes
    document.querySelectorAll('.menu-icons-svg .icon-btn').forEach(btn => btn.classList.remove('active'));
  });
});

// 🌟 Boutons du menu SVG
document.querySelectorAll('.menu-icons-svg .icon-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.section || btn.dataset.target; // Compatibilité
    loadSection(section);

    // Retirer l'état actif de tous les boutons
    document.querySelectorAll('.menu-icons-svg .icon-btn').forEach(b => b.classList.remove('active'));
    // Ajouter l'état actif à celui cliqué
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

// 🌱 Section par défaut au démarrage
window.addEventListener('DOMContentLoaded', () => {
  loadSection('profil');
  // Optionnel: marquer le premier bouton comme actif au chargement
  const firstBtn = document.querySelector('.menu-icons-svg .icon-btn[data-section="profil"]');
  if (firstBtn) firstBtn.classList.add('active');
});

// 🌟 Survol plus clair
document.querySelectorAll(".icon-btn").forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.querySelector("svg").style.opacity = "0.8";
  });
  btn.addEventListener("mouseleave", () => {
    btn.querySelector("svg").style.opacity = "1";
  });
});
