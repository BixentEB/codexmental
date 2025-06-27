// Injection du menu
function injectBlogMenu() {
  const container = document.getElementById('menu-injection-point');
  
  if (!container) {
    console.warn("Point d'injection du menu introuvable");
    return;
  }

  // Création de la structure (identique à blog-menu.html)
  container.innerHTML = `
    <div id="viewer-menu-container">
      <nav id="viewer-menu" class="blog-menu">
        <!-- Votre contenu de menu ici -->
        ${document.querySelector('#viewer-menu').innerHTML}
      </nav>
      <button id="viewer-menu-burger" aria-label="Ouvrir le menu des articles">
        <span></span><span></span><span></span>
      </button>
    </div>
  `;

  // Initialisation du burger APRÈS injection
  initBurgerMenu();
}

// Fonction séparée pour le burger
function initBurgerMenu() {
  const burger = document.getElementById("viewer-menu-burger");
  const menu = document.getElementById("viewer-menu");
  const close = document.getElementById("viewer-menu-close");

  if (!burger || !menu || !close) {
    console.warn("Éléments du menu burger introuvables");
    return;
  }

  burger.addEventListener("click", () => {
    menu.classList.toggle("open");
    burger.classList.toggle("open");
  });

  close.addEventListener("click", () => {
    menu.classList.remove("open");
    burger.classList.remove("open");
  });
}

// Lancement
document.addEventListener("DOMContentLoaded", injectBlogMenu);
