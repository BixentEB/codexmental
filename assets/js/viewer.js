// viewer.js — rétro-compat NEW + LEGACY (.article) + <br>/<wbr> dans H1
// + chapitres en cartes + extraction automatique des .codex-note en cartes séparées

document.addEventListener('DOMContentLoaded', () => {
  const isBlog   = window.location.pathname.includes('/blog');
  const paramKey = isBlog ? 'article' : 'projet';
  const basePath = isBlog ? '/blog/articles/' : '/atelier/';

  const menuEl   = document.getElementById('viewer-menu');
  const viewerEl = document.getElementById('article-viewer');
  if (!menuEl || !viewerEl) return;

  ensureViewerShell(viewerEl);
  buildLightbox();
  setupMenuLinks(menuEl, viewerEl, basePath, paramKey);

  const initial = new URLSearchParams(window.location.search).get(paramKey);
  if (initial) loadContent(viewerEl, basePath + initial + '.html');
});

// ---------- shell (sans bloc tools séparé, on met les outils dans le titre)
function ensureViewerShell(viewerEl){
  ['article-title','article-media','article-body','article-extras','article-references','article-capsules']
    .forEach(id=>{
      if(!document.getElementById(id)){
        const s=document.createElement('section');
        s.id=id; s.className='viewer-block card is-empty';
        if(id==='article-title') s.classList.add('no-card');
        viewerEl.appendChild(s);
      }
    });
}

function setupMenuLinks(menuEl, viewerEl, basePath, paramKey){
  menuEl.querySelectorAll('a[data-viewer]').forEach(link=>{
    link.addEventListener('click',e=>{
      e.preventDefault();
      const file=link.getAttribute('data-viewer'); if(!file) return;
      loadContent(viewerEl, basePath+file+'.html');
      const u=new URL(window.location); u.searchParams.set(paramKey,file);
      window.history.pushState({},'',u);
      menuEl.querySelectorAll('a[data-viewer]').forEach(a=>a.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

function clearForeignChildren(viewerEl){
  const keep=new Set(['article-title','article-media','article-body','article-extras','article-references','article-capsules']);
  Array.from(viewerEl.children).forEach(ch=>{ if(!keep.has(ch.id)) ch.remove(); });
}

// ---------- charge + découpe (NEW + LEGACY)
function loadContent(viewerEl, url){
  fetch(url).then(r=>{ if(!r.ok) throw new Error(url); return r.text(); })
  .then(html=>{
    viewerEl.style.opacity='0';
    clearForeignChildren(viewerEl);

    const doc=new DOMParser().parseFromString(html,'text/html');
    const part = name => doc.querySelector(`[data-part="${name}"]`);

    // --- TITRE + sous-titre (new: section[data-part=title], legacy: h1 + h2)
    const titleSection = part('title') || null;
    const titleNode =
      (titleSection && titleSection.querySelector('h1')) ||
      doc.querySelector('h1');
    const subtitleNode =
      (titleSection && (titleSection.querySelector('h2[data-subtitle], .subtitle'))) ||
      (titleNode && titleNode.nextElementSibling && titleNode.nextElementSibling.matches('h2, .subtitle, [data-subtitle]') ? titleNode.nextElementSibling : null);

    let titleHTML='';
    if(titleNode){
      const raw = (titleNode.innerHTML||'').trim();
      const safe = sanitizeTitleHTML(raw);                 // garde <br> et <wbr>
      const subtitle = subtitleNode ? escapeHTML(subtitleNode.textContent||'') : '';
      titleHTML = `
        <div class="title-chip"><span>${safe}</span></div>
        <div class="title-tools"></div>
        ${subtitle ? `<div class="title-sub">${subtitle}</div>` : '' }
      `;
    }
    setBlockHTML('article-title', titleHTML);

    // --- TOOLS -> dans la bulle du titre
    const toolsEl =
      part('tools') ||
      doc.getElementById('article-tools') ||
      doc.querySelector('.tools');
    let toolsHTML = getInnerIfFilled(toolsEl);
    if(!toolsHTML) toolsHTML = defaultToolsMarkup();
    attachToolsIntoTitle(toolsHTML);
    setupShareButtons();

    // --- MEDIA
    const mediaEl = part('media') || doc.querySelector('.media, .gallery, section[data-gallery]');
    let mediaHTML='';
    if(mediaEl){
      const imgs=[...mediaEl.querySelectorAll('img')].filter(i=>i.getAttribute('src'));
      if(imgs.length){
        const caption=mediaEl.querySelector('figcaption')?.innerHTML||'';
        mediaHTML = renderMosaicHTML(imgs, caption);
      }
    }
    setBlockHTML('article-media', mediaHTML);
    if(mediaHTML) setupGalleryLightbox();

    // ----- BODY + CHAPITRES en cartes --------------------------------------
    removeDynamicChapters(viewerEl);

    let bodyCandidate =
      part('body') ||
      doc.querySelector('.article') ||
      doc.querySelector('article') ||
      doc.querySelector('main > section') ||
      doc.querySelector('section');

    let introHTML = '';
    const introNotesHTML = [];

    if (bodyCandidate) {
      const slices = sliceBodyIntoChaptersRich(bodyCandidate);

      // -- intro : extraire d'éventuelles notes en cartes séparées
      const tmpIntro = document.createElement('div');
      tmpIntro.innerHTML = slices.intro || '';
      const introNotes = Array.from(tmpIntro.querySelectorAll('.codex-note, [data-note], [data-block="note"]'));
      introNotes.forEach(n => n.remove());
      introHTML = (tmpIntro.innerHTML || '').trim();
      introNotes.forEach(n => introNotesHTML.push(n.outerHTML));

      const anchor =
        document.getElementById('article-extras') ||
        document.getElementById('article-references') ||
        document.getElementById('article-capsules') || null;

      // -- chapitres : créer la carte puis extraire les .codex-note
      slices.chapters.forEach(ch => {
        // 1) chapitre “propre”
        const tmp = document.createElement('div');
        tmp.innerHTML = ch.html;
        const noteNodes = Array.from(tmp.querySelectorAll('.codex-note, [data-note], [data-block="note"]'));
        noteNodes.forEach(n => n.remove());
        const contentHTML = (tmp.innerHTML || '').trim();

        const s = document.createElement('section');
        s.className = 'viewer-block card article-chapter chapter-card';
        if (ch.accent) s.style.setProperty('--chap-accent', ch.accent);
        if (ch.id)     s.id = ch.id;

        s.innerHTML = `
          <header class="chapter-header">
            ${ch.icon ? `<span class="chapter-icon">${ch.icon}</span>` : ''}
            <h2 class="chapter-title">
              ${escapeHTML(ch.title)}
              ${ch.id ? `<a class="anchor" href="#${ch.id}">#</a>` : ''}
            </h2>
          </header>
          <div class="chapter-content">
            ${contentHTML}
          </div>
        `;
        viewerEl.insertBefore(s, anchor);

        // 2) notes extraites -> cartes autonomes, juste après le chapitre
        noteNodes.forEach(note => {
          const noteCard = document.createElement('section');
          noteCard.className = 'viewer-block card note-card';
          noteCard.innerHTML = note.outerHTML;
          viewerEl.insertBefore(noteCard, anchor);
        });
      });
    }

    // intro (ou rien si vide)
    setBlockHTML('article-body', introHTML);

    // injecter les notes extraites de l’intro juste après le body
    if (introNotesHTML.length){
      const bodyEl = document.getElementById('article-body');
      const anchor =
        document.getElementById('article-extras') ||
        document.getElementById('article-references') ||
        document.getElementById('article-capsules') || null;
      introNotesHTML.forEach(html => {
        const noteCard = document.createElement('section');
        noteCard.className = 'viewer-block card note-card';
        noteCard.innerHTML = html;
        viewerEl.insertBefore(noteCard, anchor);
      });
    }

    // --- EXTRAS / REF / CAPSULES
    setBlockHTML('article-extras',     getOuterIfFilled(part('extras')     || doc.querySelector('.extras')));
    setBlockHTML('article-references', getOuterIfFilled(part('references') || doc.querySelector('.references, footer.references')));
    setBlockHTML('article-capsules',   getOuterIfFilled(part('capsules')   || doc.querySelector('.capsules')));

    requestAnimationFrame(()=> viewerEl.style.opacity='1');
  })
  .catch(err=>{
    setBlockHTML('article-title','');
    setBlockHTML('article-media','');
    setBlockHTML('article-body', `<p class="erreur">Erreur chargement : ${escapeHTML(String(err))}</p>`);
    setBlockHTML('article-extras',''); setBlockHTML('article-references',''); setBlockHTML('article-capsules','');
    console.error(err);
  });
}

function setBlockHTML(id, html){
  const el=document.getElementById(id); if(!el) return;
  el.innerHTML = html || '';
  const has = !!(html && html.trim());
  el.classList.toggle('is-empty', !has);
  el.setAttribute('aria-hidden', String(!has));
}

// ---------- Tools dans le titre
function attachToolsIntoTitle(html){
  const slot=document.querySelector('#article-title .title-tools'); if(!slot) return;
  slot.innerHTML = html;
  if(!slot.textContent.trim() && !slot.querySelector('*')) slot.remove();
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
    </div>
  `;
}

// helpers
function getInnerIfFilled(node){ if(!node) return ''; const s=(node.innerHTML||'').trim(); return s ? s : ''; }
function getOuterIfFilled(node){ if(!node) return ''; const s=(node.innerHTML||'').trim(); return s ? node.outerHTML : ''; }

// autorise <br> et <wbr> dans le H1, échappe tout le reste
function sanitizeTitleHTML(rawHTML){
  const BR  = '[[BR]]';
  const WBR = '[[WBR]]';
  let s = (rawHTML || '')
    .replace(/<\s*br\s*\/?\s*>/gi, BR)
    .replace(/<\s*wbr\s*\/?\s*>/gi, WBR)
    .replace(/<\/?[^>]+>/g, '');
  const tmp = document.createElement('textarea'); tmp.innerHTML = s;
  s = tmp.value
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  return s.replaceAll(BR, '<br>').replaceAll(WBR, '<wbr>');
}

// ---------- Galerie + lightbox
const galleryState={items:[],index:0};
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
  lb.id='viewer-lightbox'; lb.className='lightbox hidden';
  lb.setAttribute('role','dialog'); lb.setAttribute('aria-modal','true'); lb.setAttribute('aria-hidden','true');
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
function setupGalleryLightbox(){
  const imgs=[...document.querySelectorAll('#article-media .mosaic img')];
  galleryState.items=imgs.map(img=>({src:img.getAttribute('src'),alt:img.getAttribute('alt')||''}));
  imgs.forEach((img,idx)=>{ img.addEventListener('click',()=>openLightbox(idx)); img.style.cursor='zoom-in'; });
}
function openLightbox(i=0){
  galleryState.index=Math.max(0,Math.min(i,galleryState.items.length-1));
  const lb=document.getElementById('viewer-lightbox'); if(!lb) return;
  updateLightboxImage(); lb.classList.remove('hidden'); lb.setAttribute('aria-hidden','false'); document.body.classList.add('no-scroll');
}
function closeLightbox(){
  const lb=document.getElementById('viewer-lightbox'); if(!lb) return;
  lb.classList.add('hidden'); lb.setAttribute('aria-hidden','true'); document.body.classList.remove('no-scroll');
}
function nextImage(){ if(!galleryState.items.length) return; galleryState.index=(galleryState.index+1)%galleryState.items.length; updateLightboxImage(true); }
function prevImage(){ if(!galleryState.items.length) return; galleryState.index=(galleryState.index-1+galleryState.items.length)%galleryState.items.length; updateLightboxImage(true); }
function updateLightboxImage(anim=false){
  const it=galleryState.items[galleryState.index];
  const img=document.getElementById('lb-image'); const cap=document.getElementById('lb-caption'); const cnt=document.querySelector('.lb-counter');
  if(!img) return;
  if(anim){ img.classList.remove('lb-swap'); void img.offsetWidth; img.classList.add('lb-swap'); }
  img.src=it.src; img.alt=it.alt||''; cap.textContent=it.alt||''; cnt.textContent=`${galleryState.index+1} / ${galleryState.items.length}`;
}

// ---------- Chapitres (rich) -----------------------------------------------
function removeDynamicChapters(viewerEl){
  viewerEl.querySelectorAll('.article-chapter, .note-card').forEach(n => n.remove());
}

/* Découpe en chapitres riches :
   - <section data-chapter> : lit data-title / data-icon / data-accent
   - sinon split sur <h2>
   Retourne { intro, chapters:[ { id, title, icon, accent, html } ] } */
function sliceBodyIntoChaptersRich(rootNode){
  const root = rootNode.cloneNode(true);

  // Nettoyage du body
  root.querySelectorAll('section[data-part="title"], #article-tools, script, style, link[rel="stylesheet"]').forEach(n=>n.remove());
  const h1 = root.querySelector('h1');
  if (h1) { const n=h1.nextElementSibling; h1.remove(); if(n && n.matches('h2, .subtitle, [data-subtitle]')) n.remove(); }

  const result = { intro:'', chapters:[] };

  // 1) Sections déclarées
  const declared = Array.from(root.querySelectorAll('section[data-chapter]'));
  if (declared.length){
    // intro = avant la 1re
    const introWrap = document.createElement('div');
    for (let n=root.firstChild; n && n!==declared[0]; n=n.nextSibling) introWrap.appendChild(n.cloneNode(true));
    result.intro = (introWrap.innerHTML||'').trim();

    declared.forEach(sec => {
      const accent = sec.getAttribute('data-accent') || '';
      const icon   = sec.getAttribute('data-icon')   || '';
      const title  = sec.getAttribute('data-title')  || (sec.querySelector('h2')?.textContent?.trim() || 'Chapitre');

      // contenu sans le premier h2 si présent
      const c = sec.cloneNode(true);
      const firstH2 = c.querySelector('h2'); if (firstH2) firstH2.remove();
      const html = (c.innerHTML||'').trim();
      const id = 'chap-' + slugify(title);

      result.chapters.push({ id, title, icon, accent, html });
    });
    return result;
  }

  // 2) Fallback : split par <h2>
  const nodes = Array.from(root.childNodes);
  const introNodes = [];
  let bucket = [];
  let title = null;

  const push = () => {
    if (!bucket.length || !title) return;
    const wrap = document.createElement('div');
    bucket.forEach(n => wrap.appendChild(n));
    const html = (wrap.innerHTML||'').trim();
    result.chapters.push({ id:'chap-'+slugify(title), title, icon:'', accent:'', html });
    bucket = []; title = null;
  };

  let started = false;
  nodes.forEach(n => {
    if (n.nodeType===1 && n.matches('h2')){
      if (started) push();
      started = true;
      title = n.textContent.trim();
    } else {
      (started ? bucket : introNodes).push(n.cloneNode(true));
    }
  });
  push();

  const wrapIntro = document.createElement('div');
  introNodes.forEach(n => wrapIntro.appendChild(n));
  result.intro = (wrapIntro.innerHTML||'').trim();

  return result;
}

function slugify(s){
  return (s||'')
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')  // accents
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}

function escapeHTML(s){ return (s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
