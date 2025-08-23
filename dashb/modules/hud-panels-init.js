// /dashb/modules/hud-panels-init.js  (version robuste)
const R = (rel) => new URL(rel, import.meta.url).href;
const BASE = './dashboard/assets/ui/';

const IMG = (set) => ({
  on:  R(`${BASE}dashbblock_${set}a.png`),
  off: R(`${BASE}dashbblock_${set}b.png`)
});

// Mapping (tu peux changer les sets/titres ; toggle:false = pas de clic)
const MAP = [
  { sel: '#bloc-g1', title: 'Surface',                set: 1, on: true },
  { sel: '#bloc-g2', title: 'Données principales',    set: 3, on: true },
  { sel: '#bloc-g3', title: 'État de terraformation', set: 4, on: true },
  { sel: '#bloc-d1', title: 'Exploration',            set: 4, on: true },
  { sel: '#bloc-d2', title: 'Lunes',                  set: 3, on: true },
  { sel: '#bloc-d3', title: '',                       set: 1, on: true, toggle: false } // viewer 2
];

// ——— Helpers idempotents
function ensureScreen(host){
  let content = host.querySelector(':scope > .hud-content');
  if (!content) {
    content = document.createElement('div');
    content.className = 'hud-content';
    while (host.firstChild) content.appendChild(host.firstChild);
    host.appendChild(content);
  }
  return content;
}
function ensureLed(host){
  if (!host.querySelector(':scope > .hud-led')) {
    const led = document.createElement('span');
    led.className = 'hud-led'; led.setAttribute('aria-hidden', 'true');
    host.appendChild(led);
  }
}
function ensureTitle(host, text){
  if (!text) return;
  let t = host.querySelector(':scope > .hud-title');
  if (!t) {
    t = document.createElement('span');
    t.className = 'hud-title';
    host.appendChild(t);
  }
  t.textContent = text;
}
function bindToggleOnce(host, id){
  if (host._hudBound) return;
  host._hudBound = true;
  host.addEventListener('click', (e) => {
    if (e.target.closest('a,button,input,select,textarea')) return;
    const onState = host.classList.toggle('is-on');
    host.classList.toggle('is-off', !onState);
    host.setAttribute('aria-pressed', onState ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('hud:toggle', { detail: { id, on: onState } }));
  });
}

// ——— Entrée principale
export function applyHudToSixBlocks(customMap){
  (customMap || MAP).forEach(cfg => {
    const el = document.querySelector(cfg.sel);
    if (!el) return;

    el.classList.add('hud-panel');
    el.classList.toggle('is-on',  !!cfg.on);
    el.classList.toggle('is-off', !cfg.on);
    el.setAttribute('aria-pressed', cfg.on ? 'true' : 'false');

    const { on, off } = IMG(cfg.set);
    el.style.setProperty('--img-on',  `url("${on}")`);
    el.style.setProperty('--img-off', `url("${off}")`);

    ensureScreen(el);
    ensureLed(el);
    ensureTitle(el, cfg.title);

    if (cfg.toggle !== false) {
      bindToggleOnce(el, cfg.sel.replace('#',''));
    }
  });
}

// Auto-run si importé
applyHudToSixBlocks();
