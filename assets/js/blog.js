// blog.js – Gestion du menu et chargement dynamique d’articles

document.addEventListener('DOMContentLoaded', () => {
  injectBlogMenu();

  // Si l’URL contient ?article=..., charge l’article automatiquement
  const params = new URLSearchParams(window.location.search);
  const articleParam = params.get('article');
  if (articleParam) {
    loadArticle(`articles/${articleParam}.html`);
  }
});

/**
 * Injecte le menu du blog depuis blog-menu.html
 */
function injectBlogMenu() {
  fetch('blog-menu.html')
    .then(response => response.text())
    .then(html => {
      document.getElementById('blog-menu').innerHTML = html;
      setupBlogMenuEvents();
    })
    .catch(error => {
      console.error('Erreur chargement blog-menu:', error);
    });
}

/**
 * Attache les handlers de clic aux liens menu
 */
function setupBlogMenuEvents() {
  const links = document.querySelectorAll('#blog-menu a[data-article]');
  links.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const articlePath = link.getAttribute('data-article');
      if (articlePath) {
        loadArticle(`articles/${articlePath}.html`);
        setActiveLink(link);
        updateURL(articlePath);
      }
    });
  });
}

/**
 * Charge un article dans #article-viewer
 */
function loadArticle(url) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Erreur chargement article');
      return res.text();
    })
    .then(html => {
      const viewer = document.getElementById('article-viewer');
      viewer.style.display = 'none';
      viewer.innerHTML = html;
      void viewer.offsetHeight;
      viewer.style.display = 'block';
    })
    .catch(err => {
      document.getElementById('article-viewer').innerHTML =
        `<p class="error">Impossible de charger l’article.</p>`;
      console.error(err);
    });
}

/**
 * Met à jour l’URL avec ?article=
 */
function updateURL(relativePath) {
  const newUrl = `${window.location.pathname}?article=${relativePath}`;
  window.history.pushState({}, '', newUrl);
}

/**
 * Surligne le lien actif dans le menu
 */
function setActiveLink(activeLink) {
  document.querySelectorAll('#blog-menu a[data-article]').forEach(link => {
    link.classList.remove('active');
  });
  activeLink.classList.add('active');
}
