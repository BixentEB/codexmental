// viewer.js – moteur unifié Blog + Atelier + partage

document.addEventListener('DOMContentLoaded', () => {
  const path = window.location.pathname;
  const isBlog = path.includes('/blog');
  const paramKey = isBlog ? 'article' : 'projet';
  const menuUrl = isBlog
    ? '/blog/blog-menu.html'
    : '/atelier/atelier-menu.html';
  const basePath = isBlog
    ? '/blog/articles/'
    : '/atelier/';

  const menuEl = document.getElementById('viewer-menu');
  const viewerEl = document.getElementById('article-viewer');
  if (!menuEl || !viewerEl) return;

  injectMenu(menuUrl, () => {
    setupMenuLinks(menuEl, viewerEl, basePath, paramKey);
    const initial = new URLSearchParams(window.location.search).get(paramKey);
    if (initial) loadContent(viewerEl, basePath + initial + '.html', true);
  });
});

// --- injecte le menu (blog ou atelier)
function injectMenu(url, cb) {
  fetch(url)
    .then(r => r.text())
    .then(html => {
      document.getElementById('viewer-menu').innerHTML = html;
      cb?.();
    })
    .catch(err => console.error('Erreur menu:', err));
}

// --- clic dans menu -> charge contenu
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

// --- charge l'article/projet et injecte outils
function loadContent(viewerEl, url) {
  fetch(url)
    .then(r => {
      if (!r.ok) throw new Error('Introuvable');
      return r.text();
    })
    .then(html => {
      viewerEl.style.opacity = '0';
      viewerEl.innerHTML = html;
      
      // FORCER LE MENU À ÊTRE CACHÉ SUR MOBILE
      const shareMenu = document.getElementById('share-menu');
      if (shareMenu && window.innerWidth <= 768) {
        shareMenu.classList.add('hidden');
      }
      
      injectArticleTools();
      requestAnimationFrame(() => (viewerEl.style.opacity = '1'));
    })
    .catch(err => {
      viewerEl.innerHTML = `<p class="erreur">Erreur chargement : ${url}</p>`;
      console.error(err);
    });
}

// --- injecte le partial de partage
function injectArticleTools() {
  const tools = document.getElementById('article-tools');
  if (!tools) return;

  fetch('/partials/article-tools.html')
    .then(r => r.text())
    .then(html => {
      tools.innerHTML = html;

      // 🛡️ Sécurise état initial fermé
      const shareMenu = document.getElementById('share-menu');
      if (shareMenu && !shareMenu.classList.contains('hidden')) {
        shareMenu.classList.add('hidden');
      }

      setupShareButtons();
    })
    .catch(err => console.error('Erreur outils:', err));
}

// --- met en place les handlers du bouton partager
function setupShareButtons() {
  const shareBtn = document.getElementById('share-button');
  const shareMenu = document.getElementById('share-menu');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', e => {
    e.stopPropagation();

    // Comportement mobile uniquement
    if (window.innerWidth <= 768) {
      // Essayer d'abord le partage natif
      if (navigator.share) {
        navigator.share({
          title: document.title,
          text: 'Découvrez cet article !',
          url: window.location.href
        }).catch(err => {
          console.warn("Partage natif échoué, fallback custom:", err);
          toggleShareMenu(); // Affiche le menu custom si échec
        });
        return; // On sort après tentative de partage natif
      }
    }
    
    // Comportement desktop OU mobile sans support natif
    toggleShareMenu();
  });

  // Gestion des liens du menu (inchangée)
  if (shareMenu) {
    shareMenu.querySelectorAll('a[data-share]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const platform = a.getAttribute('data-share');
        handleShare(platform);
        toggleShareMenu(true);
      });
    });
  }
}



// --- ouvre/cache le menu de partage
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

// --- ferme au clic extérieur
function outsideHandler(e) {
  const menu = document.getElementById('share-menu');
  if (menu && !menu.contains(e.target)) {
    toggleShareMenu(true);
  }
}

// --- partage vers la plateforme ou copie
function handleShare(platform) {
  const url = window.location.href;
  let target = '';
  
  if (platform === 'facebook') {
    target = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  } else if (platform === 'twitter') {
    target = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
  } else if (platform === 'email') {
    target = `mailto:?subject=Article&body=${encodeURIComponent(url)}`;
  } else if (platform === 'copy') { 
    copyText(url); 
    return; 
  }

  if (target) window.open(target, '_blank');
}

// --- copie compatible cross-browser
function copyText(text) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
  } else {
    fallbackCopy(text);
  }
}

function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

// --- update URL sans reload
function updateURL(key, val) {
  const u = new URL(window.location);
  u.searchParams.set(key, val);
  window.history.pushState({}, '', u);
}

// --- surligne l'élément actif
function highlightActive(menuEl, link) {
  menuEl.querySelectorAll('a[data-viewer]').forEach(a => a.classList.remove('active'));
  link.classList.add('active');
}
