// /dashb/modules/hud-panels-init.js — auto-state, no click
const R = (rel) => new URL(rel, import.meta.url).href;
const BASE = './dashboard/assets/ui/';
const IMG = (set) => ({ on: R(`${BASE}dashbblock_${set}a.png`), off: R(`${BASE}dashbblock_${set}b.png`) });

const INSETS = { 1:'9% 5% 12% 6%', 3:'9% 6% 12% 7%', 4:'8% 7% 13% 7%' };

const MAP = [
  { sel:'#bloc-g1', title:'Surface', set:1 },
  { sel:'#bloc-g2', title:'Données principales', set:3 },
  { sel:'#bloc-g3', title:'État de terraformation', set:4 },
  { sel:'#bloc-d1', title:'Exploration', set:4 },
  { sel:'#bloc-d2', title:'Lunes', set:3 },
  { sel:'#bloc-d3', title:'', set:1 }
];

function ensureScreen(host){
  let screen = host.querySelector(':scope > .hud-content');
  if (screen) return screen;
  screen = document.createElement('div'); screen.className = 'hud-content';
  const moves = [];
  for (const n of Array.from(host.childNodes)) {
    if (!(n instanceof Element) && !(n instanceof Text)) continue;
    moves.push(n);
  }
  moves.forEach(n => screen.appendChild(n));
  host.appendChild(screen);
  return screen;
}
function ensureLed(h){ if (!h.querySelector(':scope > .hud-led')) { const x=document.createElement('span'); x.className='hud-led'; x.setAttribute('aria-hidden','true'); h.appendChild(x); } }
function ensureTitle(h,t){ if (!t) return; let el=h.querySelector(':scope > .hud-title'); if(!el){el=document.createElement('span'); el.className='hud-title'; h.appendChild(el);} el.textContent=t; }

function hasContent(screen){
  const clone = screen.cloneNode(true);
  clone.querySelectorAll('[data-placeholder]').forEach(n=>n.remove());
  if (clone.querySelector('table,ul,ol,li,canvas,svg,img,.info-row,[data-info]')) return true;
  const txt = (clone.textContent||'').replace(/\s+/g,'');
  return txt.length>0;
}
function refresh(el){
  const screen = el.querySelector(':scope > .hud-content'); if(!screen) return;
  const forced = el.dataset.hudForce; // 'on'|'off'|undefined
  const on = forced==='on' ? true : forced==='off' ? false : hasContent(screen);
  el.classList.toggle('is-on', on);
  el.classList.toggle('is-off', !on);
  el.setAttribute('aria-pressed', on ? 'true' : 'false');
}
function observe(el){
  const screen = el.querySelector(':scope > .hud-content'); if(!screen || el._obs) return;
  el._obs = new MutationObserver(()=>requestAnimationFrame(()=>refresh(el)));
  el._obs.observe(screen,{childList:true,subtree:true,characterData:true});
}

export function applyHudToSixBlocks(map){
  (map||MAP).forEach(cfg=>{
    const el = document.querySelector(cfg.sel); if(!el) return;
    el.classList.remove('widget');             // coupe V1
    el.classList.add('hud-panel');
    const {on,off}=IMG(cfg.set);
    el.style.setProperty('--img-on',  `url("${on}")`);
    el.style.setProperty('--img-off', `url("${off}")`);
    el.style.setProperty('--screen-inset', cfg.screenInset||INSETS[cfg.set]||'9% 5% 12% 6%');

    ensureScreen(el); ensureLed(el); ensureTitle(el,cfg.title);
    refresh(el); observe(el);                  // auto-état, pas de clic
  });
}
applyHudToSixBlocks();
