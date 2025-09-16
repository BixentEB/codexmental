// viewer.js — Codex Mental (Blog + Atelier) — build 2025-09-15
// Corrections clés :
// • Lecture titre + sous-titre via <h1 data-subtitle="…"> (on n’utilise plus un <h2> voisin)
// • Suppression de tous les <h1> du corps + de #article-tools résiduels (anti-doublon)
// • Ignore un <h2> identique au <h1> (anti-doublon)
// • Sélection robuste du body (préfère <article data-article>, sinon l’<article> “le plus riche”)
// • Conversion auto H2 → <section data-chapter> si article “simple”, même si wrappeurs (ex. .bloc-full)
// • parseBodyOrdered : ignore les commentaires HTML (évite le “bloc vide”)
// • setBlockHTML : masque totalement l’intro si vide (après strip des commentaires)

// viewer.js — Codex Mental (Blog + Atelier) — build 2025-09-16

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
  initChapterAnchors(viewerEl);

  const initial = new URLSearchParams(window.location.search).get(paramKey);
  if (initial) {
    loadContent(viewerEl, basePath + initial + '.html');
    if (menuEl) {
      const a = menuEl.querySelector(`a[data-viewer="${initial}"]`);
      if (a) {
        menuEl.querySelectorAll('a[data-viewer]').forEach(x=>x.classList.remove('active'));
        a.classList.add('active');
      }
    }
  }
});

/* ───────────────────────────────── Shell ─────────────────────────────────── */
function ensureViewerShell(viewerEl){
  ['article-title','article-media','article-body','article-extras','article-references','article-capsules']
    .forEach(id=>{
      if(!document.getElementById(id)){
        const s = document.createElement('section');
        s.id = id;
        s.className = 'viewer-block';
        if(id === 'article-title') s.classList.add('no-card');
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
  const keep = new Set(['article-title','article-media','article-body','article-extras','article-references','article-capsules']);
  Array.from(viewerEl.children).forEach(ch => { if(!keep.has(ch.id)) ch.remove(); });
}

/* ─────────────────────────────── Chargement ──────────────────────────────── */
function loadContent(viewerEl, url){
  // 1) Vider TOUT DE SUITE pour éviter l’effet “fantôme” si fetch échoue
  setBlockHTML('article-title','');
  setBlockHTML('article-media','');
  setBlockHTML('article-body','');
  setBlockHTML('article-extras','');
  setBlockHTML('article-references','');
  setBlockHTML('article-capsules','');

  fetch(url)
    .then(r => { if(!r.ok) throw new Error(url); return r.text(); })
    .then(html => {
      viewerEl.style.opacity = '0';
      clearForeignChildren(viewerEl);

      const doc  = new DOMParser().parseFromString(html, 'text/html');
      const part = name => doc.querySelector(`[data-part="${name}"]`);

      /* ----- GARDE CONTENU : refuser une page fallback qui n’a pas d’article ----- */
      const hasArticleMarkers = !!(
        doc.querySelector('article[data-article]') ||
        doc.querySelector('section[data-part="title"]') ||
        doc.querySelector('[data-chapter], h2')
      );
      if (!hasArticleMarkers) throw new Error(url);

      /* ----- TITRE ----- */
      const titleSection = part('title');
      const h1 = (titleSection && titleSection.querySelector('h1')) ||
                 doc.querySelector('article[data-article] h1') ||
                 doc.querySelector('h1');

      const subtitle =
        (h1?.getAttribute('data-subtitle') || '').trim() ||
        (titleSection?.querySelector('[data-subtitle], .subtitle')?.textContent || '').trim();

      let titleHTML = '';
      if (h1){
        const safe  = sanitizeTitleHTML(h1.innerHTML || '');
        titleHTML =
          `<div class="title-chip"><span>${safe}</span></div>
           <div class="title-tools"></div>
           ${subtitle ? `<div class="title-sub">${escapeHTML(subtitle)}</div>` : ''}`;
      }
      setBlockHTML('article-title', titleHTML);

      /* ----- TOOLS ----- */
      const toolsEl = part('tools') || doc.getElementById('article-tools') || doc.querySelector('.tools');
      attachToolsIntoTitle(getInnerIfFilled(toolsEl) || defaultToolsMarkup());
      try { setupShareButtons(); } catch(e) {}

      /* ----- MEDIA ----- */
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

      /* ----- BODY ----- */
      removeDynamicItems(viewerEl);
      const bodyRoot = pickBodyRoot(doc, part);

      // Normalisation “H1/H2 simples” → sections data-chapter (déplie les wrappeurs)
      const normalized = normalizeShorthandToChapters(bodyRoot, h1?.textContent || '');

      // Parsing ordonné (intro + chapitres + notes)
      const parsed = parseBodyOrdered(normalized);

      setBlockHTML('article-body', parsed.introHTML);

      // Insertion des cartes chapitres/notes avant extras/réfs/capsules
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
          noteCard.innerHTML = item.html;
          viewerEl.insertBefore(noteCard, anchor);
        }
      });

      /* ----- EXTRA / REF / CAPS ----- */
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

/* ─────────────── Sélection robuste du body (legacy safe) ─────────────────── */
function pickBodyRoot(doc, partFn){
  const p = partFn('body'); if (p) return p;
  const dataArticle = doc.querySelector('article[data-article]'); if (dataArticle) return dataArticle;

  const articles = [...doc.querySelectorAll('article')];
  if (articles.length > 1) {
    const scored = articles.map(a => ({
      el:a,
      score:(a.textContent||'').length + a.querySelectorAll('*').length * 5
    })).sort((A,B)=>B.score-A.score);
    if (scored[0]) return scored[0].el;
  }
  if (articles.length === 1) return articles[0];

  return doc.querySelector('main > section') || doc.body;
}

/* ───────────── Normalisation H1/H2 → sections + anti-doublons ───────────── */
function normalizeShorthandToChapters(rootNode, titleText=''){
  const root = rootNode ? rootNode.cloneNode(true) : document.createElement('div');

  // Helpers
  const hasDirectH2 = (el) => [...el.children].some(ch => ch.tagName && ch.tagName.toLowerCase()==='h2');
  const cleanExtras  = (el) => {
    el.querySelectorAll && el.querySelectorAll('h1, #article-tools, script, style, link[rel="stylesheet"]').forEach(n=>n.remove());
    return el;
  };
  const unwrapToH2Host = (el) => {
    let cur = el;
    // Descend dans les wrappeurs “simples” (1 enfant utile)
    for (let guard=0; guard<6; guard++){
      const kids = [...cur.children].filter(k => !k.matches('script, style, link[rel="stylesheet"]'));
      if (kids.length === 1 && !kids[0].hasAttribute('data-part')) {
        cur = kids[0];
      } else break;
    }
    // Si pas d’H2 directs, remonte au conteneur le + proche qui en contient
    if (!hasDirectH2(cur)) {
      const host = cur.querySelector('h2')?.closest('section,div,article,main') || cur;
      cur = host;
    }
    return cur;
  };

  // 0) Préférer <article data-article> si présent
  const prefer = (root.querySelector && (root.querySelector('article[data-article]') || root)) || root;

  // Nettoyage H1/Tools/scripts
  cleanExtras(prefer);

  // Trouver le niveau où les H2 sont au 1er niveau
  const work = unwrapToH2Host(prefer);
  cleanExtras(work);

  // ✅ EARLY RETURN : si l’article est déjà structuré en chapitres, on ne touche à rien
  if (work.querySelector && work.querySelector('section[data-chapter]')) return work;

  // Anti-doublon : ignorer un H2 identique au H1
  const titleSlug = slugify((titleText || '').trim());

  // Construire sections à partir des H2 directs
  const nodes = Array.from(work.childNodes).filter(n => !(n.nodeType === 3 && !n.nodeValue.trim()));
  const container = document.createElement('div'); nodes.forEach(n => container.appendChild(n));

  const out = document.createElement('div');
  let currentSection = null, metH2 = false;

  for (const node of Array.from(container.childNodes)){
    if (node.nodeType === 1 && node.tagName.toLowerCase() === 'h2'){
      const h2slug = slugify((node.textContent || '').trim());
      if (titleSlug && h2slug === titleSlug) continue;

      if (currentSection) out.appendChild(currentSection);
      metH2 = true;

      currentSection = document.createElement('section');
      currentSection.setAttribute('data-chapter','auto');
      const h2 = node.cloneNode(true);
      const id = h2.id || slugify((h2.textContent || '').trim());
      if (id) currentSection.id = id;
      currentSection.appendChild(h2);
      continue;
    }
    if (metH2){
      if (!currentSection){
        currentSection = document.createElement('section');
        currentSection.setAttribute('data-chapter','auto');
      }
      currentSection.appendChild(node.cloneNode(true));
    } else {
      // Avant le 1er H2 → intro
      out.appendChild(node.cloneNode(true));
    }
  }
  if (currentSection) out.appendChild(currentSection);
  return out;
}

/* ─────────────────────────── Parsing ordonné ─────────────────────────────── */
function parseBodyOrdered(rootNode){
  const root = rootNode ? rootNode.cloneNode(true) : document.createElement('div');
  root.querySelectorAll('script, style, link[rel="stylesheet"], section[data-part="title"], #article-tools').forEach(n=>n.remove());

  const out = { introHTML:'', items:[] };
  const introNodes = [];
  let hasStarted = false;

  // Ignore texte blanc ET commentaires HTML
  const children = Array.from(root.childNodes).filter(n =>
    !(n.nodeType === 3 && !n.nodeValue.trim()) && // texte vide
    n.nodeType !== 8                               // commentaires
  );

  for (const n of children){
    if (n.nodeType === 1 && n.matches('section[data-chapter]')) {
      hasStarted = true;
      const sec = n.cloneNode(true);
      const accent = sec.getAttribute('data-accent') || '';
      const icon   = sec.getAttribute('data-icon')   || '';
      const idAttr = sec.getAttribute('id') || '';
      const tFromAttr = sec.getAttribute('data-title');
      const h2 = sec.querySelector(':scope > h2');
      let title = tFromAttr || (h2 ? (h2.textContent || '').trim() : 'Chapitre');
      if (h2) h2.remove();
      const id = (idAttr || ('chap-' + slugify(title)));
      const html = (sec.innerHTML || '').trim();
      out.items.push({ type:'chapter', id, title, icon, accent, html });
      continue;
    }

    // Notes : déjà en <details> ou formats legacy
    if (n.nodeType === 1 && (n.matches('section.viewer-block.note-card, .note-card, details.note-collapsible, .codex-note, [data-note], [data-block="note"]'))){
      hasStarted = true;
      const noteHTML = toNoteCardHTML(n);
      out.items.push({ type:'note', html: noteHTML });
      continue;
    }

    if (!hasStarted) {
      introNodes.push(n.cloneNode(true));
    }
  }

  const wrap = document.createElement('div');
  introNodes.forEach(x => wrap.appendChild(x));
  out.introHTML = (wrap.innerHTML || '').trim();
  return out;
}
function toNoteCardHTML(node){
  if (node.matches && node.matches('details.note-collapsible')) return node.outerHTML;
  if (node.matches && node.matches('section.viewer-block.note-card, .note-card')) {
    const d = node.querySelector('details.note-collapsible'); return d ? d.outerHTML : node.innerHTML;
  }
  const tmp = document.createElement('div');
  tmp.innerHTML = node.outerHTML || node.innerHTML || '';
  const title = (tmp.querySelector('h2,h3,h4')?.textContent || 'Note').trim();
  const firstT = tmp.querySelector('h2,h3,h4'); if (firstT) firstT.remove();
  const body = tmp.innerHTML.trim();
  return `
    <details class="note-collapsible">
      <summary><h2 class="note-title">${escapeHTML(title)} <span class="chev">›</span></h2></summary>
      <div class="note-body">${body}</div>
    </details>`;
}

/* ───────────────────────────── Utilitaires ───────────────────────────────── */
function removeDynamicItems(viewerEl){ viewerEl.querySelectorAll('.article-chapter, .note-card').forEach(n => n.remove()); }
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
// Autorise <br>/<wbr> dans le H1, échappe le reste
function sanitizeTitleHTML(rawHTML){
  const BR='[[BR]]', WBR='[[WBR]]';
  let s=(rawHTML||'')
    .replace(/<\s*br\s*\/?\s*>/gi,BR)
    .replace(/<\s*wbr\s*\/?\s*>/gi,WBR)
    .replace(/<\/?[^>]+>/g,'');
  const tmp=document.createElement('textarea'); tmp.innerHTML=s; s=tmp.value
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
  return s.replaceAll(BR,'<br>').replaceAll(WBR,'<wbr>');
}
function stripHTMLComments(s){
  return (s || '').replace(/<!--[\s\S]*?-->/g, '');
}
function setBlockHTML(id, html){
  const el = document.getElementById(id);
  if (!el) return;

  // Évalue le “vide” après suppression des commentaires
  const clean = stripHTMLComments(html || '').trim();
  const has = clean.length > 0;

  el.innerHTML = has ? html : '';
  el.classList.toggle('is-empty', !has);
  el.setAttribute('aria-hidden', String(!has));

  // Masque totalement l’intro si elle est vide (évite le “gros bloc vide”)
  if (id === 'article-body') {
    el.style.display = has ? '' : 'none';
  }
}
function getInnerIfFilled(el){
  if (!el) return '';
  const html = el.innerHTML || '';
  const clean = stripHTMLComments(html).trim();
  return clean ? html : '';
}
function getOuterIfFilled(el){
  if (!el) return '';
  const html = el.outerHTML || el.innerHTML || '';
  const clean = stripHTMLComments(html).trim();
  return clean ? html : '';
}



/* ───────────────────────────── Ancres # ──────────────────────────────────── */
function initChapterAnchors(container){
  if(!container) return;
  container.addEventListener('click', e=>{
    const a = e.target.closest('a.anchor'); if(!a) return; e.preventDefault();
    const id = a.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (target){
      const offset = getAnchorOffset();
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.history.replaceState({},'', `#${id}`);
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    if (navigator.clipboard){
      const deep = `${location.origin}${location.pathname}${location.search}#${id}`;
      navigator.clipboard.writeText(deep).then(()=>{
        a.classList.add('copied'); setTimeout(()=>a.classList.remove('copied'), 1200);
      });
    }
  });
}
function getAnchorOffset(){
  const v  = getComputedStyle(document.documentElement).getPropertyValue('--anchor-offset').trim();
  const px = parseInt(v||'0',10); return isNaN(px) ? 0 : px;
}

/* ───────────────────────────── Tools / Share ─────────────────────────────── */
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
  const onDocClick = (e) => { if (!menu.contains(e.target) && e.target !== btn) closeMenu(); };

  btn.onclick = async (e) => {
    e.preventDefault();
    if (navigator.share) { try { await navigator.share({ title: pageTitle || 'Partager', url: pageUrl }); return; } catch(_) {} }
    const isHidden = menu.classList.toggle('hidden');
    btn.setAttribute('aria-expanded', String(!isHidden));
    if (!isHidden) document.addEventListener('click', onDocClick, true);
  };

  menu.querySelectorAll('[data-share]').forEach(a=>{
    a.onclick = (e)=>{
      e.preventDefault();
      const type = a.dataset.share;
      switch(type){
        case 'facebook': window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}`,'_blank','noopener'); break;
        case 'twitter':  window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(pageTitle)}`,'_blank','noopener'); break;
        case 'email':    window.location.href = `mailto:?subject=${encodeURIComponent(pageTitle)}&body=${encodeURIComponent(pageUrl)}`; break;
        case 'copy':     navigator.clipboard?.writeText(pageUrl).then(()=>{ a.textContent='✔️ Copié !'; setTimeout(()=>a.textContent='🔗 Copier le lien',1200); }); break;
      }
      closeMenu();
    };
  });
}

/* ─────────────────────────── Galerie / Lightbox ──────────────────────────── */
const galleryState = { items:[], index:0 };
function renderMosaicHTML(imgNodes, caption=''){
  if(!imgNodes || !imgNodes.length) return '';
  const arr = imgNodes.slice();
  const i   = arr.findIndex(n => n.hasAttribute('data-main'));
  if (i > 0) arr.unshift(arr.splice(i,1)[0]);
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
  lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-hidden','true');
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
  imgs.forEach((img,idx)=>{ img.addEventListener('click',()=>openLightbox(idx)); img.style.cursor='zoom-in'; });
}
function openLightbox(i=0){
  galleryState.index = Math.max(0, Math.min(i, galleryState.items.length-1));
  const lb = document.getElementById('viewer-lightbox'); if(!lb) return;
  updateLightboxImage();
  lb.classList.remove('hidden'); lb.setAttribute('aria-hidden','false');
  document.body.classList.add('no-scroll');
}
function closeLightbox(){
  const lb = document.getElementById('viewer-lightbox'); if(!lb) return;
  lb.classList.add('hidden'); lb.setAttribute('aria-hidden','true');
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
