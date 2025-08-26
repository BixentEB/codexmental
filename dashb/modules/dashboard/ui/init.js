// init.js — HUD glue: compat DOM (#info-*), style HUD (injection),
// miroir blocs→chips, tuto (ne disparaît qu’après sélection), close-all global (caché tant qu’il n’y a pas de sélection),
// mini-console vaisseau discrète (intégrée) + purge des lignes Missions,
// pont d’événements (normalisation + rebroadcast) → modules + viewer.

const bus = window.__lab?.bus || document;

/* ============== 0) Patch CSS HUD (injection, non destructif) ============== */
(() => {
  if (document.getElementById('hud-style-patch')) return;
  const css = `
  :root{
    --hud-cyan:#6fffff;--hud-cyan-soft:rgba(111,255,255,.25);
    --hud-bg:rgba(5,20,35,.42);--hud-border:rgba(111,255,255,.18);
    --hud-text:#d9f3ff;--hud-muted:#89a3b5;
  }
  .codex-select{
    appearance:none;-webkit-appearance:none;-moz-appearance:none;
    background:var(--hud-bg);border:1px solid var(--hud-border);
    color:var(--hud-text);padding:.35rem 1.75rem .35rem .55rem;
    border-radius:.6rem;font-size:.92rem;line-height:1.2;
    box-shadow:inset 0 0 0 1px rgba(255,255,255,.04);
  }
  .codex-select:focus{outline:none;box-shadow:0 0 0 2px var(--hud-cyan-soft);}

  /* Close-all global : intégré AU CADRE PRINCIPAL (.radar), sans cadre/fond, caché par défaut */
  main.dashboard .radar{ position:relative; }
  #dash-closeall{
    position:absolute; top:10px; right:10px; z-index:1200;
    background:none; border:0; padding:0;
    color:var(--hud-text); font-weight:800; font-size:22px; line-height:1;
    cursor:pointer; opacity:.65; display:none;
  }
  #dash-closeall.show{ display:block; }
  #dash-closeall:hover{ opacity:1; }

  /* Mini-console vaisseau (intégrée au dashboard, fond transparent, discrète) */
  #ship-console{
    position:absolute; right:14px; bottom:12px; width:300px; max-height:24vh;
    font:12px/1.32 ui-monospace,Menlo,Consolas,monospace;
    color:var(--hud-muted);
    background:transparent !important; border:0 !important; box-shadow:none !important;
    border-radius:0 !important; padding:0; margin:0;
    overflow:auto; opacity:.58; pointer-events:none; z-index:1100;
  }
  #ship-console .hdr{ display:none; } /* pas d’en-tête visible */

  /* Viewers si présents */
  #planet-main-viewer,#moon-viewer{
    display:block;width:100%;height:220px;background:rgba(255,255,255,.02);
    border-radius:.6rem;
  }

  /* Placeholders purement techniques : jamais visibles */
  .placeholder{ display:none !important; color:var(--hud-muted); opacity:.0 }
  `;
  const style=document.createElement('style');
  style.id='hud-style-patch'; style.textContent=css; document.head.appendChild(style);
})();

/* =================== 1) utilitaires =================== */
const ensure = (host, sel, mk) => { let el = host?.querySelector(sel); if (!el && host) { el = mk(); host.appendChild(el); } return el; };
const ensureSectionContent = (host) => ensure(host, ':scope > .section-content', () => { const sc=document.createElement('div'); sc.className='section-content'; return sc; });

const hasMeaning = (host) => {
  if (!host) return false;
  const sc = host.querySelector(':scope > .section-content') || host;
  const t = (sc.textContent||'').trim();
  // Considère vide s'il n'y a que des tirets ou rien
  if (!t || /^—+$/.test(t)) return false;
  return t !== '— vide —';
};
const setOn = (el,on) => {
  if (!el) return;
  el.classList.toggle('on', !!on);
  const ph = el.querySelector('.placeholder'); if (ph) ph.style.display = 'none'; // toujours caché
};

/* =================== 2) Compat DOM attendu par tes modules =================== */
/* G1 : viewer + couches */
{
  const g1 = document.querySelector('#bloc-g1');
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
  const host = document.querySelector(blocSel);
  if (!host) return null;

  let info = host.querySelector(`#${infoId}`);
  if (!info) { info = document.createElement('div'); info.id = infoId; host.appendChild(info); }

  let select = info.querySelector('select[data-section]');
  if (!select) {
    select = document.createElement('select');
    select.className = 'codex-select';
    select.setAttribute('data-section', dataSection); // << clé attendue par section-switcher.js
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

/* Installe les 4 conteneurs aux bons IDs/valeurs + CLEFS */
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
ensureSectionContent(document.querySelector('#bloc-d3')); // viewer Lune

/* Placeholders niveau blocs */
['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
  const p=document.querySelector(sel); if(!p) return;
  if(!p.querySelector(':scope > .placeholder')){
    const ph=document.createElement('div'); ph.className='placeholder'; ph.textContent='— vide —'; p.appendChild(ph);
  }
});

/* =================== 3) ON/OFF panels + miroir chips + tuto =================== */
const panels = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].map(s=>document.querySelector(s)).filter(Boolean);
const panelObs = new MutationObserver(()=>panels.forEach(p=>setOn(p,hasMeaning(p))));
panels.forEach(p=>{ setOn(p,hasMeaning(p)); panelObs.observe(p,{childList:true,subtree:true,characterData:true}); });

const chips = {
  tutorial: document.querySelector('.chip.tutorial'),
  g1: document.querySelector('.chip.g1'),
  g2: document.querySelector('.chip.g2'),
  g3: document.querySelector('.chip.g3'),
  d1: document.querySelector('.chip.d1'),
  d2: document.querySelector('.chip.d2'),
  d3: document.querySelector('.chip.d3'),
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
  const src=document.querySelector(srcSel),dst=document.querySelector(dstSel); if(!src||!dst)return;
  const sc=src.querySelector(':scope > .section-content')||src;
  dst.innerHTML=cleanCloneHTML(sc);
  const chip=dst.closest('.chip');
  if (chip) chip.classList.toggle('on',hasUserSelection&&hasMeaning(src));
  if (chips.tutorial) chips.tutorial.classList.toggle('on',!hasUserSelection);
};
const mirrorObs=new MutationObserver(m=>m.forEach(x=>{const hit=mirrors.find(mi=>x.target.closest(mi.from)); if(hit) applyMirror(hit.from,hit.to);}));
mirrors.forEach(mi=>{const src=document.querySelector(mi.from); if(!src) return; applyMirror(mi.from,mi.to); mirrorObs.observe(src,{childList:true,subtree:true,characterData:true});});

/* =================== 4) Close-all global (une seule croix, visible après sélection) =================== */
(() => {
  if (document.getElementById('dash-closeall')) return;

  // 👇 On ajoute la croix à l’intérieur du cadre principal (.radar)
  const host = document.querySelector('main.dashboard .radar') || document.body;
  const btn=document.createElement('button');
  btn.id='dash-closeall'; btn.title='Fermer toutes les informations (Reset)';
  btn.textContent='×';
  host.appendChild(btn);

  const setCloseVisible = (show) => btn.classList.toggle('show', !!show);

  const resetPanels=()=>{
    ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
      const host=document.querySelector(sel); if(!host) return;
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

  // Expose helpers pour d’autres modules si besoin
  window.DASH = window.DASH || {};
  window.DASH.resetDashboard = resetPanels;
  window.DASH.setCloseVisible = setCloseVisible;

  btn.addEventListener('click', resetPanels);
})();

/* =================== 5) Mini-console vaisseau (intégrée) + purge Missions =================== */
(() => {
  if (document.getElementById('ship-console')) return;

  // 👇 Ship log dans le CADRE PRINCIPAL (bas-droite)
  const dash = document.querySelector('main.dashboard .radar') || document.querySelector('main.dashboard') || document.body;
  const box=document.createElement('div'); box.id='ship-console';
  // pas de header visible
  box.innerHTML='';
  dash.appendChild(box);

  const moved = new Set(); // éviter doublons

  const push=(msg)=>{
    const key = msg.trim();
    if (moved.has(key)) return;
    moved.add(key);
    const row=document.createElement('div'); row.textContent=msg;
    box.appendChild(row);
    while(box.children.length>160) box.removeChild(box.children[0]); // cap
    box.scrollTop=box.scrollHeight;
  };

  const isShipLine = (txt) => {
    const t = txt.trim();
    return (
      /^\[\d{1,2}:\d{2}:\d{2}\]/.test(t) ||                // [HH:MM:SS]
      /^→\s/.test(t) ||                                    // → ...
      /STANDBY|Gyroscope|Évitement|Evitement|Vaisseau/i.test(t)
    );
  };

  const missionsSC = document.querySelector('#info-missions .section-content');
  if (!missionsSC) return;

  const sweep = () => {
    const walker = document.createTreeWalker(missionsSC, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    const toRemove = [];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const text = (n.nodeType === 3) ? n.nodeValue : n.textContent;
      if (!text) continue;
      if (isShipLine(text)) {
        push((n.innerText||n.textContent||'').trim());
        toRemove.push(n);
        const sib = n.nextSibling;
        if (sib && (sib.textContent||'').trim().startsWith('→')) {
          push(sib.textContent.trim());
          toRemove.push(sib);
        }
      }
    }
    toRemove.forEach(n => n.parentNode && n.parentNode.removeChild(n));
  };

  sweep();
  const mo=new MutationObserver(() => sweep());
  mo.observe(missionsSC,{childList:true,subtree:true,characterData:true});
})();

/* =================== 6) Pont d’évènements — NORMALISATION + REBROADCAST =================== */
(() => {
  const CANDIDATES = [
    'object:selected','planet:selected','dashboard:select:planet',
    'simul:planet:click','radar:object:selected','system:body:clicked',
    'body:selected','celestial:selected'
  ];

  const normalize = (detail) => {
    const id = detail?.id || detail?.name || detail?.key || detail?.planet || detail?.body || null;
    const type = (detail?.type || 'planet').toLowerCase();
    return { id: id ? String(id).toLowerCase() : null, type, raw: detail || null, ts: Date.now() };
  };

  const rebroadcast = (evtName, detail) => {
    const ev = new CustomEvent(evtName, { detail, bubbles: true });
    document.dispatchEvent(ev);
    window.dispatchEvent(new CustomEvent(evtName, { detail }));
  };

  const onAnySelect = (srcName) => (e) => {
    const norm = normalize(e.detail);
    if (!norm.id) return; // rien d’exploitable
    hasUserSelection = true;

    // Afficher la croix globale
    window.DASH?.setCloseVisible?.(true);

    // Rebroadcast pour compat modules “métier”
    if (srcName !== 'object:selected') rebroadcast('object:selected', norm);
    if (norm.type === 'planet') rebroadcast('planet:selected', norm);

    // Piloter le viewer si dispo
    const layer = document.getElementById('layer-select')?.value || 'surface';
    if (norm.type === 'planet') window.OrbViewer?.showPlanet?.(norm.id, layer);
    if (norm.type === 'moon' || /moon/i.test(srcName)) window.OrbViewer?.showMoon?.(norm.id);

    // Mettre à jour chips/tuto
    mirrors.forEach(mi => applyMirror(mi.from, mi.to));
  };

  CANDIDATES.forEach(n => {
    document.addEventListener(n, onAnySelect(n), { passive:true });
    window.addEventListener(n, onAnySelect(n), { passive:true });
  });

  // Changement de couche
  document.getElementById('layer-select')?.addEventListener('change',(e)=>{
    window.OrbViewer?.setLayer?.(e.target.value);
  });

  // Heuristique Lunes: si le bloc change et expose un data-moon / ou texte “Lune …”
  const moonsSC = document.querySelector('#info-moons .section-content');
  if (moonsSC) {
    const mo = new MutationObserver(() => {
      const attr = moonsSC.querySelector('[data-moon]')?.getAttribute('data-moon');
      let id = (attr||'').toLowerCase();
      if (!id) {
        const t = (moonsSC.textContent||'').toLowerCase();
        if (/\blune\b/.test(t)) id = 'moon';
      }
      if (id) {
        hasUserSelection = true;
        window.DASH?.setCloseVisible?.(true);
        window.OrbViewer?.showMoon?.(id);
        mirrors.forEach(mi => applyMirror(mi.from, mi.to));
      }
    });
    mo.observe(moonsSC,{childList:true,subtree:true,characterData:true});
  }
})();

/* =================== 7) Prépare le viewer Lune (bloc D3) =================== */
(() => {
  const d3=document.querySelector('#bloc-d3');
  if(d3 && !d3.querySelector('#moon-viewer')){
    const wrap = ensureSectionContent(d3);
    const canvas=document.createElement('canvas'); canvas.id='moon-viewer'; canvas.width=300; canvas.height=220; wrap.prepend(canvas);
  }
})();
