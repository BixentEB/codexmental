// blog.js – Gère le menu du blog et l'affichage des articles avec liens partageables

document.addEventListener('DOMContentLoaded', () => {
  injectBlogMenu();

  // Vérifie si l’URL contient ?article=...
  const params = new URLSearchParams(window.location.search);
  const articleParam = params.get('article');
  if (articleParam) {
    loadArticle(`/blog/articles/${articleParam}.html`);
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
      const articleUrl = link.getAttribute('data-article'); // Ex: /blog/articles/ai/hypocrisie.html
      if (articleUrl) {
        loadArticle(articleUrl);
        setActiveLink(link);

        // Récupère chemin relatif pour ?article=...
        const relativePath = articleUrl
          .replace('/blog/articles/', '')
          .replace('.html', '');
        updateURL(relativePath);
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
function updateURL(relativePath) {
  const newUrl = `${window.location.pathname}?article=${relativePath}`;
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
 * Copie le lien de l’article affiché dans le presse-papier
 */
function copierLienArticle() {
  let articlePath = null;

  // Cherche un <article id="..."> visible dans #article-viewer
  const articleEl = document.querySelector('#article-viewer article[id]');
  if (articleEl) {
    articlePath = articleEl.id;
  }

  // Sinon, récupère l'ID depuis l'URL
  if (!articlePath) {
    const params = new URLSearchParams(window.location.search);
    articlePath = params.get('article');
  }

  if (articlePath) {
    const fullUrl = `${window.location.origin}${window.location.pathname}?article=${articlePath}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      console.log(`🔗 Lien copié : ${fullUrl}`);

      // Ajoute effet halo visuel sur tous les boutons
      document.querySelectorAll('.btn-share-article').forEach(button => {
        button.classList.add('clicked');
        setTimeout(() => button.classList.remove('clicked'), 800);
      });
    });
  } else {
    alert("Aucun article sélectionné.");
  }
}

// Ouvre / ferme le menu popup de partage
function toggleShareMenu() {
  const menu = document.getElementById('share-menu');
  menu.classList.toggle('hidden');
}

// Partage vers une plateforme (Facebook, Twitter, Email)
function shareTo(platform) {
  const params = new URLSearchParams(window.location.search);
  const articlePath = params.get('article');
  if (!articlePath) return;

  const url = `${window.location.origin}${window.location.pathname}?article=${articlePath}`;
  let shareUrl = '';

  switch (platform) {
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
      break;
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?text=Un article à lire !&url=${encodeURIComponent(url)}`;
      break;
    case 'email':
      shareUrl = `mailto:?subject=Article Codex Mental&body=Lis ça : ${encodeURIComponent(url)}`;
      break;
  }

  if (shareUrl) {
    // Ajoute l'effet halo aussi au bouton de partage contextuel
    const button = document.querySelector('.btn-share-article');
    if (button) {
      button.classList.add('clicked');
      setTimeout(() => button.classList.remove('clicked'), 800);
    }

    window.open(shareUrl, '_blank');
  }
}

