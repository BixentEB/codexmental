// viewer.js – moteur unifié Blog + Atelier

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isBlog = path.includes('/blog');
  const isAtelier = path.includes('/atelier');
  
  const menuEl = document.getElementById('viewer-menu');
  const viewerEl = document.getElementById('article-viewer');
  if (!menuEl || !viewerEl) return;

  const menuUrl = isBlog
    ? '/blog/blog-menu.html'
    : '/atelier/atelier-menu.html';
  const basePath = isBlog
    ? '/blog/articles/'
    : '/atelier/';
  const paramKey = isBlog ? 'article' : 'projet';

  injectMenu(menuUrl, () => {
    setupMenuLinks(viewerEl, basePath, paramKey);
    const initial = new URLSearchParams(window.location.search).get(paramKey);
    if (initial) {
      loadContent(viewerEl, basePath + initial + '.html', true);
    }
  });
});

// --- Fonctions utilitaires

function injectMenu(url, callback) {
  fetch(url)
    .then(res => res.text())
    .then(html => {
      document.getElementById('viewer-menu').innerHTML = html;
      if (callback) callback();
    })
    .catch(err => console.error('Erreur menu:', err));
}

function setupMenuLinks(viewer, basePath, paramKey) {
  document.querySelectorAll('#viewer-menu a[data-viewer]').forEach(link => {
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

function loadContent(viewer, url, skipPush = false) {
  fetch(url)
    .then(res => {
      if (!res.ok) throw new Error('Contenu introuvable');
      return res.text();
    })
    .then(html => {
      viewer.style.opacity = '0';
      viewer.innerHTML = html;

      const tools = document.getElementById('article-tools');
      if (tools) injectArticleTools();

      requestAnimationFrame(() => {
        viewer.style.opacity = '1';
      });
    })
    .catch(err => {
      viewer.innerHTML = `<p class="erreur">Erreur de chargement : ${url}</p>`;
      console.error(err);
    });
}

function injectArticleTools() {
  fetch('/partials/article-tools.html')
    .then(res => res.text())
    .then(html => {
      document.getElementById('article-tools').innerHTML = html;
    })
    .catch(err => console.error('Erreur outils article:', err));
}

function updateURL(key, value) {
  const url = new URL(window.location);
  url.searchParams.set(key, value);
  window.history.pushState({}, '', url);
}

function highlightActive(activeLink) {
  document.querySelectorAll('#viewer-menu a[data-viewer]').forEach(link => {
    link.classList.toggle('active', link === activeLink);
  });
}
