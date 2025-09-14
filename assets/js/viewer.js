// viewer.js – moteur unifié Blog + Atelier + découpe en blocs

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isBlog = path.includes('/blog');
  const paramKey = isBlog ? 'article' : 'projet';
  const basePath = isBlog ? '/blog/articles/' : '/atelier/';

  const menuEl   = document.getElementById('viewer-menu');
  const viewerEl = document.getElementById('article-viewer');
  if (!menuEl || !viewerEl) return;

  // 1) S'assure que le "viewer principal" (shell) existe
  ensureViewerShell(viewerEl);

  // 2) Branche les liens du menu
  setupMenuLinks(menuEl, viewerEl, basePath, paramKey);

  // 3) Charge l'article initial si ?article=... / ?projet=...
  const initial = new URLSearchParams(window.location.search).get(paramKey);
  if (initial) loadContent(viewerEl, basePath + initial + '.html', { paramKey, file: initial });
});

// -----------------------------------------------------------------------------
// Shell : crée les sous-conteneurs si absents (viewer "invisible" = orchestration)
function ensureViewerShell(viewerEl) {
  const ids = [
    'article-title',
    'article-tools',
    'article-body',
    'article-extras',
    'article-references',
    'article-capsules'
  ];
  ids.forEach(id => {
    if (!document.getElementById(id)) {
      const wrapper = document.createElement('section');
      wrapper.id = id;
      wrapper.className = 'viewer-block card'; // cartes séparées (fond + marge)
      // Par défaut, tools en tête
      if (id === 'article-tools') wrapper.classList.add('block-tools');
      viewerEl.appendChild(wrapper);
    }
  });
}

// -----------------------------------------------------------------------------
// Menu -> charge contenu
function setupMenuLinks(menuEl, viewerEl, basePath, paramKey) {
  menuEl.querySelectorAll('a[data-viewer]').forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const file = link.getAttribute('data-viewer');
      if (!file) return;
      loadContent(viewerEl, basePath + file + '.html', { paramKey, file });
      updateURL(paramKey, file);
      highlightActive(menuEl, link);
    });
  });
}

// -----------------------------------------------------------------------------
// Charge l'article/projet, découpe en parties et injecte
function loadContent(viewerEl, url, ctx = {}) {
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Introuvable');
      return r.text();
    })
    .then(html => {
      // fade-out doux
      viewerEl.style.opacity = '0';

      // Parse HTML de l'article
      const doc = new DOMParser().parseFromString(html, 'text/html');

      // 1) Récupère les parties (priorité aux data-part)
      const part = name => doc.querySelector(`[data-part="${name}"]`);

      // TITRE
      let titleNode =
        part('title') ||
        doc.querySelector('section[data-part="title"] h1') ||
        doc.querySelector('h1');

      // TOOLS (si absent, on injectera le partial)
      let toolsNode =
        part('tools') ||
        doc.getElementById('article-tools') ||
        doc.querySelector('.tools');

      // BODY (article / .article / 1er section structurant)
      let bodyNode =
        part('body') ||
        doc.querySelector('article[data-part="body"]') ||
        doc.querySelector('.article') ||
        doc.querySelector('article') ||
        doc.querySelector('main > section') ||
        doc.querySelector('section');

      // EXTRAS / REFERENCES / CAPSULES (optionnels)
      const extrasNode     = part('extras')     || doc.querySelector('.extras');
      const referencesNode = part('references') || doc.querySelector('.references, footer.references');
      const capsulesNode   = part('capsules')   || doc.querySelector('.capsules');

      // 2) Nettoie et injecte dans les blocs
      setBlockHTML('article-title', titleNode ? titleNode.outerHTML : '');
      setBlockHTML('article-body',  bodyNode  ? bodyNode.outerHTML  : '');
      setBlockHTML('article-extras', extrasNode ? extrasNode.outerHTML : '');
      setBlockHTML('article-references', referencesNode ? referencesNode.outerHTML : '');
      setBlockHTML('article-capsules',   capsulesNode   ? capsulesNode.outerHTML   : '');

      // 3) Tools : soit l’article fournit, soit on injecte le partial
      if (toolsNode) {
        setBlockHTML('article-tools', toolsNode.outerHTML);
        setupShareButtons(); // branche si l’article avait ses propres boutons
      } else {
        injectArticleTools(); // fallback sur /partials/article-tools.html
      }

      // 4) Petite animation de réapparition
      requestAnimationFrame(() => (viewerEl.style.opacity = '1'));

      // 5) Smartphone : ferme menu partage si ouvert
      const shareMenu = document.getElementById('share-menu');
      if (shareMenu && window.innerWidth <= 768) shareMenu.classList.add('hidden');

      // 6) Option: si le body contient des chapitres <section data-chapter="...">,
      //    on peut, plus tard, ajouter un sommaire auto ou un accordéon ici.
    })
    .catch(err => {
      // En cas d’erreur : on laisse un message dans le conteneur body
      setBlockHTML('article-title', '');
      setBlockHTML('article-tools', '');
      setBlockHTML('article-body', `<p class="erreur">Erreur chargement : ${url}</p>`);
      setBlockHTML('article-extras', '');
      setBlockHTML('article-references', '');
      setBlockHTML('article-capsules', '');
      console.error(err);
    });
}

// Utilitaire : injecte proprement du HTML dans un bloc
function setBlockHTML(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html || '';
  // Cache le bloc si vide, montre s’il a du contenu
  el.classList.toggle('is-empty', !html || !html.trim());
}

// -----------------------------------------------------------------------------
// Injection du partial de partage (fallback si article n’en fournit pas)
function injectArticleTools() {
  const tools = document.getElementById('article-tools');
  if (!tools) return;

  fetch('/partials/article-tools.html')
    .then(r => r.text())
    .then(html => {
      tools.innerHTML = html;
      const shareMenu = document.getElementById('share-menu');
      if (shareMenu && !shareMenu.classList.contains('hidden')) {
        shareMenu.classList.add('hidden');
      }
      setupShareButtons();
    })
    .catch(err => console.error('Erreur outils:', err));
}

// -----------------------------------------------------------------------------
// Partage (identique à avant, conservé)
function setupShareButtons() {
  const shareBtn = document.getElementById('share-button');
  const shareMenu = document.getElementById('share-menu');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', e => {
    e.stopPropagation();

    if (window.innerWidth <= 768 && navigator.share) {
      navigator.share({
        title: document.title,
        text: 'Découvrez cet article !',
        url: window.location.href
      }).catch(() => toggleShareMenu());
      return;
    }

    toggleShareMenu();
  });

  if (shareMenu) {
    shareMenu.querySelectorAll('a[data-share]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        handleShare(a.getAttribute('data-share'));
        toggleShareMenu(true);
      });
    });
  }
}

function toggleShareMenu(forceHide = false) {
  const menu = document.getElementById('share-menu');
  if (!menu) return;

  if (forceHide || !menu.classList.contains('hidden')) {
    menu.classList.add('hidden');
    document.removeEventListener('click', outsideHandler);
  } else {
    menu.classList.remove('hidden');
    document.addEventListener('click', outsideHandler);
    setTimeout(() => toggleShareMenu(true), 5000);
  }
}
function outsideHandler(e) {
  const menu = document.getElementById('share-menu');
  if (menu && !menu.contains(e.target)) toggleShareMenu(true);
}
function handleShare(platform) {
  const url = window.location.href;
  let target = '';
  if (platform === 'facebook')      target = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  else if (platform === 'twitter')  target = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
  else if (platform === 'email')    target = `mailto:?subject=Article&body=${encodeURIComponent(url)}`;
  else if (platform === 'copy')     { copyText(url); return; }
  if (target) window.open(target, '_blank');
}
function copyText(text) {
  if (navigator.clipboard?.writeText) navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  else fallbackCopy(text);
}
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta);
}

// -----------------------------------------------------------------------------
// URL + actif (inchangé)
function updateURL(key, val) {
  const u = new URL(window.location);
  u.searchParams.set(key, val);
  window.history.pushState({}, '', u);
}
function highlightActive(menuEl, link) {
  menuEl.querySelectorAll('a[data-viewer]').forEach(a => a.classList.remove('active'));
  link.classList.add('active');
}
