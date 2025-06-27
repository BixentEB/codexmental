// viewer.js – moteur unifié Blog + Atelier + partage

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isBlog = path.includes('/blog');
  const paramKey = isBlog ? 'article' : 'projet';
  const menuUrl = isBlog ? '/blog/blog-menu.html' : '/atelier/atelier-menu.html';
  const basePath = isBlog ? '/blog/articles/' : '/atelier/';

  const menuEl = document.getElementById('viewer-menu');
  const viewerEl = document.getElementById('article-viewer');
  if (!menuEl || !viewerEl) return;

  // 1️⃣ Injecte menu + setup liens et chargement initial
  injectMenu(menuUrl, () => {
    setupMenuLinks(menuEl, viewerEl, basePath, paramKey);
    const initial = new URLSearchParams(window.location.search).get(paramKey);
    if (initial) loadContent(viewerEl, basePath + initial + '.html', true);
  });
});

// injecte menu externe
function injectMenu(url, callback) {
  fetch(url)
    .then(r => r.text())
    .then(html => {
      document.getElementById('viewer-menu').innerHTML = html;
      callback?.();
    })
    .catch(e => console.error('Erreur menu:', e));
}

// attache les liens du menu
function setupMenuLinks(menuEl, viewerEl, basePath, paramKey) {
  menuEl.querySelectorAll('a[data-viewer]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const file = link.getAttribute('data-viewer');
      if (!file) return;
      loadContent(viewerEl, basePath + file + '.html');
      updateURL(paramKey, file);
      highlightActive(menuEl, link);
    });
  });
}

// charge le contenu + injecte les outils + raccroche partage
function loadContent(viewerEl, url, skipPush = false) {
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Introuvable');
      return r.text();
    })
    .then(html => {
      viewerEl.style.opacity = '0';
      viewerEl.innerHTML = html;
      injectArticleTools();
      requestAnimationFrame(() => viewerEl.style.opacity = '1');
    })
    .catch(e => {
      viewerEl.innerHTML = `<p class="erreur">Erreur chargement : ${url}</p>`;
      console.error(e);
    });
}

// injecte le petit menu de partage + rattache le clic principal
function injectArticleTools() {
  const toolsEl = document.getElementById('article-tools');
  if (!toolsEl) return;
  fetch('/partials/article-tools.html')
    .then(r => r.text())
    .then(html => {
      toolsEl.innerHTML = html;
      setupShareButtons();
    })
    .catch(e => console.error('Erreur outils/article-tools:', e));
}

// prépare les boutons de partage
function setupShareButtons() {
  const shareBtn = document.getElementById('share-button');
  const shareMenu = document.getElementById('share-menu');
  if (shareBtn && shareMenu) {
    shareBtn.addEventListener('click', async e => {
      e.stopPropagation();
      if (navigator.share) {
        try {
          await navigator.share({ title: document.title, text: 'Découvrez cet article', url: window.location.href });
        } catch {}
      } else {
        toggleShareMenu();
      }
    });

    shareMenu.querySelectorAll('a[data-share]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const platform = a.getAttribute('data-share');
        handleShareLink(platform);
        toggleShareMenu(false);
      });
    });
  }
}

// toggle menu personnalisé (PC)
function toggleShareMenu(forceHide) {
  const menu = document.getElementById('share-menu');
  if (!menu) return;
  if (forceHide || !menu.classList.toggle('hidden')) {
    document.addEventListener('click', onClickOutsideShareMenu);
    setTimeout(() => menu.classList.add('hidden'), 5000);
  } else {
    menu.classList.add('hidden');
  }
}

// fermer quand on clique hors du menu
function onClickOutsideShareMenu(e) {
  const menu = document.getElementById('share-menu');
  if (!menu) return;
  if (!menu.contains(e.target)) {
    menu.classList.add('hidden');
    document.removeEventListener('click', onClickOutsideShareMenu);
  }
}

// selon plateforme, ouvrir partage top ou copier
function handleShareLink(platform) {
  const url = window.location.href;
  let target = '';
  if (platform === 'facebook') {
    target = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
  } else if (platform === 'twitter') {
    target = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(url);
  } else if (platform === 'email') {
    target = 'mailto:?subject=Article&body=' + encodeURIComponent(url);
  } else if (platform === 'copy') {
    copyText(url);
    return;
  }
  window.open(target, '_blank');
}

// fonction solide de copie
function copyText(text) {
  if (navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

// fallback execCommand
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.focus({ preventScroll: true });
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

// URL + highlight style
function updateURL(key, value) {
  const u = new URL(window.location);
  u.searchParams.set(key, value);
  window.history.pushState({}, '', u);
}
function highlightActive(menuEl, link) {
  menuEl.querySelectorAll('a[data-viewer]').forEach(a => a.classList.remove('active'));
  link.classList.add('active');
}
