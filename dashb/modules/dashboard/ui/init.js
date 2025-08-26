// init.js — HUD glue: compat DOM (#info-*), style HUD (injection),
// miroir blocs→chips, tuto (ne disparaît qu’après clic), close-all global,
// mini-console vaisseau discrète, pont d’événements → viewer 3D.

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
  /* Close-all global */
  #dash-closeall{
    position:fixed;top:82px;right:22px;z-index:4500;
    width:40px;height:40px;border:1px solid var(--hud-border);
    border-radius:10px;background:rgba(255,255,255,.06);
    color:var(--hud-text);font-weight:800;line-height:38px;text-align:center;
    cursor:pointer;opacity:.7;transition:.15s; backdrop-filter: blur(2px);
  }
  #dash-closeall:hover{opacity:1;box-shadow:0 0 0 2px var(--hud-cyan-soft);}
  /* Mini-console vaisseau (discrète) */
  #ship-console{
    position:fixed;right:16px;bottom:14px;width:320px;max-height:28vh;
    font:12px/1.3 ui-monospace,Menlo,Consolas,monospace;color:var(--hud-muted);
    background:rgba(5,20,35,.25);border:1px solid var(--hud-border);
    border-radius:12px;padding:.4rem .55rem;backdrop-filter:blur(2px);
    overflow:auto;opacity:.78;pointer-events:none;z-index:4200;
  }
  #ship-console h4{margin:.15rem 0 .35rem;font:600 12px/1.2 system-ui;color:var(--hud-text);opacity:.85}
  #planet-main-viewer,#moon-viewer{
    display:block;width:100%;height:220px;background:rgba(255,255,255,.02);
    border-radius:.6rem;
  }
  .placeholder{color:var(--hud-muted);opacity:.7}
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
  return !!t && t !== '— vide —';
};
const setOn = (el,on) => {
  if (!el) return;
  el.classList.toggle('on', !!on);
  const ph = el.querySelector('.placeholder'); if (ph) ph.style.display = on ? 'none' : 'flex';
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

/* #info-* (select + .section-content) */
const mountInfo = (blocSel, infoId, selectOptions) => {
  const host = document.querySelector(blocSel);
  if (!host) return null;

  let info = host.querySelector(`#${infoId}`);
  if (!info) { info = document.createElement('div'); info.id = infoId; host.appendChild(info); }

  let select = info.querySelector('select[data-section]');
  if (!select) {
    select = document.createElement('select');
    select.className = 'codex-select';
    select.setAttribute('data-section', infoId);
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

/* Installe les 4 conteneurs aux bons IDs/valeurs */
mountInfo('#bloc-g2','info-data',[
  {value:'basic',label:'Données principales',selected:true},
  {value:'composition',label:'Composition'},
  {value:'climat',label:'Climat'}
]);
mountInfo('#bloc-g3','info-colony',[
  {value:'summary',label:'Résumé',selected:true},
  {value:'explanation',label:'Explications'}
]);
mountInfo('#bloc-d1','info-missions',[
  {value:'summary',label:'Exploration',selected:true}
]);
mountInfo('#bloc-d2','info-moons',[
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
const chipList = Object.values(chips).filter(Boolean);
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
  if(chip) chip.classList.toggle('on',hasUserSelection&&hasMeaning(src));
  if(chips.tutorial) chips.tutorial.classList.toggle('on',!hasUserSelection);
};
const mirrorObs=new MutationObserver(m=>m.forEach(x=>{const hit=mirrors.find(mi=>x.target.closest(mi.from)); if(hit) applyMirror(hit.from,hit.to);}));
mirrors.forEach(mi=>{const src=document.querySelector(mi.from); if(!src) return; applyMirror(mi.from,mi.to); mirrorObs.observe(src,{childList:true,subtree:true,characterData:true});});

document.getElementById('simul-system')?.addEventListener('click',()=>{ hasUserSelection=true; mirrors.forEach(mi=>applyMirror(mi.from,mi.to)); });

/* =================== 4) Close-all global (une seule croix) =================== */
(() => {
  if (document.getElementById('dash-closeall')) return;
  const btn=document.createElement('button');
  btn.id='dash-closeall'; btn.title='Fermer toutes les informations (Reset)';
  btn.textContent='×';
  document.body.appendChild(btn);

  const resetPanels=()=>{
    ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
      const host=document.querySelector(sel); if(!host) return;
      const sc=host.querySelector(':scope > .section-content')||host;
      sc.innerHTML='<div class="placeholder">— vide —</div>';
    });
    hasUserSelection=false;
    window.OrbViewer?.clearPlanet?.(); window.OrbViewer?.clearMoon?.();
    chips.tutorial?.classList.add('on');
    mirrors.forEach(mi=>applyMirror(mi.from,mi.to));
    bus.dispatchEvent(new CustomEvent('object:cleared'));
  };
  btn.addEventListener('click', resetPanels);
})();

/* =================== 5) Mini-console vaisseau (déport logs) =================== */
(() => {
  if (document.getElementById('ship-console')) return;
  const box=document.createElement('div'); box.id='ship-console'; box.innerHTML='<h4>SHIP LOG</h4>';
  document.body.appendChild(box);
  const push=(msg)=>{const row=document.createElement('div');row.className='row';row.textContent=msg;box.appendChild(row);while(box.children.length>1+60)box.removeChild(box.children[1]);box.scrollTop=box.scrollHeight;};
  const isShipLog=(text)=>/^\s*\[\d{1,2}:\d{2}:\d{2}\]/.test(text)||/Vaisseau|STANDBY|Gyroscope|évitem/i.test(text);
  const missions=document.querySelector('#info-missions .section-content'); if(!missions) return;
  const moveExisting=()=>{[...missions.childNodes].forEach(n=>{const t=(n.textContent||'').trim(); if(t&&isShipLog(t)){n.remove();push(t);}});};
  moveExisting(); const mo=new MutationObserver(moveExisting); mo.observe(missions,{childList:true,subtree:true,characterData:true});
})();

/* =================== 6) Pont d’évènements → viewer 3D =================== */
(() => {
  const CANDIDATES=[
    'object:selected','planet:selected','dashboard:select:planet',
    'simul:planet:click','radar:object:selected','system:body:clicked',
    'body:selected','celestial:selected'
  ];
  const normalize=(d)=>{const id=d?.id||d?.name||d?.key||d?.planet||d?.body||null; const type=(d?.type||'planet').toLowerCase(); return { id:(id||'').toLowerCase(), type };};
  const onPick=(name)=>(e)=>{ hasUserSelection=true; const {id,type}=normalize(e.detail||{}); const layer=document.getElementById('layer-select')?.value||'surface';
    if(type==='planet'||!type){ window.OrbViewer?.showPlanet?.(id,layer); }
    if(type==='moon'||name.includes('moon')){ window.OrbViewer?.showMoon?.(id); }
    mirrors.forEach(mi=>applyMirror(mi.from,mi.to));
  };
  CANDIDATES.forEach(n=>{ document.addEventListener(n,onPick(n),{passive:true}); window.addEventListener(n,onPick(n),{passive:true}); });
  document.getElementById('layer-select')?.addEventListener('change',(e)=>{ window.OrbViewer?.setLayer?.(e.target.value); });
  const moonsSC=document.querySelector('#info-moons .section-content');
  if(moonsSC){
    const mo=new MutationObserver(()=>{ const attr=moonsSC.querySelector('[data-moon]')?.getAttribute('data-moon'); let id=(attr||'').toLowerCase();
      if(!id){ const t=(moonsSC.textContent||'').toLowerCase(); if(/\blune\b/.test(t)) id='moon'; }
      if(id){ hasUserSelection=true; window.OrbViewer?.showMoon?.(id); mirrors.forEach(mi=>applyMirror(mi.from,mi.to)); }
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
