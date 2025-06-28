// Script unifié pour charger et gérer le menu blog
console.log("[BlogMenu] Initialisation...");

document.addEventListener("DOMContentLoaded", async () => {
  await loadBlogMenu();
  initBurgerMenu();
});

// Fonction pour charger le menu depuis blog-menu.html
async function loadBlogMenu() {
  const container = document.getElementById('blog-menu-container');
  
  if (!container) {
    console.error("[BlogMenu] Conteneur #blog-menu-container introuvable");
    return;
  }

  try {
    // Charger le contenu du menu
    const response = await fetch('templates/blog-menu.html');
    if (!response.ok) {
      throw new Error(`Erreur HTTP: ${response.status}`);
    }
    
    const menuHTML = await response.text();
    
    // Ajouter le bouton burger + le menu
    container.innerHTML = `
      <!-- Bouton burger (visible uniquement mobile) -->
      <button id="viewer-menu-burger" class="burger-button" aria-label="Menu des articles">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <!-- Menu injecté -->
      ${menuHTML}
    `;
    
    console.log("[BlogMenu] Menu chargé avec succès");
    
  } catch (error) {
    console.error("[BlogMenu] Erreur lors du chargement:", error);
    // Fallback en cas d'erreur
    container.innerHTML = `
      <div class="menu-error">
        <p>Impossible de charger le menu des articles</p>
      </div>
    `;
  }
}

// Fonction pour gérer le comportement burger
function initBurgerMenu() {
  const burger = document.getElementById("viewer-menu-burger");
  const menu = document.getElementById("viewer-menu");
  const closeBtn = document.getElementById("viewer-menu-close");

  if (!burger) {
    console.warn("[BlogMenu] Bouton burger introuvable");
    return;
  }

  if (!menu) {
    console.warn("[BlogMenu] Menu #viewer-menu introuvable");
    return;
  }

  // Événement clic sur le burger
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
    burger.classList.toggle("open");
    console.log("[BlogMenu] Toggle menu:", menu.classList.contains("open"));
  });

  // Événement clic sur le bouton fermer (si existe)
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.remove("open");
      burger.classList.remove("open");
      console.log("[BlogMenu] Menu fermé");
    });
  }

  // Fermer le menu en cliquant à l'extérieur (mobile seulement)
  document.addEventListener("click", (e) => {
    if (window.innerWidth <= 768 && 
        menu.classList.contains("open") && 
        !menu.contains(e.target) && 
        !burger.contains(e.target)) {
      menu.classList.remove("open");
      burger.classList.remove("open");
    }
  });

  console.log("[BlogMenu] Interactions burger initialisées");
}
