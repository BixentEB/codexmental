// viewer.js — viewer découpé + galerie + lightbox
// Changement : plus de bloc "article-tools" séparé.
// Le bouton de partage est injecté DANS #article-title (en haut à droite).

document.addEventListener('DOMContentLoaded', () => {
  const isBlog   = window.location.pathname.includes('/blog');
  const paramKey = isBlog ? 'article' : 'projet';
  const basePath = isBlog ? '/blog/articles/' : '/atelier/';

  const menuEl   = document.getElementById('viewer-menu');
  const viewerEl = document.getElementById('article-viewer');
  if (!menuEl || !viewerEl) return;

  ensureViewerShell(viewerEl);      // crée les blocs (sans article-tools)
  buildLightbox();                  // overlay plein écran pour les images
  setupMenuLinks(menuEl, viewerEl, basePath, paramKey);

  const initial = new URLSearchParams(window.location.search).get(paramKey);
  if (initial) loadContent(viewerEl, basePath + initial + '.html');
});

// -----------------------------------------------------------------------------
// Shell : uniquement les blocs utiles (pas de "article-tools")
function ensureViewerShell(viewerEl) {
  const ids = [
    'article-title',
    'article-media',
    'article-body',
    'article-extras',
    'article-references',
    'article-capsules'
  ];
  ids.forEach(id => {
    if (!document.getElementById(id)) {
      const s = document.createElement('section');
      s.id = id;
      s.className = 'viewer-block card is-empty';
      viewerEl.appendChild(s);
    }
  });
}

// Menu -> chargement
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

// Nettoie tout ce qui n'est pas nos blocs (évite l'intro résiduelle)
function clearForeignChildren(viewerEl) {
  const keep = new Set([
    'article-title','article-media','article-body',
    'article-extras','article-references','article-capsules'
  ]);
  Array.from(viewerEl.children).forEach(ch => { if (!keep.has(ch.id)) ch.remove(); });
}

// -----------------------------------------------------------------------------
// Chargement de l’article + découpe
function loadContent(viewerEl, url) {
  fetch(url)
    .then(r => { if (!r.ok) throw new Error('Introuvable'); return r.text(); })
    .then(html => {
      viewerEl.style.opacity = '0';
      clearForeignChildren(viewerEl);

      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const part = name => doc.querySelector(`[data-part="${name}"]`);

      // ----- TITRE -> title-chip + slot pour tools
      const titleNode =
        part('title') ||
        doc.querySelector('section[data-part="title"] h1') ||
        doc.querySelector('h1');

      let titleHTML = '';
      if (titleNode) {
        const text = (titleNode.textContent || '').trim();
        titleHTML = `
          <div class="title-chip"><span>${escapeHTML(text)}</span></div>
          <div class="title-tools"></div>
        `;
      }
      setBlockHTML('article-title', titleHTML);

      // ----- TOOLS : injecté dans .title-tools
      // 1) Si l’article fournit un bloc tools -> on l’utilise
      const toolsEl =
        part('tools') ||
        doc.getElementById('article-tools') ||
        doc.querySelector('.tools');
      let toolsHTML = getInnerIfFilled(toolsEl);

      // 2) Sinon on génère un fallback tout prêt (petit carré 🔗)
      if (!toolsHTML) toolsHTML = defaultToolsMarkup();

      attachToolsIntoTitle(toolsHTML);
      setupShareButtons(); // branchements

      // ----- MEDIA (galerie)
      const mediaEl =
        part('media') ||
        doc.querySelector('.media, .gallery, section[data-gallery]');
      let mediaHTML = '';
      if (mediaEl) {
        const imgs = [...mediaEl.querySelectorAll('img')].filter(i => i.getAttribute('src'));
        if (imgs.length) {
          const caption = mediaEl.querySelector('figcaption')?.innerHTML || '';
          mediaHTML = renderMosaicHTML(imgs, caption);
        }
      }
      setBlockHTML('article-media', mediaHTML);
      if (mediaHTML) setupGalleryLightbox();

      // ----- BODY (on retire tout H1 éventuel du body)
      let bodyNode =
        part('body') ||
        doc.querySelector('article[data-part="body"]') ||
        doc.querySelector('.article') ||
        doc.querySelector('article') ||
        doc.querySelector('main > section') ||
        doc.querySelector('section');

      let bodyHTML = '';
      if (bodyNode) {
        bodyNode = bodyNode.cloneNode(true);
        const h1 = bodyNode.querySelector('h1');
        if (h1) h1.remove();
        bodyHTML = bodyNode.innerHTML.trim();
      }
      setBlockHTML('article-body', bodyHTML);

      // ----- EXTRAS / REF / CAPSULES
      setBlockHTML('article-extras',     getOuterIfFilled(part('extras')     || doc.querySelector('.extras')));
      setBlockHTML('article-references', getOuterIfFilled(part('references') || doc.querySelector('.references, footer.references')));
      setBlockHTML('article-capsules',   getOuterIfFilled(part('capsules')   || doc.querySelector('.capsules')));

      requestAnimationFrame(() => (viewerEl.style.opacity = '1'));
    })
    .catch(err => {
      setBlockHTML('article-title', '');
      setBlockHTML('article-media', '');
      setBlockHTML('article-body', `<p class="erreur">Erreur chargement : ${url}</p>`);
      setBlockHTML('article-extras', '');
      setBlockHTML('article-references', '');
      setBlockHTML('article-capsules', '');
      console.error(err);
    });
}

function setBlockHTML(id, html) {
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html || '';
  const has = !!(html && html.trim());
  el.classList.toggle('is-empty', !has);
  el.setAttribute('aria-hidden', String(!has));
}

// --- tools in title ----------------------------------------------------------
function attachToolsIntoTitle(html) {
  const slot = document.querySelector('#article-title .title-tools');
  if (!slot) return;
  slot.innerHTML = html;
  // Si rien de plus que whitespace -> le slot reste vide et n'affiche rien
  if (!slot.textContent.trim() && !slot.querySelector('*')) {
    slot.remove(); // pas de conteneur vide
  }
}
function defaultToolsMarkup() {
  // Marquage minimal (même ids que ton partial) — “petit carré” 🔗
  return `
    <div class="article-tools">
      <div class="btn-share-wrapper">
        <button id="share-button" class="btn-share-article" aria-haspopup="true" aria-expanded="false" title="Partager">
          <span class="icon">🔗</span><span class="label">Partager</span>
        </button>
        <div id="share-menu" class="share-menu hidden" role="menu">
          <a href="#" data-share="facebook" role="menuitem">📘 Facebook</a>
          <a href="#" data-share="twitter"  role="menuitem">𝕏 Twitter</a>
          <a href="#" data-share="email"    role="menuitem">✉️ Email</a>
          <a href="#" data-share="copy"     role="menuitem">🔗 Copier le lien</a>
        </div>
      </div>
    </div>
  `;
}

// helpers “section vide”
function getInnerIfFilled(node) { if (!node) return ''; const s = (node.innerHTML||'').trim(); return s ? s : ''; }
function getOuterIfFilled(node) { if (!node) return ''; const s = (node.innerHTML||'').trim(); return s ? node.outerHTML : ''; }

// --- partage -----------------------------------------------------------------
function setupShareButtons() {
  const shareBtn  = document.getElementById('share-button');
  const shareMenu = document.getElementById('share-menu');
  if (!shareBtn) return;

  shareBtn.addEventListener('click', e => {
    e.stopPropagation();
    if (window.innerWidth <= 768 && navigator.share) {
      navigator.share({ title: document.title, text: 'Découvrez cet article !', url: window.location.href })
        .catch(() => toggleShareMenu());
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
  const btn  = document.getElementById('share-button');
  if (!menu || !btn) return;
  const willHide = forceHide || !menu.classList.contains('hidden');
  if (willHide) {
    menu.classList.add('hidden'); btn.setAttribute('aria-expanded', 'false');
    document.removeEventListener('click', outsideHandler);
  } else {
    menu.classList.remove('hidden'); btn.setAttribute('aria-expanded', 'true');
    document.addEventListener('click', outsideHandler);
    setTimeout(() => toggleShareMenu(true), 5000);
  }
}
function outsideHandler(e){ const m=document.getElementById('share-menu'); if(m && !m.contains(e.target)) toggleShareMenu(true); }
function handleShare(p){
  const url = window.location.href;
  let t = '';
  if (p === 'facebook') t = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  else if (p === 'twitter') t = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}`;
  else if (p === 'email')  t = `mailto:?subject=Article&body=${encodeURIComponent(url)}`;
  else if (p === 'copy')   { copyText(url); return; }
  if (t) window.open(t, '_blank');
}
function copyText(text){ if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(text).catch(()=>fallbackCopy(text));} else fallbackCopy(text); }
function fallbackCopy(text){ const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta); }

// --- URL + actif -------------------------------------------------------------
function updateURL(key, val){ const u=new URL(window.location); u.searchParams.set(key,val); window.history.pushState({},'',u); }
function highlightActive(menuEl, link){ menuEl.querySelectorAll('a[data-viewer]').forEach(a=>a.classList.remove('active')); link.classList.add('active'); }

// --- Galerie + lightbox (inchangé) ------------------------------------------
const galleryState = { items: [], index: 0 };
function renderMosaicHTML(imgNodes, caption=''){
  if(!imgNodes||!imgNodes.length) return '';
  const arr=imgNodes.slice(); const i=arr.findIndex(n=>n.hasAttribute('data-main')); if(i>0) arr.unshift(arr.splice(i,1)[0]);
  const tiles=arr.map((img,idx)=>{const src=img.getAttribute('src'); const alt=(img.getAttribute('alt')||'').replace(/"/g,'&quot;'); const cls=idx===0?'tile tile--main':'tile'; return `<figure class="${cls}"><img src="${src}" alt="${alt}" loading="lazy" decoding="async" data-idx="${idx}"></figure>`;}).join('');
  const cap=caption?`<figcaption class="gallery-caption">${caption}</figcaption>`:'';
  return `<div class="media-gallery" data-count="${arr.length}"><div class="mosaic">${tiles}</div>${cap}</div>`;
}
function buildLightbox(){
  if(document.getElementById('viewer-lightbox')) return;
  const lb=document.createElement('div');
  lb.id='viewer-lightbox'; lb.className='lightbox hidden'; lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-hidden','true');
  lb.innerHTML=`<div class="lb-backdrop"></div>
    <button class="lb-close" aria-label="Fermer">×</button>
    <button class="lb-nav lb-prev" aria-label="Précédent">‹</button>
    <figure class="lb-figure"><img id="lb-image" alt=""><figcaption id="lb-caption"></figcaption></figure>
    <button class="lb-nav lb-next" aria-label="Suivant">›</button>
    <div class="lb-counter" aria-live="polite"></div>`;
  document.body.appendChild(lb);
  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-prev').addEventListener('click', prevImage);
  lb.querySelector('.lb-next').addEventListener('click', nextImage);
  document.addEventListener('keydown', e=>{ if(lb.classList.contains('hidden')) return; if(e.key==='Escape') closeLightbox(); if(e.key==='ArrowLeft') prevImage(); if(e.key==='ArrowRight') nextImage(); });
  let startX=0; lb.addEventListener('touchstart',e=>{startX=e.touches[0].clientX;},{passive:true});
  lb.addEventListener('touchend',e=>{const dx=e.changedTouches[0].clientX-startX; if(Math.abs(dx)>40) (dx>0?prevImage():nextImage());},{passive:true});
}
function setupGalleryLightbox(){const imgs=Array.from(document.querySelectorAll('#article-media .mosaic img')); galleryState.items=imgs.map(img=>({src:img.getAttribute('src'),alt:img.getAttribute('alt')||''})); imgs.forEach((img,idx)=>{img.addEventListener('click',()=>openLightbox(idx)); img.style.cursor='zoom-in';});}
function openLightbox(i=0){galleryState.index=Math.max(0,Math.min(i,galleryState.items.length-1)); const lb=document.getElementById('viewer-lightbox'); if(!lb) return; updateLightboxImage(); lb.classList.remove('hidden'); lb.setAttribute('aria-hidden','false'); document.body.classList.add('no-scroll');}
function closeLightbox(){const lb=document.getElementById('viewer-lightbox'); if(!lb) return; lb.classList.add('hidden'); lb.setAttribute('aria-hidden','true'); document.body.classList.remove('no-scroll');}
function nextImage(){ if(!galleryState.items.length) return; galleryState.index=(galleryState.index+1)%galleryState.items.length; updateLightboxImage(true); }
function prevImage(){ if(!galleryState.items.length) return; galleryState.index=(galleryState.index-1+galleryState.items.length)%galleryState.items.length; updateLightboxImage(true); }
function updateLightboxImage(anim=false){ const it=galleryState.items[galleryState.index]; const img=document.getElementById('lb-image'); const cap=document.getElementById('lb-caption'); const cnt=document.querySelector('.lb-counter'); if(!img) return; if(anim){img.classList.remove('lb-swap'); void img.offsetWidth; img.classList.add('lb-swap');} img.src=it.src; img.alt=it.alt||''; cap.textContent=it.alt||''; cnt.textContent=`${galleryState.index+1} / ${galleryState.items.length}`; }
function escapeHTML(s){return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
