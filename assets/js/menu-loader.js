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
    console.error("[MenuLoader] Aucun conteneur de menu trouvé");
    return;
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
      console.log(`[MenuLoader] Tentative: ${path}`);
      const response = await fetch(path);
      if (response.ok) {
        const content = await response.text();
        console.log(`[MenuLoader] Succès avec: ${path}`);
        return content;
      }
    } catch (error) {
      console.log(`[MenuLoader] Échec pour: ${path}`);
    }
  }

  console.error(`[MenuLoader] Impossible de charger le menu ${pageType}`);
  return createFallbackMenu(pageType);
}

// Fonction de fallback avec menu par défaut
function createFallbackMenu(pageType) {
  if (pageType === 'atelier') {
    return `
      <div id="viewer-menu-container">
        <nav id="viewer-menu" class="atelier-menu">
          <div class="viewer-menu-header">
            <h2>🔧 Atelier</h2>
            <button id="viewer-menu-close" aria-label="Fermer le menu">×</button>
          </div>

          <details open>
            <summary>🛠️ Projets</summary>
            <ul>
              <li><a href="#" data-viewer="projets/projet1">Projet 1</a></li>
              <li><a href="#" data-viewer="projets/projet2">Projet 2</a></li>
            </ul>
          </details>

          <details>
            <summary>💡 Tutoriels</summary>
            <ul>
              <li><a href="#" data-viewer="tutos/tuto1">Tutoriel 1</a></li>
              <li><a href="#" data-viewer="tutos/tuto2">Tutoriel 2</a></li>
            </ul>
          </details>
        </nav>
      </div>
    `;
  }
  
  // Fallback pour blog (défaut)
  return `
    <div id="viewer-menu-container">
      <nav id="viewer-menu" class="blog-menu">
        <div class="viewer-menu-header">
          <h2>📚 Articles</h2>
          <button id="viewer-menu-close" aria-label="Fermer le menu">×</button>
        </div>

        <details open>
          <summary>🤖 Intelligence Artificielle</summary>
          <ul>
            <li><a href="#" data-viewer="ai/local">Installer une IA en local ?</a></li>
            <li><a href="#" data-viewer="ai/limites">L'IA et ses limites</a></li>
            <li><a href="#" data-viewer="ai/aivie">La place de l'IA dans ma vie</a></li>
          </ul>
        </details>

        <details>
          <summary>🧠 Psychologie</summary>
          <ul>
            <li><a href="#" data-viewer="psy/cameleon">Le syndrome du caméléon</a></li>
            <li><a href="#" data-viewer="psy/article2">Surfonctionner sans s'effondrer</a></li>
          </ul>
        </details>

        <details>
          <summary>🔮 Symbolique & ésotérisme</summary>
          <ul>
            <li><a href="#" data-viewer="symbol/symbolisme">Sorcières et Lumières</a></li>
            <li><a href="#" data-viewer="symbol/synchronicite-numerique">Synchronicités numériques</a></li>
          </ul>
        </details>
      </nav>
    </div>
  `;
}

// Fonction pour gérer le comportement burger (universelle)
function initBurgerMenu() {
  const burger = document.getElementById("viewer-menu-burger");
  const menu = document.getElementById("viewer-menu");
  const closeBtn = document.getElementById("viewer-menu-close");

  if (!burger) {
    console.warn("[MenuLoader] Bouton burger introuvable");
    return;
  }

  if (!menu) {
    console.warn("[MenuLoader] Menu #viewer-menu introuvable");
    return;
  }

  // Événement clic sur le burger
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
    burger.classList.toggle("open");
    console.log("[MenuLoader] Toggle menu:", menu.classList.contains("open"));
  });

  // Événement clic sur le bouton fermer (si existe)
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.remove("open");
      burger.classList.remove("open");
      console.log("[MenuLoader] Menu fermé");
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

  console.log("[MenuLoader] Interactions burger initialisées");
}
