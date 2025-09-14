// viewer.js – moteur unifié Blog + Atelier + découpe en blocs + galerie mosaïque

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isBlog = path.includes('/blog');
  const paramKey = isBlog ? 'article' : 'projet';
  const basePath = isBlog ? '/blog/articles/' : '/atelier/';

  const menuEl   = document.getElementById('viewer-menu');
  const viewerEl = document.getElementById('article-viewer');
  if (!menuEl || !viewerEl) return;

  // 1) Shell du viewer (cartes)
  ensureViewerShell(viewerEl);

  // 2) Liens du menu
  setupMenuLinks(menuEl, viewerEl, basePath, paramKey);

  // 3) Article initial
  const initial = new URLSearchParams(window.location.search).get(paramKey);
  if (initial) loadContent(viewerEl, basePath + initial + '.html', { paramKey, file: initial });
});

// ──────────────────────────────────────────────────────────────────────────────
// Shell : sous-conteneurs (cartes séparées)
function ensureViewerShell(viewerEl) {
  const ids = [
    'article-title',
    'article-tools',
    'article-media',       // ⬅️ NOUVEAU bloc images/galerie
    'article-body',
    'article-extras',
    'article-references',
    'article-capsules'
  ];
  ids.forEach(id => {
    if (!document.getElementById(id)) {
      const wrapper = document.createElement('section');
      wrapper.id = id;
      wrapper.className = 'viewer-block card';
      if (id === 'article-tools') wrapper.classList.add('block-tools');
      viewerEl.appendChild(wrapper);
    }
  });
}

// ──────────────────────────────────────────────────────────────────────────────
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

// ──────────────────────────────────────────────────────────────────────────────
// Charge l’article, découpe, injecte par cartes
function loadContent(viewerEl, url, ctx = {}) {
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Introuvable');
      return r.text();
    })
    .then(html => {
      viewerEl.style.opacity = '0';

      const doc = new DOMParser().parseFromString(html, 'text/html');
      const part = name => doc.querySelector(`[data-part="${name}"]`);

      // TITRE
      const titleNode =
        part('title') ||
        doc.querySelector('section[data-part="title"] h1') ||
        doc.querySelector('h1');

      // TOOLS
      const toolsNode =
        part('tools') ||
        doc.getElementById('article-tools') ||
        doc.querySelector('.tools');

      // MEDIA (galerie) — explicite uniquement pour éviter les doublons
      const mediaNode =
        part('media') ||
        doc.querySelector('.media, .gallery, section[data-gallery]');

      // BODY
      const bodyNode =
        part('body') ||
        doc.querySelector('article[data-part="body"]') ||
        doc.querySelector('.article') ||
        doc.querySelector('article') ||
        doc.querySelector('main > section') ||
        doc.querySelector('section');

      // EXTRAS / REFERENCES / CAPSULES
      const extrasNode     = part('extras')     || doc.querySelector('.extras');
      const referencesNode = part('references') || doc.querySelector('.references, footer.references');
      const capsulesNode   = part('capsules')   || doc.querySelector('.capsules');

      // Injecte
      setBlockHTML('article-title', titleNode ? titleNode.outerHTML : '');
      setBlockHTML('article-body',  bodyNode  ? bodyNode.outerHTML  : '');
      setBlockHTML('article-extras', extrasNode ? extrasNode.outerHTML : '');
      setBlockHTML('article-references', referencesNode ? referencesNode.outerHTML : '');
      setBlockHTML('article-capsules',   capsulesNode   ? capsulesNode.outerHTML   : '');

      // Tools : article ou partial
      if (toolsNode) {
        setBlockHTML('article-tools', toolsNode.outerHTML);
        setupShareButtons();
      } else {
        injectArticleTools();
      }

      // Media/Galerie → mosaïque
      if (mediaNode) {
        const imgs = [...mediaNode.querySelectorAll('img')].filter(i => i.getAttribute('src'));
        const caption = mediaNode.querySelector('figcaption')?.innerHTML || '';
        const galleryHTML = renderMosaicHTML(imgs, caption);
        setBlockHTML('article-media', galleryHTML);
      } else {
        setBlockHTML('article-media', '');
      }

      // Fade-in
      requestAnimationFrame(() => (viewerEl.style.opacity = '1'));

      // Mobile : ferme un éventuel menu partage
      const shareMenu = document.getElementById('share-menu');
      if (shareMenu && window.innerWidth <= 768) shareMenu.classList.add('hidden');
    })
    .catch(err => {
      setBlockHTML('article-title', '');
      setBlockHTML('article-tools', '');
      setBlockHTML('article-media', '');
      setBlockHTML('article-body', `<p class="erreur">Erreur chargement : ${url}</p>`);
      setBlockHTML('article-extras', '');
      setBlockHTML('article-references', '');
      setBlockHTML('article-capsules', '');
      console.error(err);
    });
}

// Utilitaire injection + hide si vide
function setBlockHTML(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html || '';
  el.classList.toggle('is-empty', !html || !html.trim());
}

// ──────────────────────────────────────────────────────────────────────────────
// PARTAGE (identique)
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

// ──────────────────────────────────────────────────────────────────────────────
// URL + actif
function updateURL(key, val) {
  const u = new URL(window.location);
  u.searchParams.set(key, val);
  window.history.pushState({}, '', u);
}
function highlightActive(menuEl, link) {
  menuEl.querySelectorAll('a[data-viewer]').forEach(a => a.classList.remove('active'));
  link.classList.add('active');
}

// ──────────────────────────────────────────────────────────────────────────────
// GALERIE MOSAÏQUE
function renderMosaicHTML(imgNodes, caption = '') {
  if (!imgNodes || !imgNodes.length) return '';

  // Si une image a data-main, on la passe en premier
  const idxMain = imgNodes.findIndex(n => n.hasAttribute('data-main'));
  if (idxMain > 0) {
    const main = imgNodes.splice(idxMain, 1)[0];
    imgNodes.unshift(main);
  }

  const tiles = imgNodes.map((img, i) => {
    const src = img.getAttribute('src');
    const alt = (img.getAttribute('alt') || '').replace(/"/g, '&quot;');
    const cls = i === 0 ? 'tile tile--main' : 'tile';
    return `<figure class="${cls}"><img src="${src}" alt="${alt}" loading="lazy" decoding="async"></figure>`;
  }).join('');

  const cap = caption
    ? `<figcaption class="gallery-caption">${caption}</figcaption>`
    : '';

  return `
    <div class="media-gallery" data-count="${imgNodes.length}">
      <div class="mosaic">${tiles}</div>
      ${cap}
    </div>
  `;
}
