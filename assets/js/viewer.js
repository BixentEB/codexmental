
// viewer.js – Moteur unifié pour blog & atelier (Codex Mental)

document.addEventListener('DOMContentLoaded', () => {
  const menuEl = document.querySelector('#blog-menu') || document.querySelector('#atelier-menu');
  const viewerEl = document.getElementById('article-viewer');
  const isBlog = !!document.querySelector('#blog-menu');
  const isAtelier = !!document.querySelector('#atelier-menu');

  if (!menuEl || !viewerEl) return;

  const context = isBlog ? 'blog' : 'atelier';
  const menuUrl = isBlog ? '/blog-menu.html' : '/atelier/atelier-menu.html';
  const basePath = isBlog ? '/articles/' : '/atelier/';
  const paramKey = isBlog ? 'article' : 'projet';

  injectMenu(menuEl.id, menuUrl, () => {
    setupMenuLinks(viewerEl, basePath, paramKey);
    const initial = new URLSearchParams(window.location.search).get(paramKey);
    if (initial) loadContent(viewerEl, basePath + initial + '.html', true);
  });
});

// Injecte le menu latéral
function injectMenu(targetId, url, callback) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById(targetId).innerHTML = html;
      if (typeof callback === 'function') callback();
    })
    .catch(err => console.error('Erreur menu :', err));
}

// Gère les clics menu
function setupMenuLinks(viewer, basePath, paramKey) {
  document.querySelectorAll(`#${viewer.id} a[data-viewer], aside a[data-viewer]`).forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const file = link.getAttribute('data-viewer');
      if (file) {
        loadContent(viewer, basePath + file + '.html');
        updateURL(paramKey, file);
        highlightActive(link);
      }
    });
  });
}

// Charge le contenu HTML
function loadContent(viewer, url, skipPush = false) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Contenu introuvable');
      return res.text();
    })
    .then(html => {
      viewer.style.display = 'none';
      viewer.innerHTML = html;
      if (document.getElementById('article-tools')) injectArticleTools();
      void viewer.offsetHeight;
      viewer.style.display = 'block';
    })
    .catch(err => {
      viewer.innerHTML = `<p class='erreur'>Erreur de chargement : ${url}</p>`;
      console.error(err);
    });
}

// Injection outils de partage (si présent)
function injectArticleTools() {
  fetch('/partials/article-tools.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('article-tools').innerHTML = html;
    })
    .catch(err => console.error('Erreur outils article :', err));
}

// Met à jour l’URL
function updateURL(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url);
}

// Marque le lien actif
function highlightActive(activeLink) {
  document.querySelectorAll('aside a[data-viewer]').forEach(link => {
    link.classList.remove('active');
  });
  activeLink.classList.add('active');
}
