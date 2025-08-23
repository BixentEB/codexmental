// /dashb/modules/hud-panels-init.js
const R = (rel) => new URL(rel, import.meta.url).href;
const BASE = './dashboard/assets/ui/';

const IMG = (set) => ({
  on:  R(`${BASE}dashbblock_${set}a.png`),
  off: R(`${BASE}dashbblock_${set}b.png`)
});

// Insets par type de cadre (ajuste si besoin)
const INSETS = {
  1: '9% 5% 12% 6%',
  3: '9% 6% 12% 7%',
  4: '8% 7% 13% 7%'
};

const MAP = [
  { sel: '#bloc-g1', title: 'Surface',                set: 1, on: true },
  { sel: '#bloc-g2', title: 'Données principales',    set: 3, on: true },
  { sel: '#bloc-g3', title: 'État de terraformation', set: 4, on: true },
  { sel: '#bloc-d1', title: 'Exploration',            set: 4, on: true },
  { sel: '#bloc-d2', title: 'Lunes',                  set: 3, on: true },
  { sel: '#bloc-d3', title: '',                       set: 1, on: true, toggle: false }
];

// ——— helpers
function ensureScreen(host, keepSelectors) {
  let screen = host.querySelector(':scope > .hud-content');
  if (screen) return screen;

  const toKeep = new Set();
  (keepSelectors || []).forEach(sel =>
    host.querySelectorAll(`:scope > ${sel}`).forEach(n => toKeep.add(n))
  );

  screen = document.createElement('div');
  screen.className = 'hud-content';

  const moves = [];
  for (const node of Array.from(host.childNodes)) {
    if (!(node instanceof Element) && !(node instanceof Text)) continue;
    if (toKeep.has(node)) continue;
    moves.push(node);
  }
  moves.forEach(n => screen.appendChild(n));
  host.appendChild(screen);
  return screen;
}
function ensureLed(host) {
  if (!host.querySelector(':scope > .hud-led')) {
    const led = document.createElement('span');
    led.className = 'hud-led'; led.setAttribute('aria-hidden', 'true');
    host.appendChild(led);
  }
}
function ensureTitle(host, text) {
  if (typeof text !== 'string' || text.trim() === '') return;
  let t = host.querySelector(':scope > .hud-title');
  if (!t) {
    t = document.createElement('span');
    t.className = 'hud-title';
    host.appendChild(t);
  }
  t.textContent = text;
}
function bindToggleOnce(host, id) {
  if (host._hudBound) return;
  host._hudBound = true;
  host.addEventListener('click', (e) => {
    if (e.target.closest('a,button,input,select,textarea,label,[role="button"]')) return;
    const onState = host.classList.toggle('is-on');
    host.classList.toggle('is-off', !onState);
    host.setAttribute('aria-pressed', onState ? 'true' : 'false');
    window.dispatchEvent(new CustomEvent('hud:toggle', { detail: { id, on: onState } }));
  });
}

// ——— API (facultatif)
export function updateHudPanel(selectorOrEl, opts = {}) {
  const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!el) return;

  el.classList.remove('widget');         // retire l’ancien chrome
  el.classList.add('hud-panel');

  if ('on' in opts) {
    el.classList.toggle('is-on',  !!opts.on);
    el.classList.toggle('is-off', !opts.on);
    el.setAttribute('aria-pressed', opts.on ? 'true' : 'false');
  }
  if ('title' in opts) ensureTitle(el, opts.title);

  if ('set' in opts && opts.set) {
    const { on, off } = IMG(opts.set);
    el.style.setProperty('--img-on',  `url("${on}")`);
    el.style.setProperty('--img-off', `url("${off}")`);
    const inset = opts.screenInset || INSETS[opts.set];
    if (inset) el.style.setProperty('--screen-inset', inset);
  }
  if (opts.screenInset) el.style.setProperty('--screen-inset', opts.screenInset);

  if (opts.toggle === false) {
    // no-op
  } else {
    bindToggleOnce(el, el.id || el.getAttribute('data-panel-id') || 'hud-panel');
  }

  ensureScreen(el, opts.keepSelectors);
  ensureLed(el);
}

export function applyHudToSixBlocks(customMap) {
  (customMap || MAP).forEach(cfg => {
    const el = document.querySelector(cfg.sel);
    if (!el) return;

    el.classList.remove('widget'); // <-- coupe l’ancien style
    el.classList.add('hud-panel');
    el.classList.toggle('is-on',  !!cfg.on);
    el.classList.toggle('is-off', !cfg.on);
    el.setAttribute('aria-pressed', cfg.on ? 'true' : 'false');

    const { on, off } = IMG(cfg.set);
    el.style.setProperty('--img-on',  `url("${on}")`);
    el.style.setProperty('--img-off', `url("${off}")`);
    el.style.setProperty('--screen-inset', cfg.screenInset || INSETS[cfg.set] || '9% 5% 12% 6%');

    ensureScreen(el, cfg.keepSelectors);
    ensureLed(el);
    ensureTitle(el, cfg.title);

    if (cfg.toggle !== false) bindToggleOnce(el, cfg.sel.replace('#',''));
  });
}

// Auto-run si importé
applyHudToSixBlocks();
