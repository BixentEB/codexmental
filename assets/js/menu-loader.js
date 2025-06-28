// Script universel pour charger les menus blog ET atelier
console.log("[MenuLoader] Initialisation...");

document.addEventListener("DOMContentLoaded", async () => {
  await loadPageMenu();
  initBurgerMenu();
});

// Fonction pour détecter le type de page et charger le bon menu
async function loadPageMenu() {
  const container = document.getElementById('blog-menu-container') || 
                   document.getElementById('atelier-menu-container') ||
                   document.getElementById('menu-container');
  
  if (!container) {
    return; // Pas de conteneur = pas de menu
  }

  // Détection automatique du type de page
  const pageType = detectPageType();
  console.log(`[MenuLoader] Type de page détecté: ${pageType}`);

  // Chargement du menu approprié
  const menuHTML = await loadMenuFile(pageType);
  
  if (menuHTML) {
    // Injection du bouton burger + menu
    container.innerHTML = `
      <!-- Bouton burger (visible uniquement mobile) -->
      <button id="viewer-menu-burger" class="burger-button" aria-label="Menu des ${pageType}">
        <span></span>
        <span></span>
        <span></span>
      </button>
      
      <!-- Menu injecté -->
      ${menuHTML}
    `;
    
    console.log(`[MenuLoader] Menu ${pageType} chargé avec succès`);
  }
}

// Fonction pour détecter le type de page
function detectPageType() {
  const currentPath = window.location.pathname;
  const currentFile = window.location.href;
  
  // Détection basée sur l'URL ou le nom du fichier
  if (currentPath.includes('/blog') || currentFile.includes('blog.html')) {
    return 'blog';
  } else if (currentPath.includes('/atelier') || currentFile.includes('atelier.html')) {
    return 'atelier';
  }
  
  // Détection basée sur le titre de la page
  const pageTitle = document.title.toLowerCase();
  if (pageTitle.includes('blog')) {
    return 'blog';
  } else if (pageTitle.includes('atelier')) {
    return 'atelier';
  }
  
  // Détection basée sur l'ID du conteneur
  if (document.getElementById('blog-menu-container')) {
    return 'blog';
  } else if (document.getElementById('atelier-menu-container')) {
    return 'atelier';
  }
  
  // Par défaut
  return 'blog';
}

// Fonction pour charger le fichier menu approprié
async function loadMenuFile(pageType) {
  // Définition des chemins possibles pour chaque type
  const menuPaths = {
    blog: [
      'blog-menu.html',              // Dans le dossier blog/
      './blog-menu.html',            
      '/blog/blog-menu.html',        // Depuis la racine
      'templates/blog-menu.html'     // Structure alternative
    ],
    atelier: [
      'atelier-menu.html',           // Dans le dossier atelier/
      './atelier-menu.html',         
      '/atelier/atelier-menu.html',  // Depuis la racine
      'templates/atelier-menu.html'  // Structure alternative
    ]
  };

  const pathsToTest = menuPaths[pageType] || menuPaths.blog;
  
  // Test de chaque chemin
  for (const path of pathsToTest) {
    try {
      const response = await fetch(path);
      if (response.ok) {
        const content = await response.text();
        console.log(`[MenuLoader] Menu chargé: ${path}`);
        return content;
      }
    } catch (error) {
      // On continue silencieusement au chemin suivant
    }
  }

  // Si rien ne marche, on retourne null = pas de menu
  return null;
}

// Fonction pour gérer le comportement burger
function initBurgerMenu() {
  const burger = document.getElementById("viewer-menu-burger");
  const menu = document.getElementById("viewer-menu");
  const closeBtn = document.getElementById("viewer-menu-close");

  // Si pas de burger = mode PC normal, le menu reste visible
  if (!burger) {
    return;
  }

  // Si pas de menu = échec total
  if (!menu) {
    return;
  }

  // ✅ COMPORTEMENT MOBILE : burger fonctionnel
  
  // Événement clic sur le burger
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
    burger.classList.toggle("open");
  });

  // Événement clic sur le bouton fermer (si existe)
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.remove("open");
      burger.classList.remove("open");
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
}
