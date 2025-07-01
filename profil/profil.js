// 🌿 Sélecteurs communs
const visualizer = document.querySelector('.profil-visualizer');
const iconButtons = document.querySelectorAll('.menu-icons-svg .icon-btn');
const burgerBtn = document.querySelector('.burger-btn');
const nav = document.querySelector('.profil-nav');

// 🌟 Toggle menu burger
if (burgerBtn && nav) {
  burgerBtn.addEventListener('click', () => {
    nav.classList.toggle('open');
  });
}

// 🌿 Liens menu burger
document.querySelectorAll('.profil-nav li[data-path]').forEach(link => {
  link.addEventListener('click', () => {
    const path = link.dataset.path;
    loadSection(path);
    nav.classList.remove('open');
    iconButtons.forEach(btn => btn.classList.remove('active'));
  });
});

// 🌟 Boutons menu icônes
iconButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const path = btn.dataset.path || btn.dataset.section;
    if (!path) return;

    // Nettoie les classes
    visualizer.className = 'profil-visualizer';

    // Ajoute la classe correspondant à la section
    const base = path.split('/')[0];
    visualizer.classList.add(base);

    // Déclare la couleur de thème
    let color = '#ffffff';
    switch (base) {
      case 'influences': color = '#66ffaa'; break;
      case 'passions': color = '#ff6699'; break;
      case 'bio': color = '#88aaff'; break;
      case 'references': color = '#ffaa44'; break;
      case 'gaming': color = '#ffcc00'; break;
      case 'voyages': color = '#55ffee'; break;
      case 'aspirations': color = '#ff88ff'; break;
    }
    visualizer.style.setProperty('--theme-color', color);

    // Active le bouton
    iconButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    // Charge la section
    loadSection(path);
  });
});

// 🌱 Fonction de chargement
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

// 🌟 Hover clair sur icônes
iconButtons.forEach(btn => {
  btn.addEventListener("mouseenter", () => {
    btn.querySelector("svg").style.opacity = "0.8";
  });
  btn.addEventListener("mouseleave", () => {
    btn.querySelector("svg").style.opacity = "1";
  });
});

// 🌟 Sous-menus dynamiques (delegation)
document.addEventListener('click', (event) => {
  if (event.target.matches('.sous-menu button')) {
    const btn = event.target;
    const sub = btn.dataset.subsection;
    const container = btn.closest('.subsection-container');
    const section = visualizer.classList[1]; // ex: influences, passions...

    if (container && section && sub) {
      fetch(`sections/${section}/${sub}.html`)
        .then(res => {
          if (!res.ok) throw new Error("Fichier introuvable");
          return res.text();
        })
        .then(html => {
          container.innerHTML = html;
        })
        .catch(err => {
          container.innerHTML = `<p style="color:red;">Erreur : ${err.message}</p>`;
        });
    }
  }
});
