// blog.js – Gère le menu du blog et l'affichage des articles

document.addEventListener('DOMContentLoaded', () => {
  injectBlogMenu();
});

/**
 * Injecte le menu spécifique au blog depuis /blog/menu-blog.html
 */
function injectBlogMenu() {
  fetch('/blog/menu-blog.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('menu-blog').innerHTML = html;
      setupBlogMenuEvents(); // Active les clics une fois le menu chargé
    })
    .catch(error => {
      console.error('Erreur lors du chargement du menu-blog:', error);
    });
}

/**
 * Gère les clics sur le menu pour charger les articles
 */
function setupBlogMenuEvents() {
  const links = document.querySelectorAll('#menu-blog a[data-article]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const articleUrl = link.getAttribute('data-article');
      if (articleUrl) {
        loadArticle(articleUrl);
        setActiveLink(link);
      }
    });
  });
}

/**
 * Charge dynamiquement un article dans #article-viewer
 */
function loadArticle(url) {
  fetch(url)
    .then(response => {
      if (!response.ok) throw new Error('Erreur chargement article');
      return response.text();
    })
    .then(html => {
      document.getElementById('article-viewer').innerHTML = html;
    })
    .catch(error => {
      document.getElementById('article-viewer').innerHTML =
        `<p class="error">Impossible de charger l’article.</p>`;
      console.error(error);
    });
}

/**
 * Met en surbrillance le lien actif dans le menu
 */
function setActiveLink(activeLink) {
  document.querySelectorAll('#menu-blog a[data-article]').forEach(link => {
    link.classList.remove('active');
  });
  activeLink.classList.add('active');
}
