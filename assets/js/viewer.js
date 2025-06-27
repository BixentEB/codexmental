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

  // Réimplémentation de toggleShareMenu et shareTo ici
  window.toggleShareMenu = function() {
    const menu = document.getElementById('share-menu');
    if (!menu) return;
    menu.classList.toggle('hidden');
    if (!menu.classList.contains('hidden')) {
      setTimeout(() => menu.classList.add('hidden'), 5000);
      document.addEventListener('click', closeShareMenu);
    }
  };

  function closeShareMenu(e) {
    const menu = document.getElementById('share-menu');
    if (!menu) return;
    if (!menu.contains(e.target) && !e.target.closest('.btn-share-wrapper')) {
      menu.classList.add('hidden');
      document.removeEventListener('click', closeShareMenu);
    }
  }

  window.shareTo = function(platform) {
    const articleParam = new URLSearchParams(window.location.search).get(paramKey);
    const url = `${window.location.origin}${window.location.pathname}?${paramKey}=${articleParam}`;
    let shareUrl = '';
    if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    } else if (platform === 'twitter') {
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
    } else if (platform === 'email') {
      shareUrl = `mailto:?subject=Article Codex&body=${encodeURIComponent(url)}`;
    }
    if (shareUrl) window.open(shareUrl, '_blank');
  };
});

// Code indépendant pour le loader & affichage
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
    .then(res => res.ok ? res.text() : Promise.reject())
    .then(html => {
      viewer.style.opacity = '0';
      viewer.innerHTML = html;
      injectArticleTools();
      requestAnimationFrame(() => viewer.style.opacity = '1');
    })
    .catch(err => {
      viewer.innerHTML = `<p class="erreur">Erreur de chargement : ${url}</p>`;
      console.error(err);
    });
}

function injectArticleTools() {
  const toolsContainer = document.getElementById('article-tools');
  if (!toolsContainer) return;
  fetch('/partials/article-tools.html')
    .then(res => res.text())
    .then(html => {
      toolsContainer.innerHTML = html;
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
