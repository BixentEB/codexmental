// blog.js – Gère le menu du blog et l'affichage des articles avec liens partageables

document.addEventListener('DOMContentLoaded', () => {
  injectBlogMenu();

  // Vérifie si l’URL contient ?article=...
  const params = new URLSearchParams(window.location.search);
  const articleParam = params.get('article');
  if (articleParam) {
    loadArticle(articleParam);
  }
});

/**
 * Injecte le menu spécifique au blog depuis /blog/blog-menu.html
 */
function injectBlogMenu() {
  fetch('/blog/blog-menu.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('blog-menu').innerHTML = html;
      setupBlogMenuEvents();
    })
    .catch(error => {
      console.error('Erreur lors du chargement du blog-menu:', error);
    });
}

/**
 * Gère les clics sur le menu pour charger les articles
 */
function setupBlogMenuEvents() {
  const links = document.querySelectorAll('#blog-menu a[data-article]');

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const articleUrl = link.getAttribute('data-article');
      if (articleUrl) {
        loadArticle(articleUrl);
        setActiveLink(link);
        updateURL(articleUrl);
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
 * Met à jour l’URL avec le paramètre ?article=...
 */
function updateURL(articleUrl) {
  const shortName = articleUrl.replace(/^.*[\\/]/, '').replace('.html', '');
  const newUrl = `${window.location.pathname}?article=${shortName}`;
  window.history.pushState({}, '', newUrl);
}

/**
 * Met en surbrillance le lien actif dans le menu
 */
function setActiveLink(activeLink) {
  document.querySelectorAll('#blog-menu a[data-article]').forEach(link => {
    link.classList.remove('active');
  });
  activeLink.classList.add('active');
}

/**
 * Fonction optionnelle pour copier le lien de l’article affiché
 */
function copierLienArticle() {
  const params = new URLSearchParams(window.location.search);
  const article = params.get('article');
  if (article) {
    const fullUrl = `${window.location.origin}${window.location.pathname}?article=${article}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert("Lien de l’article copié !");
    });
  } else {
    alert("Aucun article sélectionné.");
  }
}
