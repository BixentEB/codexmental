// init.js — CÂBLAGE STRICT SANS MODIFIER L'AFFICHAGE
// - Ne change pas le layout ni les couleurs
// - Observes #bloc-g1..d3, synchro chips, tuto, croix (intégrée .radar)
// - Déplace le ship log hors de "Missions" vers une console discrète intégrée
// - Bridge d'événements ULTRA-ROBUSTE : intercepte tout CustomEvent et rebroadcast
// - Prépare #planet-main-viewer / #moon-viewer seulement s'ils manquent

const bus = window.__lab?.bus || document;

/* ============== 0) Patch CSS minimal (pas de layout global) ============== */
(() => {
  if (document.getElementById('hud-style-patch')) return;
  const css = `
  :root{ --hud-text:#d9f3ff; --hud-muted:#89a3b5; }

  /* Croix globale intégrée au cadre principal (.radar), sans cadre/fond */
  main.dashboard .radar{ position:relative; }
  #dash-closeall{
    position:absolute; top:10px; right:10px; z-index:1200;
    background:none; border:0; padding:0;
    color:var(--hud-text); font-weight:800; font-size:22px; line-height:1;
    cursor:pointer; opacity:.65; display:none;
  }
  #dash-closeall.show{ display:block; }
  #dash-closeall:hover{ opacity:1; }

  /* Ship log discret intégré en bas-droite du cadre principal */
  #ship-console{
    position:absolute; right:14px; bottom:12px; width:300px; max-height:24vh;
    font:12px/1.32 ui-monospace,Menlo,Consolas,monospace;
    color:var(--hud-muted); background:transparent !important;
    border:0 !important; box-shadow:none !important;
    border-radius:0 !important; padding:0; margin:0;
    overflow:auto; opacity:.58; pointer-events:none; z-index:1100;
  }

  /* Placeholders purement techniques : jamais visibles */
  .placeholder{ display:none !important; }
  `;
  const style = document.createElement('style');
  style.id = 'hud-style-patch';
  style.textContent = css;
  document.head.appendChild(style);
})();

/* =================== 1) Utils =================== */
const q = (sel) => document.querySelector(sel);
const ensure = (host, sel, mk) => { let el = host?.querySelector(sel); if (!el && host) { el = mk(); host.appendChild(el); } return el; };
const ensureSectionContent = (host) => ensure(host, ':scope > .section-content', () => { const sc=document.createElement('div'); sc.className='section-content'; return sc; });

const hasMeaning = (host) => {
  if (!host) return false;
  const sc = host.querySelector(':scope > .section-content') || host;
  const t = (sc.textContent||'').trim();
  if (!t || /^—+$/.test(t) || t === '— vide —') return false;
  return true;
};
const setOn = (el, on) => { if (!el) return; el.classList.toggle('on', !!on); };

/* =================== 2) Compat DOM attendu par tes modules =================== */
/* G1 : viewer + couches (ajout SEULEMENT si manquant) */
{
  const g1 = q('#bloc-g1');
  if (g1 && !g1.querySelector('#planet-main-viewer')) {
    g1.insertAdjacentHTML('afterbegin', `
      <canvas id="planet-main-viewer" width="300" height="220" data-planet=""></canvas>
      <div class="viewer-controls" style="margin:.35rem 0 .25rem;">
        <label for="layer-select" style="margin-right:.35rem; opacity:.8">🛰️ Couche :</label>
        <select id="layer-select" class="codex-select">
          <option value="surface" selected>Surface</option>
          <option value="cloud">Nuages</option>
          <option value="infrared">Infrarouge</option>
        </select>
      </div>
    `);
  }
}

/* #info-* (select + .section-content) — avec les VRAIES clés data-section */
const mountInfo = (blocSel, infoId, dataSection, selectOptions) => {
  const host = q(blocSel); if (!host) return null;

  let info = host.querySelector(`#${infoId}`);
  if (!info) { info = document.createElement('div'); info.id = infoId; host.appendChild(info); }

  let select = info.querySelector('select[data-section]');
  if (!select) {
    select = document.createElement('select');
    select.className = 'codex-select';
    select.setAttribute('data-section', dataSection); // clé attendue par section-switcher.js
    select.innerHTML = selectOptions.map(o => `<option value="${o.value}" ${o.selected?'selected':''}>${o.label}</option>`).join('');
    const h3 = document.createElement('h3'); h3.appendChild(select); info.appendChild(h3);
  }

  let target = info.querySelector('.section-content');
  if (!target) {
    const maybe = host.querySelector(':scope > .section-content');
    target = maybe || document.createElement('div');
    target.classList.add('section-content'); info.appendChild(target);
  }

  if (!target.textContent.trim()) {
    const ph = document.createElement('div'); ph.className='placeholder'; ph.textContent='— vide —'; target.appendChild(ph);
  }
  return { host, info, select, target };
};

mountInfo('#bloc-g2','info-data','informations',[
  {value:'basic',label:'Données principales',selected:true},
  {value:'composition',label:'Composition'},
  {value:'climat',label:'Climat'}
]);
mountInfo('#bloc-g3','info-colony','colony',[
  {value:'summary',label:'Résumé',selected:true},
  {value:'explanation',label:'Explications'}
]);
mountInfo('#bloc-d1','info-missions','missions',[
  {value:'summary',label:'Exploration',selected:true}
]);
mountInfo('#bloc-d2','info-moons','moons',[
  {value:'summary',label:'Résumé',selected:true},
  {value:'details',label:'Détails'}
]);
ensureSectionContent(q('#bloc-d3')); // viewer Lune

/* Placeholders niv. blocs (techniques, invisibles) */
['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
  const p=q(sel); if(!p) return;
  if(!p.querySelector(':scope > .placeholder')){
    const ph=document.createElement('div'); ph.className='placeholder'; ph.textContent='— vide —'; p.appendChild(ph);
  }
});

/* =================== 3) ON/OFF panels + miroirs + tuto =================== */
const panels = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].map(s=>q(s)).filter(Boolean);
const panelObs = new MutationObserver(()=>panels.forEach(p=>setOn(p,hasMeaning(p))));
panels.forEach(p=>{ setOn(p,hasMeaning(p)); panelObs.observe(p,{childList:true,subtree:true,characterData:true}); });

const chips = {
  tutorial: q('.chip.tutorial'),
  g1: q('.chip.g1'), g2: q('.chip.g2'), g3: q('.chip.g3'),
  d1: q('.chip.d1'), d2: q('.chip.d2'), d3: q('.chip.d3'),
};
let hasUserSelection = false;
chips.tutorial?.classList.add('on');

const cleanCloneHTML = (src) => {
  const node = src.cloneNode(true);
  node.querySelectorAll('.placeholder, .viewer-controls, #planet-main-viewer, #moon-viewer').forEach(n=>n.remove());
  return node.innerHTML.trim();
};
const mirrors = [
  {from:'#bloc-g1',to:'.chip.g1 .hud-text'},
  {from:'#bloc-g2',to:'.chip.g2 .hud-text'},
  {from:'#bloc-g3',to:'.chip.g3 .hud-text'},
  {from:'#bloc-d1',to:'.chip.d1 .hud-text'},
  {from:'#bloc-d2',to:'.chip.d2 .hud-text'},
  {from:'#bloc-d3',to:'.chip.d3 .hud-text'},
];
const applyMirror=(srcSel,dstSel)=>{
  const src=q(srcSel),dst=q(dstSel); if(!src||!dst)return;
  const sc=src.querySelector(':scope > .section-content')||src;
  dst.innerHTML=cleanCloneHTML(sc);
  const chip=dst.closest('.chip');
  if (chip) chip.classList.toggle('on',hasUserSelection&&hasMeaning(src));
  if (chips.tutorial) chips.tutorial.classList.toggle('on',!hasUserSelection);
};
const mirrorObs=new MutationObserver(m=>m.forEach(x=>{const hit=mirrors.find(mi=>x.target.closest(mi.from)); if(hit) applyMirror(hit.from,hit.to);}));
mirrors.forEach(mi=>{const src=q(mi.from); if(!src) return; applyMirror(mi.from,mi.to); mirrorObs.observe(src,{childList:true,subtree:true,characterData:true});});

/* =================== 4) Croix globale (RESET) =================== */
(() => {
  if (q('#dash-closeall')) return;
  const host = q('main.dashboard .radar') || document.body;
  const btn=document.createElement('button');
  btn.id='dash-closeall'; btn.title='Fermer toutes les informations (Reset)'; btn.textContent='×';
  host.appendChild(btn);

  const setCloseVisible = (show) => btn.classList.toggle('show', !!show);

  const resetPanels=()=>{
    ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
      const host=q(sel); if(!host) return;
      const sc=host.querySelector(':scope > .section-content')||host;
      sc.innerHTML='<div class="placeholder">— vide —</div>';
    });
    hasUserSelection=false;
    window.OrbViewer?.clearPlanet?.(); window.OrbViewer?.clearMoon?.();
    chips.tutorial?.classList.add('on');
    setCloseVisible(false);
    mirrors.forEach(mi=>applyMirror(mi.from,mi.to));
    bus.dispatchEvent(new CustomEvent('object:cleared'));
  };

  window.DASH = window.DASH || {};
  window.DASH.resetDashboard = resetPanels;
  window.DASH.setCloseVisible = setCloseVisible;
  btn.addEventListener('click', resetPanels);
})();

/* =================== 5) Ship log intégré + purge Missions =================== */
(() => {
  if (q('#ship-console')) return;
  const host = q('main.dashboard .radar') || q('main.dashboard') || document.body;
  const box=document.createElement('div'); box.id='ship-console'; host.appendChild(box);

  const moved = new Set();
  const push=(txt)=>{ const key=(txt||'').trim(); if(!key||moved.has(key)) return; moved.add(key);
    const row=document.createElement('div'); row.textContent=key; box.appendChild(row);
    while(box.childElementCount>160) box.removeChild(box.firstElementChild);
    box.scrollTop = box.scrollHeight;
  };

  const isShipLine = (txt='') =>
    /^\s*\[\d{1,2}:\d{2}:\d{2}\]/.test(txt) || /^→\s/.test(txt) || /STANDBY|Gyroscope|Évitement|Evitement|Vaisseau/i.test(txt);

  const missionsSC =
    q('#info-missions .section-content') ||
    q('#bloc-d1 .section-content') ||
    q('#bloc-d1');

  if (!missionsSC) return;

  const sweep = () => {
    const walker = document.createTreeWalker(missionsSC, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    const toRemove = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const t = (n.nodeType === 3 ? n.nodeValue : n.textContent) || '';
      if (isShipLine(t)) { push((n.innerText||n.textContent||'').trim()); toRemove.push(n); }
    }
    toRemove.forEach(n => n.parentNode && n.parentNode.removeChild(n));
  };

  sweep();
  new MutationObserver(sweep).observe(missionsSC,{childList:true,subtree:true,characterData:true});
})();

/* =================== 6) Pont d’évènements — interception globale =================== */
/* Ici on NE DEVINE PLUS le nom du bon event.
   On intercepte TOUTES les dispatches de CustomEvent dans la page,
   on reconnait celles qui ressemblent à une sélection, et on rebroadcast
   vers tous les noms attendus (compat maximale). */
(() => {
  const ORIG = EventTarget.prototype.dispatchEvent;
  const seen = new WeakSet();

  const looksLikeSelection = (type, detail) => {
    const tn = String(type||'');
    const hasKey = detail && (detail.id || detail.name || detail.key || detail.planet || detail.body);
    return (
      /planet|body|object|celestial|selected/i.test(tn) ||
      (hasKey && /select|click|picked/i.test(tn))
    );
  };

  const normalize = (detail) => {
    const id = detail?.id || detail?.name || detail?.key || detail?.planet || detail?.body || null;
    const type = (detail?.type || (/moon/i.test(String(detail?.name||'')) ? 'moon' : 'planet')).toLowerCase();
    return { id: id ? String(id).toLowerCase() : null, type, raw: detail || null, ts: Date.now() };
  };

  const rebroadcastAll = (norm) => {
    const names = [
      'object:selected','planet:selected','dashboard:select:planet',
      'simul:planet:click','radar:object:selected','system:body:clicked',
      'body:selected','celestial:selected'
    ];
    names.forEach(n => {
      const ev = new CustomEvent(n, { detail: norm });
      document.dispatchEvent(ev);
      window.dispatchEvent(new CustomEvent(n, { detail: norm }));
    });
  };

  EventTarget.prototype.dispatchEvent = function(ev){
    try{
      if (ev && ev instanceof CustomEvent && !seen.has(ev) && looksLikeSelection(ev.type, ev.detail)) {
        const norm = normalize(ev.detail);
        if (norm.id) {
          hasUserSelection = true;
          window.DASH?.setCloseVisible?.(true);
          rebroadcastAll(norm);
          // Piloter viewers si exposés
          const layer = document.getElementById('layer-select')?.value || 'surface';
          if (norm.type === 'planet') window.OrbViewer?.showPlanet?.(norm.id, layer);
          if (norm.type === 'moon')   window.OrbViewer?.showMoon?.(norm.id);
          mirrors.forEach(mi => applyMirror(mi.from, mi.to));
        }
      }
    } catch(e) { /* silencieux */ }
    return ORIG.call(this, ev);
  };

  // Fallback : écoute aussi les noms "classiques"
  ['object:selected','planet:selected','dashboard:select:planet',
   'simul:planet:click','radar:object:selected','system:body:clicked',
   'body:selected','celestial:selected'
  ].forEach(n=>{
     const on=(e)=>{
       hasUserSelection = true;
       window.DASH?.setCloseVisible?.(true);
       mirrors.forEach(mi => applyMirror(mi.from, mi.to));
     };
     document.addEventListener(n,on,{passive:true});
     window.addEventListener(n,on,{passive:true});
  });

  // Couche
  document.getElementById('layer-select')?.addEventListener('change',(e)=>{
    window.OrbViewer?.setLayer?.(e.target.value);
  });
})();

/* =================== 7) Viewer Lune (bloc D3) =================== */
(() => {
  const d3 = q('#bloc-d3');
  if(d3 && !d3.querySelector('#moon-viewer')){
    const wrap = ensureSectionContent(d3);
    const canvas=document.createElement('canvas');
    canvas.id='moon-viewer'; canvas.width=300; canvas.height=220; wrap.prepend(canvas);
  }
})();
