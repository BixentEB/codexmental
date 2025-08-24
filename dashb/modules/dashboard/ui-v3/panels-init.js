// /dashb/modules/ui-v3/panels-init.js
const R = rel => new URL(rel, import.meta.url).href;
const BASE = R('/dashb/modules/dashboard/assets/ui/'); // adapte si besoin (chemin depuis ui-v3/)

const IMG = set => ({
  on:  BASE + `dashbblock_${set}a.png`,
  off: BASE + `dashbblock_${set}b.png`,
});

// fenêtre utile par type de cadre
const INSET = { 1:'9% 5% 12% 6%', 3:'9% 6% 12% 7%', 4:'8% 7% 13% 7%' };

// mapping des 6 panels
const MAP = [
  { id:'bloc-g1', title:'Surface',                set:1 },
  { id:'bloc-g2', title:'Données principales',    set:3 },
  { id:'bloc-g3', title:'État de terraformation', set:4 },
  { id:'bloc-d1', title:'Exploration',            set:4 },
  { id:'bloc-d2', title:'Lunes',                  set:3 },
  { id:'bloc-d3', title:'',                       set:1 },
];

function wrap(el){
  // classe .panel + éléments internes
  el.classList.add('panel');
  if (!el.querySelector(':scope > .screen')){
    const scr = document.createElement('div'); scr.className='screen';
    while (el.firstChild) scr.appendChild(el.firstChild);
    el.appendChild(scr);
  }
  if (!el.querySelector(':scope > .title')){
    const t = document.createElement('div'); t.className='title'; el.appendChild(t);
  }
}

function refreshState(el){
  const scr = el.querySelector(':scope > .screen'); if (!scr) return;
  const cloned = scr.cloneNode(true);
  cloned.querySelectorAll('[data-placeholder]').forEach(n=>n.remove());
  const hasStruct = cloned.querySelector('table,ul,ol,li,canvas,svg,img,[data-info],.info-row');
  const text = (cloned.textContent||'').replace(/\s+/g,'');
  const on = !!hasStruct || text.length>0;
  el.classList.toggle('on', on);
  el.classList.toggle('off', !on);
}

export function applyPanels(){
  MAP.forEach(cfg=>{
    const el = document.getElementById(cfg.id);
    if (!el) return;

    wrap(el);

    // images + fenêtre utile
    const {on,off} = IMG(cfg.set);
    el.style.setProperty('--img-on', `url("${on}")`);
    el.style.setProperty('--img-off',`url("${off}")`);
    el.style.setProperty('--inset', cfg.inset || INSET[cfg.set] || '9% 5% 12% 6%');

    // titre
    el.querySelector(':scope > .title').textContent = cfg.title || '';

    // état initial + observer
    refreshState(el);
    const scr = el.querySelector(':scope > .screen');
    const mo = new MutationObserver(()=>requestAnimationFrame(()=>refreshState(el)));
    mo.observe(scr,{childList:true,subtree:true,characterData:true});
  });
}

// auto-run
applyPanels();
