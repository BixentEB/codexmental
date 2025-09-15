// viewer.js — Codex Mental (Blog + Atelier)
// - Shell viewer (blocs)
// - Chargement d’articles via ?article=… (ou ?projet=… pour l’atelier)
// - Titre + sous-titre, tools (share), galerie + lightbox
// - Découpe du body en chapitres + insertion ordonnée des notes
// - Ancres # : scroll propre + copie du lien

document.addEventListener('DOMContentLoaded', () => {
  const isBlog   = window.location.pathname.includes('/blog');
  const paramKey = isBlog ? 'article' : 'projet';
  const basePath = isBlog ? '/blog/articles/' : '/atelier/';

  const menuEl   = document.getElementById('viewer-menu');
  const viewerEl = document.getElementById('article-viewer');
  if (!viewerEl) return;

  ensureViewerShell(viewerEl);
  buildLightbox();

  if (menuEl) setupMenuLinks(menuEl, viewerEl, basePath, paramKey);

  // Activer les ancres # (titre de chapitre)
  initChapterAnchors(viewerEl);

  // Article initial
  const initial = new URLSearchParams(window.location.search).get(paramKey);
  if (initial) {
    loadContent(viewerEl, basePath + initial + '.html');
    // marquer actif dans le menu si présent
    if (menuEl) {
      const a = menuEl.querySelector(`a[data-viewer="${initial}"]`);
      if (a) {
        menuEl.querySelectorAll('a[data-viewer]').forEach(x=>x.classList.remove('active'));
        a.classList.add('active');
      }
    }
  }
});

/* ----------------------------------------------------------------------------
 * Shell viewer : sections standardisées
 * -------------------------------------------------------------------------- */
function ensureViewerShell(viewerEl){
  const blocks = [
    'article-title',
    'article-media',
    'article-body',
    'article-extras',
    'article-references',
    'article-capsules'
  ];
  blocks.forEach(id=>{
    if(!document.getElementById(id)){
      const s = document.createElement('section');
      s.id = id;
      s.className = 'viewer-block';
      if(id === 'article-title') s.classList.add('no-card'); // titre = pas de carte
      viewerEl.appendChild(s);
    }
  });
}

function setupMenuLinks(menuEl, viewerEl, basePath, paramKey){
  menuEl.querySelectorAll('a[data-viewer]').forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();
      const file = link.getAttribute('data-viewer');
      if(!file) return;
      loadContent(viewerEl, basePath + file + '.html');
      const u = new URL(window.location);
      u.searchParams.set(paramKey, file);
      window.history.pushState({}, '', u);
      menuEl.querySelectorAll('a[data-viewer]').forEach(a=>a.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function clearForeignChildren(viewerEl){
  const keep = new Set([
    'article-title','article-media','article-body',
    'article-extras','article-references','article-capsules'
  ]);
  Array.from(viewerEl.children).forEach(ch => { if(!keep.has(ch.id)) ch.remove(); });
}

/* ----------------------------------------------------------------------------
 * Chargement + parsing
 * -------------------------------------------------------------------------- */
function loadContent(viewerEl, url){
  fetch(url)
    .then(r => { if(!r.ok) throw new Error(url); return r.text(); })
    .then(html => {
      viewerEl.style.opacity = '0';
      clearForeignChildren(viewerEl);

      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const part = name => doc.querySelector(`[data-part="${name}"]`);

      /* ----- TITRE ----- */
      // on lit le H1 AVANT normalisation pour fabriquer le header
      const titleSection = part('title');
      const h1 = (titleSection && titleSection.querySelector('h1')) ||
                 doc.querySelector('article[data-article] h1') ||
                 doc.querySelector('h1');
      const subtitleNode =
        (titleSection && (titleSection.querySelector('h2[data-subtitle], .subtitle'))) ||
        (h1 && h1.nextElementSibling && h1.nextElementSibling.matches('h2, .subtitle, [data-subtitle]')
          ? h1.nextElementSibling
          : null);

      let titleHTML = '';
      if (h1){
        const safe  = sanitizeTitleHTML(h1.innerHTML || '');
        const sub   = subtitleNode ? escapeHTML(subtitleNode.textContent || '') : '';
        titleHTML =
          `<div class="title-chip"><span>${safe}</span></div>
           <div class="title-tools"></div>
           ${sub ? `<div class="title-sub">${sub}</div>` : ''}`;
      }
      setBlockHTML('article-title', titleHTML);

      /* ----- TOOLS (Share) ----- */
      const toolsEl = part('tools') || doc.getElementById('article-tools') || doc.querySelector('.tools');
      attachToolsIntoTitle(getInnerIfFilled(toolsEl) || defaultToolsMarkup());
      try { setupShareButtons(); } catch(e) { console.warn('Share init skipped:', e); }

      /* ----- MEDIA (galerie mosaïque) ----- */
      const mediaEl = part('media') || doc.querySelector('.media, .gallery, section[data-gallery]');
      let mediaHTML = '';
      if (mediaEl){
        const imgs = [...mediaEl.querySelectorAll('img')].filter(i => i.getAttribute('src'));
        if (imgs.length){
          const caption = mediaEl.querySelector('figcaption')?.innerHTML || '';
          mediaHTML = renderMosaicHTML(imgs, caption);
        }
      }
      setBlockHTML('article-media', mediaHTML);
      if (mediaHTML) setupGalleryLightbox();

      /* ----- BODY (chapitres + notes) ----- */
      removeDynamicItems(viewerEl); // nettoie les précédents chapitres/notes

      const bodyRoot = pickBodyRoot(doc, part);

      // Normalisation : articles "simples" (H1/H2...) → <section data-chapter>
      const normalized = normalizeShorthandToChapters(bodyRoot, h1?.textContent || '');

      // Parser (ordre + notes)
      const parsed = parseBodyOrdered(normalized);

      // Intro / corps
      setBlockHTML('article-body', parsed.introHTML);

      // Insertion des chapitres et notes avant extras/réfs/capsules
      const anchor =
        document.getElementById('article-extras') ||
        document.getElementById('article-references') ||
        document.getElementById('article-capsules') || null;

      parsed.items.forEach(item => {
        if (item.type === 'chapter'){
          const s = document.createElement('section');
          s.className = 'viewer-block card article-chapter chapter-card';
          if (item.accent) s.style.setProperty('--chap-accent', item.accent);
          if (item.id)     s.id = item.id;
          s.innerHTML = `
            <header class="chapter-header">
              ${item.icon ? `<span class="chapter-icon">${item.icon}</span>` : ''}
              <h2 class="chapter-title">
                ${escapeHTML(item.title)}
                ${item.id ? `<a class="anchor" href="#${item.id}">#</a>` : ''}
              </h2>
            </header>
            <div class="chapter-content">
              ${item.html}
            </div>`;
          viewerEl.insertBefore(s, anchor);
        } else if (item.type === 'note'){
          const noteCard = document.createElement('section');
          noteCard.className = 'viewer-block note-card';
          noteCard.innerHTML = item.html;   // déjà un <details> si généré par parse
          viewerEl.insertBefore(noteCard, anchor);
        }
      });

      /* ----- EXTRAS / REFERENCES / CAPSULES ----- */
      setBlockHTML('article-extras',     getOuterIfFilled(part('extras')     || doc.querySelector('.extras')));
      setBlockHTML('article-references', getOuterIfFilled(part('references') || doc.querySelector('.references, footer.references')));
      setBlockHTML('article-capsules',   getOuterIfFilled(part('capsules')   || doc.querySelector('.capsules')));

      requestAnimationFrame(() => viewerEl.style.opacity = '1');
    })
    .catch(err => {
      console.error(err);
      setBlockHTML('article-title','');
      setBlockHTML('article-media','');
      setBlockHTML('article-body', `<p class="erreur">Erreur chargement : ${escapeHTML(String(err))}</p>`);
      setBlockHTML('article-extras','');
      setBlockHTML('article-references','');
      setBlockHTML('article-capsules','');
      viewerEl.style.opacity = '1';
    });
}

/* ----------------------------------------------------------------------------
 * Sélection robuste du “body” dans les HTML legacy
 * -------------------------------------------------------------------------- */
function pickBodyRoot(doc, partFn){
  // priorité absolue à data-part="body" ou <article data-part="body">
  const p = partFn('body');
  if (p) return p;

  // ensuite <article data-article>
  const dataArticle = doc.querySelector('article[data-article]');
  if (dataArticle) return dataArticle;

  // sinon choisir l’<article> le plus “riche” s’il y en a plusieurs
  const articles = [...doc.querySelectorAll('article')];
  if (articles.length > 1) {
    // score simple : longueur textContent + profondeur
    const scored = articles.map(a => ({
      el: a,
      score: (a.textContent||'').length + a.querySelectorAll('*').length * 5
    })).sort((A,B)=>B.score-A.score);
    if (scored[0]) return scored[0].el;
  }
  if (articles.length === 1) return articles[0];

  // fallback : bloc principal commun
  return doc.querySelector('main > section') || doc.body;
}

/* ----------------------------------------------------------------------------
 * Parsing du body : respecte l’ordre, isole chapitres ET notes
 * - Sections <section data-chapter> => chapitres
 * - Blocs de note existants (.viewer-block.note-card ou <details.note-collapsible>)
 *   ou anciennes .codex-note => convertis en note-card collapsible
 * -------------------------------------------------------------------------- */

// Convertit un body "simple" (H1/H2...) en sections <section data-chapter="">
// + gère les H1 multiples et le H2 qui répète le H1
function normalizeShorthandToChapters(rootNode, titleText=''){
  // clone de travail
  const root = rootNode ? rootNode.cloneNode(true) : document.createElement('div');

  // Préférer <article data-article> si présent
  const prefer = root.querySelector && (root.querySelector('article[data-article]') || root) || root;

  // 0) Unifier le H1 : garder le premier, rétrograder les autres en H2
  const h1s = prefer.querySelectorAll ? prefer.querySelectorAll('h1') : [];
  const firstH1 = h1s[0] || null;
  if (h1s.length > 1) {
    for (let i=1;i<h1s.length;i++){
      const h1 = h1s[i];
      const h2 = document.createElement('h2');
      h2.innerHTML = h1.innerHTML;
      [...h1.attributes].forEach(a=>h2.setAttribute(a.name,a.value));
      h1.replaceWith(h2);
    }
  }

  // 1) Si chapitres déjà présents → retour
  if (prefer.querySelector && prefer.querySelector('section[data-chapter]')) return prefer;

  // 2) slug du H1 (pour ignorer un H2 identique)
  const titleSlug = slugify((titleText || firstH1?.textContent || '').trim());

  // 3) Extraire enfants (ignore texte vide)
  const nodes = Array.from(prefer.childNodes).filter(n => !(n.nodeType === 3 && !n.nodeValue.trim()));

  // 4) supprimer le premier H1 du flux (le viewer crée sa title-chip)
  const firstH1InFlow = nodes.find(n => n.nodeType === 1 && n.tagName?.toLowerCase() === 'h1');
  if (firstH1InFlow) firstH1InFlow.remove();

  // 5) Construire sections à partir des H2
  const container = document.createElement('div');
  nodes.forEach(n => container.appendChild(n));

  const out = document.createElement('div');
  let currentSection = null;
  let metH2 = false;

  const children = Array.from(container.childNodes);

  for (const node of children){
    if (node.nodeType === 1 && node.tagName.toLowerCase() === 'h2'){
      // anti-doublon : si ce H2 == H1 → ignorer
      const h2slug = slugify((node.textContent || '').trim());
      if (titleSlug && h2slug === titleSlug) continue;

      metH2 = true;
      // Fermer section courante
      if (currentSection) out.appendChild(currentSection);

      // Nouvelle section
      currentSection = document.createElement('section');
      currentSection.setAttribute('data-chapter', 'auto');
      const h2 = node.cloneNode(true);
      const id = h2.id || slugify((h2.textContent || '').trim());
      if (id) currentSection.id = id;
      currentSection.appendChild(h2);
      continue;
    }
    // Si un H2 a été vu → contenu de section
    if (metH2){
      if (!currentSection){
        currentSection = document.createElement('section');
        currentSection.setAttribute('data-chapter', 'auto');
      }
      currentSection.appendChild(node.cloneNode(true));
    } else {
      // avant le 1er H2 : intro
      out.appendChild(node.cloneNode(true));
    }
  }
  if (currentSection) out.appendChild(currentSection);

  return out;
}

function parseBodyOrdered(rootNode){
  const root = rootNode ? rootNode.cloneNode(true) : document.createElement('div');

  // retirer scripts/styles éventuels et le bloc <section data-part="title"> au cas où
  root.querySelectorAll('script, style, link[rel="stylesheet"], section[data-part="title"], #article-tools').forEach(n=>n.remove());

  const out = { introHTML:'', items:[] };
  const introNodes = [];
  let hasStarted = false;

  const children = Array.from(root.childNodes).filter(n => !(n.nodeType === 3 && !n.nodeValue.trim()));

  for (const n of children){
    if (n.nodeType === 1 && n.matches('section[data-chapter]')) {
      hasStarted = true;
      const sec = n.cloneNode(true);
      const accent = sec.getAttribute('data-accent') || '';
      const icon   = sec.getAttribute('data-icon')   || '';
      const idAttr = sec.getAttribute('id') || '';     // si l’auteur fournit un id

      // titre : data-title > <h2> > fallback
      const tFromAttr = sec.getAttribute('data-title');
      const h2 = sec.querySelector(':scope > h2');
      let title = tFromAttr || (h2 ? (h2.textContent || '').trim() : 'Chapitre');
      if (h2) h2.remove();

      const id = (idAttr || ('chap-' + slugify(title)));
      const html = (sec.innerHTML || '').trim();

      out.items.push({ type:'chapter', id, title, icon, accent, html });
      continue;
    }

    // Bloc de note existant : <section class="viewer-block note-card">… ou <details.note-collapsible>
    if (n.nodeType === 1 && (n.matches('section.viewer-block.note-card, .note-card, details.note-collapsible, .codex-note, [data-note], [data-block="note"]'))){
      hasStarted = true;
      const noteHTML = toNoteCardHTML(n);
      out.items.push({ type:'note', html: noteHTML });
      continue;
    }

    // Tout le reste
    if (!hasStarted) {
      introNodes.push(n.cloneNode(true));
    }
  }

  // intro
  const wrap = document.createElement('div');
  introNodes.forEach(x => wrap.appendChild(x));
  out.introHTML = (wrap.innerHTML || '').trim();

  return out;
}

// Transforme différentes variantes de note en HTML <details> prêt à insérer
function toNoteCardHTML(node){
  // 1) Si c’est déjà un <details class="note-collapsible">, on garde tel quel
  if (node.matches && node.matches('details.note-collapsible')) {
    return node.outerHTML;
  }
  // 2) Si c’est un container .viewer-block.note-card contenant déjà <details>, on retourne l’intérieur
  if (node.matches && node.matches('section.viewer-block.note-card, .note-card')) {
    const d = node.querySelector('details.note-collapsible');
    return d ? d.outerHTML : node.innerHTML;
  }
  // 3) Ancienne .codex-note (ou data-note) : on crée un details/summary simple
  const tmp = document.createElement('div');
  tmp.innerHTML = node.outerHTML || node.innerHTML || '';
  const title = (tmp.querySelector('h2,h3,h4')?.textContent || 'Note').trim();
  // retirer le premier titre pour ne garder que le corps
  const firstT = tmp.querySelector('h2,h3,h4'); if (firstT) firstT.remove();
  const body = tmp.innerHTML.trim();
  return `
    <details class="note-collapsible">
      <summary><h2 class="note-title">${escapeHTML(title)} <span class="chev">›</span></h2></summary>
      <div class="note-body">${body}</div>
    </details>`;
}

/* ----------------------------------------------------------------------------
 * Helpers UI
 * -------------------------------------------------------------------------- */
function setBlockHTML(id, html){
  const el = document.getElementById(id);
  if (!el) return;
  el.innerHTML = html || '';
  const has = !!(html && html.trim());
  el.classList.toggle('is-empty', !has);
  el.setAttribute('aria-hidden', String(!has));
}

function getInnerIfFilled(el){
  if (!el) return '';
  const html = el.innerHTML || '';
  return html.trim() ? html : '';
}
function getOuterIfFilled(el){
  if (!el) return '';
  const html = el.outerHTML || el.innerHTML || '';
  return (html.trim() ? html : '');
}

/* ----------------------------------------------------------------------------
 * Ancres # : scroll propre + copie du lien
 * -------------------------------------------------------------------------- */
function initChapterAnchors(container){
  if(!container) return;
  container.addEventListener('click', e=>{
    const a = e.target.closest('a.anchor'); if(!a) return;
    e.preventDefault();

    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target){
      const offset = getAnchorOffset();
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.history.replaceState({},'', `#${id}`);
      window.scrollTo({ top: y, behavior: 'smooth' });
    }

    // copie le lien profond
    if (navigator.clipboard){
      const deep = `${location.origin}${location.pathname}${location.search}#${id}`;
      navigator.clipboard.writeText(deep).then(()=>{
        a.classList.add('copied');
        setTimeout(()=>a.classList.remove('copied'), 1200);
      });
    }
  });
}
function getAnchorOffset(){
  const v  = getComputedStyle(document.documentElement).getPropertyValue('--anchor-offset').trim();
  const px = parseInt(v||'0',10);
  return isNaN(px) ? 0 : px;
}

/* ----------------------------------------------------------------------------
 * Tools : bouton Partager (Web Share API + fallback)
 * -------------------------------------------------------------------------- */
function attachToolsIntoTitle(html){
  const slot = document.querySelector('#article-title .title-tools');
  if (!slot) return;
  slot.innerHTML = html || '';
  if (!slot.textContent.trim() && !slot.querySelector('*')) slot.remove();
}
function defaultToolsMarkup(){
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
    </div>`;
}
function setupShareButtons(){
  const btn  = document.getElementById('share-button');
  const menu = document.getElementById('share-menu');
  if (!btn || !menu) return;

  const pageUrl   = window.location.href;
  const titleSpan = document.querySelector('#article-title .title-chip span');
  const pageTitle = titleSpan ? titleSpan.textContent.trim() : document.title;

  const closeMenu = () => {
    menu.classList.add('hidden');
    btn.setAttribute('aria-expanded','false');
    document.removeEventListener('click', onDocClick, true);
  };
  const onDocClick = (e) => {
    if (!menu.contains(e.target) && e.target !== btn) closeMenu();
  };

  btn.onclick = async (e) => {
    e.preventDefault();

    if (navigator.share) {
      try { await navigator.share({ title: pageTitle || 'Partager', url: pageUrl }); return; }
      catch(_) { /* annulé */ }
    }
    const isHidden = menu.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!isHidden));
    if (!isHidden) document.addEventListener('click', onDocClick, true);
  };

  menu.querySelectorAll('[data-share]').forEach(a=>{
    a.onclick = (e)=>{
      e.preventDefault();
      const type = a.dataset.share;
      switch(type){
        case 'facebook':
          window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,'_blank','noopener'); break;
        case 'twitter':
          window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`,'_blank','noopener'); break;
        case 'email':
          window.location.href = `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(pageUrl)}`; break;
        case 'copy':
          navigator.clipboard?.writeText(pageUrl).then(()=>{ a.textContent='✔️ Copié !'; setTimeout(()=>a.textContent='🔗 Copier le lien',1200); }); break;
      }
      closeMenu();
    };
  });
}

/* ----------------------------------------------------------------------------
 * Galerie mosaïque + Lightbox
 * -------------------------------------------------------------------------- */
const galleryState = { items:[], index:0 };

function renderMosaicHTML(imgNodes, caption=''){
  if(!imgNodes || !imgNodes.length) return '';
  const arr = imgNodes.slice();
  const i   = arr.findIndex(n => n.hasAttribute('data-main'));
  if (i > 0) arr.unshift(arr.splice(i,1)[0]); // la "main" en premier

  const tiles = arr.map((img,idx)=>{
    const src = img.getAttribute('src');
    const alt = (img.getAttribute('alt') || '').replace(/"/g,'&quot;');
    const cls = idx===0 ? 'tile tile--main' : 'tile';
    return `<figure class="${cls}"><img src="${src}" alt="${alt}" loading="lazy" decoding="async" data-idx="${idx}"></figure>`;
  }).join('');

  const cap = caption ? `<figcaption class="gallery-caption">${caption}</figcaption>` : '';
  return `<div class="media-gallery" data-count="${arr.length}"><div class="mosaic">${tiles}</div>${cap}</div>`;
}

function buildLightbox(){
  if(document.getElementById('viewer-lightbox')) return;
  const lb = document.createElement('div');
  lb.id = 'viewer-lightbox';
  lb.className = 'lightbox hidden';
  lb.setAttribute('role','dialog');
  lb.setAttribute('aria-modal','true');
  lb.setAttribute('aria-hidden','true');
  lb.innerHTML = `
    <div class="lb-backdrop"></div>
    <button class="lb-close" aria-label="Fermer">×</button>
    <button class="lb-nav lb-prev" aria-label="Précédent">‹</button>
    <figure class="lb-figure">
      <img id="lb-image" alt="">
      <figcaption id="lb-caption"></figcaption>
    </figure>
    <button class="lb-nav lb-next" aria-label="Suivant">›</button>
    <div class="lb-counter" aria-live="polite"></div>`;
  document.body.appendChild(lb);

  lb.querySelector('.lb-close').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-backdrop').addEventListener('click', closeLightbox);
  lb.querySelector('.lb-prev').addEventListener('click', prevImage);
  lb.querySelector('.lb-next').addEventListener('click', nextImage);

  document.addEventListener('keydown', e=>{
    if(lb.classList.contains('hidden')) return;
    if(e.key==='Escape')     closeLightbox();
    if(e.key==='ArrowLeft')  prevImage();
    if(e.key==='ArrowRight') nextImage();
  });

  let startX=0;
  lb.addEventListener('touchstart',e=>{ startX=e.touches[0].clientX; },{passive:true});
  lb.addEventListener('touchend',e=>{
    const dx=e.changedTouches[0].clientX-startX;
    if(Math.abs(dx)>40) (dx>0?prevImage():nextImage());
  },{passive:true});
}

function setupGalleryLightbox(){
  const imgs = [...document.querySelectorAll('#article-media .mosaic img')];
  galleryState.items = imgs.map(img=>({src:img.getAttribute('src'), alt:img.getAttribute('alt')||''}));
  imgs.forEach((img,idx)=>{
    img.addEventListener('click',()=>openLightbox(idx));
    img.style.cursor='zoom-in';
  });
}
function openLightbox(i=0){
  galleryState.index = Math.max(0, Math.min(i, galleryState.items.length-1));
  const lb = document.getElementById('viewer-lightbox'); if(!lb) return;
  updateLightboxImage();
  lb.classList.remove('hidden');
  lb.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
}
function closeLightbox(){
  const lb = document.getElementById('viewer-lightbox'); if(!lb) return;
  lb.classList.add('hidden');
  lb.setAttribute('aria-hidden','true');
  document.body.classList.remove('no-scroll');
}
function nextImage(){ if(!galleryState.items.length) return; galleryState.index=(galleryState.index+1)%galleryState.items.length; updateLightboxImage(true); }
function prevImage(){ if(!galleryState.items.length) return; galleryState.index=(galleryState.index-1+1e9)%galleryState.items.length; updateLightboxImage(true); }
function updateLightboxImage(anim=false){
  const it  = galleryState.items[galleryState.index];
  const img = document.getElementById('lb-image');
  const cap = document.getElementById('lb-caption');
  const cnt = document.querySelector('.lb-counter');
  if(!img) return;
  if (anim){ img.classList.remove('lb-swap'); void img.offsetWidth; img.classList.add('lb-swap'); }
  img.src = it.src; img.alt = it.alt || '';
  cap.textContent = it.alt || '';
  cnt.textContent = `${galleryState.index+1} / ${galleryState.items.length}`;
}

/* ----------------------------------------------------------------------------
 * Utilitaires
 * -------------------------------------------------------------------------- */
function removeDynamicItems(viewerEl){
  viewerEl.querySelectorAll('.article-chapter, .note-card').forEach(n => n.remove());
}
function slugify(s){
  return (s||'')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
function escapeHTML(s){
  return (s||'')
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}
// Autorise <br> et <wbr> dans le H1, échappe tout le reste
function sanitizeTitleHTML(rawHTML){
  const BR  = '[[BR]]';
  const WBR = '[[WBR]]';
  let s = (rawHTML || '')
    .replace(/<\s*br\s*\/?\s*>/gi, BR)
    .replace(/<\s*wbr\s*\/?\s*>/gi, WBR)
    .replace(/<\/?[^>]+>/g, ''); // toute autre balise supprimée
  const tmp = document.createElement('textarea');
  tmp.innerHTML = s;
  s = tmp.value
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  return s.replaceAll(BR,'<br>').replaceAll(WBR,'<wbr>');
}
