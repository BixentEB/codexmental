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
    console.error("[MenuLoader] ❌ Aucun conteneur trouvé");
    return;
  }

  console.log("[MenuLoader] ✅ Conteneur trouvé:", container.id);

  // Détection automatique du type de page
  const pageType = detectPageType();
  console.log(`[MenuLoader] Type de page détecté: ${pageType}`);

  // Chargement du menu approprié
  const menuHTML = await loadMenuFile(pageType);
  
  if (menuHTML) {
    // ✅ RÉUSSITE : Injection du bouton burger + menu
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
    
    console.log(`[MenuLoader] ✅ Menu ${pageType} injecté avec succès`);
  } else {
    // ❌ ÉCHEC : Affichage d'un menu d'erreur pour diagnostiquer
    console.error(`[MenuLoader] ❌ Impossible de charger le menu ${pageType}`);
    
    container.innerHTML = `
      <div id="viewer-menu-container">
        <nav id="viewer-menu" class="blog-menu fallback-menu">
          <div class="viewer-menu-header">
            <h2>❌ Erreur de chargement</h2>
          </div>
          <div class="menu-error" style="padding: 1rem; background: #ffebee; border: 1px solid #f44336; border-radius: 4px;">
            <p><strong>Le menu n'a pas pu être chargé.</strong></p>
            <p>Page détectée : <code>${pageType}</code></p>
            <p>Vérifiez la console pour plus de détails.</p>
            <p><strong>Fichier attendu :</strong> <code>${pageType}-menu.html</code></p>
          </div>
        </nav>
      </div>
    `;
  }
}

// Fonction pour détecter le type de page
function detectPageType() {
  const currentPath = window.location.pathname;
  const currentFile = window.location.href;
  
  console.log("[MenuLoader] Détection - Path:", currentPath);
  console.log("[MenuLoader] Détection - File:", currentFile);
  
  // Détection basée sur l'URL ou le nom du fichier
  if (currentPath.includes('/blog') || currentFile.includes('blog.html')) {
    return 'blog';
  } else if (currentPath.includes('/atelier') || currentFile.includes('atelier.html')) {
    return 'atelier';
  }
  
  // Détection basée sur le titre de la page
  const pageTitle = document.title.toLowerCase();
  console.log("[MenuLoader] Détection - Title:", pageTitle);
  
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
      'blog-menu.html',              // Dans le même dossier
      './blog-menu.html',            // Explicitement dans le dossier courant
      '/blog-menu.html',             // À la racine du site
      'templates/blog-menu.html',    // Dans un sous-dossier templates
      '../blog-menu.html'            // Dans le dossier parent
    ],
    atelier: [
      'atelier-menu.html',           
      './atelier-menu.html',         
      '/atelier-menu.html',          
      'templates/atelier-menu.html', 
      '../atelier-menu.html'         
    ]
  };

  const pathsToTest = menuPaths[pageType] || menuPaths.blog;
  
  console.log(`[MenuLoader] Test de ${pathsToTest.length} chemins pour ${pageType}:`);
  
  // Test de chaque chemin
  for (const path of pathsToTest) {
    console.log(`[MenuLoader] Test: ${path}`);
    
    try {
      const response = await fetch(path);
      console.log(`[MenuLoader] Réponse ${path}:`, response.status);
      
      if (response.ok) {
        const content = await response.text();
        console.log(`[MenuLoader] ✅ Menu trouvé: ${path} (${content.length} caractères)`);
        return content;
      }
    } catch (error) {
      console.log(`[MenuLoader] ❌ Erreur ${path}:`, error.message);
    }
  }

  // Si rien ne marche
  console.error(`[MenuLoader] ❌ Aucun menu trouvé pour ${pageType} dans aucun des chemins testés`);
  return null;
}

// Fonction pour gérer le comportement burger
function initBurgerMenu() {
  const burger = document.getElementById("viewer-menu-burger");
  const menu = document.getElementById("viewer-menu");
  const closeBtn = document.getElementById("viewer-menu-close");

  console.log("[MenuLoader] Init burger - Burger:", !!burger, "Menu:", !!menu);

  // Si pas de burger = mode normal
  if (!burger) {
    console.log("[MenuLoader] Mode menu normal (sans burger)");
    return;
  }

  // Si pas de menu = échec
  if (!menu) {
    console.error("[MenuLoader] ❌ Menu introuvable après injection");
    return;
  }

  console.log("[MenuLoader] ✅ Mode burger initialisé");
  
  // Événement clic sur le burger
  burger.addEventListener("click", (e) => {
    e.stopPropagation();
    menu.classList.toggle("open");
    burger.classList.toggle("open");
    console.log("[MenuLoader] Burger cliqué - Menu ouvert:", menu.classList.contains("open"));
  });

  // Événement clic sur le bouton fermer (si existe)
  if (closeBtn) {
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      menu.classList.remove("open");
      burger.classList.remove("open");
      console.log("[MenuLoader] Menu fermé via bouton X");
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
      console.log("[MenuLoader] Menu fermé (clic extérieur)");
    }
  });
}
