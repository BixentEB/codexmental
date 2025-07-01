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
document.querySelectorAll('.profil-nav li[data-path]').forEach(link => {
  link.addEventListener('click', () => {
    const path = link.dataset.path;
    loadSection(path);
    nav.classList.remove('open');
    iconButtons.forEach(btn => btn.classList.remove('active'));
  });
});

// 🌟 Boutons du menu SVG
iconButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const path = btn.dataset.path;
    loadSection(path);
    iconButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});

// 🌱 Fonction centrale de chargement
function loadSection(path) {
  if (!path) return;
  fetch(`sections/${path}`)
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

// 🌟 Survol plus clair
iconButtons.forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.querySelector("svg").style.opacity = "0.8";
  });
  btn.addEventListener("mouseleave", () => {
    btn.querySelector("svg").style.opacity = "1";
  });
});
