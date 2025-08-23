// HUD autostate: ON si contenu, OFF sinon — aucun toggle au clic
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

// Mapping (tu peux changer set/title/screenInset)
const MAP = [
  { sel: '#bloc-g1', title: 'Surface',                set: 1 },
  { sel: '#bloc-g2', title: 'Données principales',    set: 3 },
  { sel: '#bloc-g3', title: 'État de terraformation', set: 4 },
  { sel: '#bloc-d1', title: 'Exploration',            set: 4 },
  { sel: '#bloc-d2', title: 'Lunes',                  set: 3 },
  { sel: '#bloc-d3', title: '',                       set: 1 } // viewer 2
];

// ——— helpers DOM
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

// ——— logique d'auto-état
function hasMeaningfulContent(screen) {
  // Ignorer les placeholders marqués
  const clone = screen.cloneNode(true);
  clone.querySelectorAll('[data-placeholder]').forEach(n => n.remove());

  // S'il y a des éléments “structurants” ou du texte non vide → ON
  const structural = clone.querySelector('table, ul, ol, li, canvas, svg, img, .info-row, [data-info]');
  if (structural) return true;

  const txt = (clone.textContent || '').replace(/\s+/g, '');
  return txt.length > 0;
}

function refreshOne(el) {
  const screen = el.querySelector(':scope > .hud-content');
  if (!screen) return;

  // Priorité à un éventuel “forçage” via data-hud-force="on|off"
  const force = el.dataset.hudForce;
  const onState = (force === 'on') ? true : (force === 'off') ? false : hasMeaningfulContent(screen);

  el.classList.toggle('is-on',  onState);
  el.classList.toggle('is-off', !onState);
  el.setAttribute('aria-pressed', onState ? 'true' : 'false');
}

function observeAutoState(el) {
  const screen = el.querySelector(':scope > .hud-content');
  if (!screen || el._hudObserved) return;
  el._hudObserved = true;

  let rafId = null;
  const mo = new MutationObserver(() => {
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => refreshOne(el));
  });
  mo.observe(screen, { childList: true, subtree: true, characterData: true });
  // garder une réf si tu veux mo.disconnect() plus tard
  el._hudMO = mo;
}

// ——— API
export function updateHudPanel(selectorOrEl, opts = {}) {
  const el = typeof selectorOrEl === 'string' ? document.querySelector(selectorOrEl) : selectorOrEl;
  if (!el) return;

  el.classList.remove('widget'); // retire l’ancien chrome
  el.classList.add('hud-panel');

  if ('title' in opts) ensureTitle(el, opts.title);

  if ('set' in opts && opts.set) {
    const { on, off } = IMG(opts.set);
    el.style.setProperty('--img-on',  `url("${on}")`);
    el.style.setProperty('--img-off', `url("${off}")`);
    const inset = opts.screenInset || INSETS[opts.set];
    if (inset) el.style.setProperty('--screen-inset', inset);
  }
  if (opts.screenInset) el.style.setProperty('--screen-inset', opts.screenInset);

  // forcer l’état si demandé: opts.force = 'on'|'off'|null
  if ('force' in opts) {
    if (opts.force === 'on' || opts.force === 'off') el.dataset.hudForce = opts.force;
    else el.removeAttribute('data-hud-force');
  }

  ensureScreen(el, opts.keepSelectors);
  ensureLed(el);

  refreshOne(el);
  observeAutoState(el);
}

export function refreshHudStates() {
  document.querySelectorAll('.hud-panel').forEach(refreshOne);
}

// ——— Entrée principale
export function applyHudToSixBlocks(customMap) {
  (customMap || MAP).forEach(cfg => {
    const el = document.querySelector(cfg.sel);
    if (!el) return;

    el.classList.remove('widget');
    el.classList.add('hud-panel');

    const { on, off } = IMG(cfg.set);
    el.style.setProperty('--img-on',  `url("${on}")`);
    el.style.setProperty('--img-off', `url("${off}")`);
    el.style.setProperty('--screen-inset', cfg.screenInset || INSETS[cfg.set] || '9% 5% 12% 6%');

    ensureScreen(el, cfg.keepSelectors);
    ensureLed(el);
    ensureTitle(el, cfg.title);

    refreshOne(el);       // état initial selon contenu
    observeAutoState(el); // se mettra à jour tout seul
  });
}

// Auto-run si importé
applyHudToSixBlocks();
