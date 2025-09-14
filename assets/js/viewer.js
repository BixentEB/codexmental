// viewer.js — Blog + Atelier
// • Découpe en blocs (title/tools/media/body/extras/references/capsules)
// • Galerie + Lightbox (si tu l'avais déjà collée)
// • FIXES : cartes masquées par défaut, suppression placeholder, anti-H1 doublon

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isBlog = path.includes('/blog');
  const paramKey = isBlog ? 'article' : 'projet';
  const basePath = isBlog ? '/blog/articles/' : '/atelier/';

  const menuEl   = document.getElementById('viewer-menu');
  const viewerEl = document.getElementById('article-viewer');
  if (!menuEl || !viewerEl) return;

  // Cartes du viewer (créées MASQUÉES par défaut)
  ensureViewerShell(viewerEl);

  // Lightbox (si tu utilises la galerie)
  if (!document.getElementById('viewer-lightbox')) buildLightbox?.();

  // Liens menu
  setupMenuLinks(menuEl, viewerEl, basePath, paramKey);

  // Article initial via URL
  const initial = new URLSearchParams(window.location.search).get(paramKey);
  if (initial) loadContent(viewerEl, basePath + initial + '.html', { paramKey, file: initial });
});

// ──────────────────────────────────────────────────────────────────────────────
// Shell du viewer : crée les sous-conteneurs et les marque is-empty (donc invisibles)
function ensureViewerShell(viewerEl) {
  const ids = [
    'article-title',
    'article-tools',
    'article-media',
    'article-body',
    'article-extras',
    'article-references',
    'article-capsules'
  ];
  ids.forEach(id => {
    if (!document.getElementById(id)) {
      const wrapper = document.createElement('section');
      wrapper.id = id;
      wrapper.className = 'viewer-block card is-empty'; // ⬅️ masqué tant que vide
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
// Charge l’article, découpe et injecte par cartes
function loadContent(viewerEl, url, ctx = {}) {
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Introuvable');
      return r.text();
    })
    .then(html => {
      viewerEl.style.opacity = '0';

      // ➤ On enlève le placeholder d’intro s’il existe (pour éviter la superposition)
      viewerEl.querySelectorAll('.placeholder').forEach(el => el.remove());

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

      // MEDIA (galerie)
      const mediaNode =
        part('media') ||
        doc.querySelector('.media, .gallery, section[data-gallery]');

      // BODY
      let bodyNode =
        part('body') ||
        doc.querySelector('article[data-part="body"]') ||
        doc.querySelector('.article') ||
        doc.querySelector('article') ||
        doc.querySelector('main > section') ||
        doc.querySelector('section');

      // ➤ Anti-doublon : si le H1 est aussi dans le body, on le retire du body
      if (bodyNode) {
        bodyNode = bodyNode.cloneNode(true); // clone pour ne pas modifier la source
        const h1InBody = bodyNode.querySelector('h1');
        if (h1InBody && titleNode) {
          const t = s => (s || '').trim().replace(/\s+/g, ' ');
          if (t(h1InBody.textContent) === t(titleNode.textContent)) {
            h1InBody.remove();
          }
        }
      }

      // EXTRAS / REFERENCES / CAPSULES
      const extrasNode     = part('extras')     || doc.querySelector('.extras');
      const referencesNode = part('references') || doc.querySelector('.references, footer.references');
      const capsulesNode   = part('capsules')   || doc.querySelector('.capsules');

      // Injection
      setBlockHTML('article-title',      titleNode ? titleNode.outerHTML : '');
      setBlockHTML('article-body',       bodyNode  ? bodyNode.outerHTML  : '');
      setBlockHTML('article-extras',     extrasNode     ? extrasNode.outerHTML     : '');
      setBlockHTML('article-references', referencesNode ? referencesNode.outerHTML : '');
      setBlockHTML('article-capsules',   capsulesNode   ? capsulesNode.outerHTML   : '');

      // Tools : de l’article ou partial
      if (toolsNode) {
        setBlockHTML('article-tools', toolsNode.outerHTML);
        setupShareButtons?.();
      } else {
        injectArticleTools();
      }

      // Media/Galerie → mosaïque + lightbox si présent
      if (mediaNode) {
        const imgs = [...mediaNode.querySelectorAll('img')].filter(i => i.getAttribute('src'));
        const caption = mediaNode.querySelector('figcaption')?.innerHTML || '';
        const galleryHTML = renderMosaicHTML ? renderMosaicHTML(imgs, caption) : mediaNode.outerHTML;
        setBlockHTML('article-media', galleryHTML);
        setupGalleryLightbox?.();
      } else {
        setBlockHTML('article-media', '');
      }

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

// Injecte du HTML et masque/affiche la carte selon contenu
function setBlockHTML(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html || '';
  const has = !!(html && html.trim());
  el.classList.toggle('is-empty', !has);       // masqué si vide
  el.setAttribute('aria-hidden', String(!has));
}

// ──────────────────────────────────────────────────────────────────────────────
// Outils de partage (identiques à ta version)
function injectArticleTools() {
  const tools = document.getElementById('article-tools');
  if (!tools) return;

  fetch('/partials/article-tools.html')
    .then(r => r.text())
    .then(html => {
      tools.innerHTML = html;
      const shareMenu = document.getElementById('share-menu');
      if (shareMenu && !shareMenu.classList.contains('hidden')) shareMenu.classList.add('hidden');
      setupShareButtons?.();
    })
    .catch(err => console.error('Erreur outils:', err));
}

// … (garde tes fonctions setupShareButtons / toggleShareMenu / handleShare / copyText)

// … (garde aussi renderMosaicHTML / buildLightbox / setupGalleryLightbox si tu as activé la galerie)

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
