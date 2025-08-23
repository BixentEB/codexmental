// /dashb/modules/hud-panels-init.js  (version robuste + insets par cadre)
const R = (rel) => new URL(rel, import.meta.url).href;
const BASE = './dashboard/assets/ui/';

const IMG = (set) => ({
  on:  R(`${BASE}dashbblock_${set}a.png`),
  off: R(`${BASE}dashbblock_${set}b.png`)
});

// Insets par type de cadre (affine si besoin)
const INSETS = {
  1: '9% 5% 12% 6%',
  3: '9% 6% 12% 7%',
  4: '8% 7% 13% 7%'
};

// Mapping (tu peux changer set/title/on/toggle/screenInset/keepSelectors)
const MAP = [
  { sel: '#bloc-g1', title: 'Surface',                set: 1, on: true },
  { sel: '#bloc-g2', title: 'Données principales',    set: 3, on: true },
  { sel: '#bloc-g3', title: 'État de terraformation', set: 4, on: true },
  { sel: '#bloc-d1', title: 'Exploration',            set: 4, on: true },
  { sel: '#bloc-d2', title: 'Lunes',                  set: 3, on: true },
  { sel: '#bloc-d3', title: '',                       set: 1, on: true, toggle: false } // viewer 2
];

// ——— Helpers idempotents
function ensureScreen(host, keepSelectors) {
  // Si déjà présent -> OK
  let screen = host.querySelector(':scope > .hud-content');
  if (screen) return screen;

  // Détermine les enfants à déplacer (on peut protéger certains sélecteurs)
  const toKeep = new Set();
  (keepSelectors || []).forEach(sel =>
    host.querySelectorAll(`:scope > ${sel}`).forEach(n => toKeep.add(n))
  );

  screen = document.createElement('div');
  screen.className = 'hud-content';

  // Déplacer seulement ce qui n'est pas "kept"
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
  // Autorise title vide -> pas d’élément
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

// ——— API utilitaires
export function updateHudPanel(selectorOrEl, opts = {}) {
  const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!el) return;

  if (!el.classList.contains('hud-panel')) el.classList.add('hud-panel');

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
  if ('screenInset' in opts && opts.screenInset) {
    el.style.setProperty('--screen-inset', opts.screenInset);
  }

  if (opts.toggle === false) {
    // pas de toggle
  } else if (opts.toggle === true || typeof opts.toggle === 'undefined') {
    bindToggleOnce(el, el.id || el.getAttribute('data-panel-id') || 'hud-panel');
  }

  // Assure écran/led au besoin
  ensureScreen(el, opts.keepSelectors);
  ensureLed(el);
}

export function getHudState(selectorOrEl) {
  const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!el) return null;
  return {
    on: el.classList.contains('is-on'),
    title: el.querySelector(':scope > .hud-title')?.textContent || '',
    screenInset: getComputedStyle(el).getPropertyValue('--screen-inset').trim(),
  };
}

// ——— Entrée principale
export function applyHudToSixBlocks(customMap) {
  (customMap || MAP).forEach(cfg => {
    const el = document.querySelector(cfg.sel);
    if (!el) return;

    // Images + inset + état + a11y
    const { on, off } = IMG(cfg.set);
    el.style.setProperty('--img-on',  `url("${on}")`);
    el.style.setProperty('--img-off', `url("${off}")`);
    el.style.setProperty('--screen-inset', cfg.screenInset || INSETS[cfg.set] || '9% 5% 12% 6%');

    el.classList.add('hud-panel');
    el.classList.toggle('is-on',  !!cfg.on);
    el.classList.toggle('is-off', !cfg.on);
    el.setAttribute('aria-pressed', cfg.on ? 'true' : 'false');

    // Écran + LED + titre
    ensureScreen(el, cfg.keepSelectors);
    ensureLed(el);
    ensureTitle(el, cfg.title);

    // Toggle si autorisé
    if (cfg.toggle !== false) bindToggleOnce(el, cfg.sel.replace('#',''));
  });
}

// Auto-run si importé
applyHudToSixBlocks();
