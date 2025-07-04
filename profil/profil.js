// 🌿 Sélecteurs communs
const sousMenu = document.querySelector('.sous-menu');
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

// 🌟 Boutons du menu SVG
iconButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.path;
    const color = getComputedStyle(btn).color;

    // 🎨 Définir la couleur héritée dynamique
    visualizer.style.setProperty('--accent-color', color);
    sousMenu.style.setProperty('--accent-color', color);

    // Réinitialiser visualiseur
    visualizer.innerHTML = '';

    // Charger le sous-menu
    fetch(`sections/${section}/sousmenu.html`)
      .then(res => {
        if (!res.ok) throw new Error("Fichier introuvable");
        return res.text();
      })
      .then(html => {
        sousMenu.innerHTML = html;
        sousMenu.dataset.section = section; // stocke la section active
      })
      .catch(err => {
        sousMenu.innerHTML = `<p style="color:red;">Erreur sous-menu : ${err.message}</p>`;
      });

    // Mettre à jour actif
    iconButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
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

// 🌟 Sous-menus dynamiques avec delegation
document.addEventListener('click', (event) => {
  if (event.target.matches('.sous-menu button')) {
    const btn = event.target;
    const sub = btn.dataset.subsection;
    const section = sousMenu.dataset.section; // récupère la section active

    if (section && sub) {
      fetch(`sections/${section}/${sub}.html`)
        .then(res => {
          if (!res.ok) throw new Error("Fichier introuvable");
          return res.text();
        })
        .then(html => {
          visualizer.innerHTML = html;
        })
        .catch(err => {
          visualizer.innerHTML = `<p style="color:red;">Erreur contenu : ${err.message}</p>`;
        });

      // Mettre à jour actif
      btn.closest('.sous-menu').querySelectorAll('button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    }
  }
});

// 🌟 Duplication dynamique du menu icônes pour mobile uniquement
if (window.innerWidth <= 768) {
  const menu = document.querySelector('.menu-icons-svg ul');
  const mobileContainer = document.getElementById('mobile-icons-container');
  if (menu && mobileContainer) {
    // Clone du <ul>
    const clone = menu.cloneNode(true);
    clone.classList.add('mobile-icons-menu');
    mobileContainer.appendChild(clone);
  }
}

// 🌟 Activer les boutons du menu mobile
const mobileIconButtons = document.querySelectorAll('.mobile-icons-menu .icon-btn');
mobileIconButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const section = btn.dataset.path;
    const color = getComputedStyle(btn).color;

    visualizer.style.setProperty('--accent-color', color);
    sousMenu.style.setProperty('--accent-color', color);

    visualizer.innerHTML = '';

    fetch(`sections/${section}/sousmenu.html`)
      .then(res => {
        if (!res.ok) throw new Error("Fichier introuvable");
        return res.text();
      })
      .then(html => {
        sousMenu.innerHTML = html;
        sousMenu.dataset.section = section;
      })
      .catch(err => {
        sousMenu.innerHTML = `<p style="color:red;">Erreur sous-menu : ${err.message}</p>`;
      });

    mobileIconButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
  });
});
