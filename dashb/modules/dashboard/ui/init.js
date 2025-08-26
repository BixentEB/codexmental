// init.js — Compat DOM (anciens blocs), miroir #bloc-* → chips, pont d’événements,
// et logique correcte: tuto ON tant qu'il n'y a pas de sélection.

const bus = window.__lab?.bus || document;

/* ============= helpers ============= */
const ensureSectionContent = (host) => {
  if (!host) return null;
  let sc = host.querySelector(':scope > .section-content');
  if (!sc) {
    sc = document.createElement('div');
    sc.className = 'section-content';
    host.appendChild(sc);
  }
  return sc;
};

// retire du HTML tout ce qui est auxiliaire (placeholders, viewer controls, canvas)
const STRIP_SELECTORS = '.placeholder, .viewer-controls, #planet-main-viewer';
const cleanHTML = (node) => {
  const clone = node.cloneNode(true);
  clone.querySelectorAll(STRIP_SELECTORS).forEach(el => el.remove());
  return clone.innerHTML.trim();
};

const hasContent = (el) => {
  if (!el) return false;
  const tmp = el.cloneNode(true);
  tmp.querySelectorAll(STRIP_SELECTORS).forEach(n => n.remove());
  const text = (tmp.textContent || '').trim();
  const child = tmp.querySelector(':scope > *');
  return (text.length > 0) || !!child;
};

const setState = (el,on) => {
  if (!el) return;
  el.classList.toggle('on', !!on);
  const ph = el.querySelector('.placeholder');
  if (ph) ph.style.display = on ? 'none' : 'flex';
};

/* ============= 0) compat DOM attendu par tes modules ============= */
// G1 : viewer + couche (uniquement si absent)
{
  const g1 = document.querySelector('#bloc-g1');
  if (g1 && !g1.querySelector('#planet-main-viewer')) {
    g1.insertAdjacentHTML('beforeend', `
      <canvas id="planet-main-viewer" width="150" height="150" data-planet=""></canvas>
      <div class="viewer-controls">
        <label for="layer-select">🛰️ Couche :</label>
        <select id="layer-select" class="codex-select">
          <option value="surface" selected>Surface</option>
          <option value="cloud">Nuages</option>
          <option value="infrared">Infrarouge</option>
        </select>
      </div>
    `);
  }
}

// G2..D3 : selects + section-content si manquants
const ensureBlock = (sel, dataSection, options) => {
  const host = document.querySelector(sel);
  if (!host) return;
  if (!host.querySelector('select[data-section]')) {
    const opts = options.map(o => `<option value="${o.value}" ${o.selected?'selected':''}>${o.label}</option>`).join('');
    host.insertAdjacentHTML('afterbegin', `
      <h3>
        <select data-section="${dataSection}" class="codex-select">${opts}</select>
      </h3>
    `);
  }
  ensureSectionContent(host);
};
ensureBlock('#bloc-g2', 'informations', [
  {value:'basic', label:'Données principales', selected:true},
  {value:'composition', label:'Composition'},
  {value:'climat', label:'Climat'},
]);
ensureBlock('#bloc-g3', 'colony', [
  {value:'colonization', label:'État de terraformation', selected:true},
  {value:'potentials', label:'Potentiels'},
  {value:'phases', label:'Phases'},
  {value:'bases', label:'Implantations'},
]);
ensureBlock('#bloc-d1', 'missions', [
  {value:'summary', label:'Exploration', selected:true},
]);
ensureBlock('#bloc-d2', 'moons', [
  {value:'summary', label:'Lunes', selected:true},
  {value:'details', label:'Détails'},
]);
ensureSectionContent(document.querySelector('#bloc-d3'));

// Placeholders pour l'état OFF
['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
  const p = document.querySelector(sel);
  if (p && !p.querySelector('.placeholder')) {
    const ph = document.createElement('div');
    ph.className = 'placeholder';
    ph.textContent = '— vide —';
    p.appendChild(ph);
  }
});

/* ============= 1) panels ON/OFF (compat) ============= */
const panelEls = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3']
  .map(sel => document.querySelector(sel)).filter(Boolean);

const panelObs = new MutationObserver(() =>
  panelEls.forEach(p => setState(p, hasContent(p)))
);
panelEls.forEach(p => {
  setState(p, hasContent(p));
  panelObs.observe(p, { childList:true, subtree:true, characterData:true });
});

/* ============= 2) chips + miroir (#bloc-* → chips) ============= */
const chips = {
  tutorial: document.querySelector('.chip.tutorial'),
  g1: document.querySelector('.chip.g1'),  // Planète
  g2: document.querySelector('.chip.g2'),  // Informations
  g3: document.querySelector('.chip.g3'),  // Terraformation
  d1: document.querySelector('.chip.d1'),  // Missions
  d2: document.querySelector('.chip.d2'),  // Lunes
  d3: document.querySelector('.chip.d3'),  // Viewer secondaire/Logs
};
const chipList = Object.values(chips).filter(Boolean);
const hudRoot = document.querySelector('.hud-chips') || document;

// baseline: tout OFF sauf tuto
chipList.forEach(ch => { if (ch && !ch.classList.contains('tutorial')) ch.classList.remove('on'); });
chips.tutorial?.classList.add('on');

// Flag "une sélection est active"
let hasSelection = false;

const evalChips = () => {
  chipList.forEach(ch => {
    if (!ch || ch.classList.contains('tutorial')) return;
    const content = ch.querySelector('.hud-text');
    let on = hasContent(content);
    // Garde la chip "Planète" (g1) éteinte tant qu'il n'y a pas de sélection
    if (ch === chips.g1 && !hasSelection) on = false;
    setState(ch, on);
  });
  const anyOn = chipList.some(ch => ch && !ch.classList.contains('tutorial') && ch.classList.contains('on'));
  chips.tutorial?.classList.toggle('on', !anyOn);
};
evalChips();

const mirrors = [
  { from:'#bloc-g1', to:'.chip.g1 .hud-text' },
  { from:'#bloc-g2', to:'.chip.g2 .hud-text' },
  { from:'#bloc-g3', to:'.chip.g3 .hud-text' },
  { from:'#bloc-d1', to:'.chip.d1 .hud-text' },
  { from:'#bloc-d2', to:'.chip.d2 .hud-text' },
  { from:'#bloc-d3', to:'.chip.d3 .hud-text' },
];
const applyMirror = (srcSel, dstSel) => {
  const src = document.querySelector(srcSel);
  const dst = document.querySelector(dstSel);
  if (!src || !dst) return;
  const sc = src.querySelector(':scope > .section-content') || src;
  dst.innerHTML = cleanHTML(sc);
  evalChips();
};
const mirrorObs = new MutationObserver(muts => {
  muts.forEach(m => {
    const hit = mirrors.find(mi => m.target.closest(mi.from));
    if (hit) applyMirror(hit.from, hit.to);
  });
});
mirrors.forEach(mi => {
  const src = document.querySelector(mi.from);
  if (!src) return;
  applyMirror(mi.from, mi.to);
  mirrorObs.observe(src, { childList:true, subtree:true, characterData:true });
});

// bouton fermer sur “Informations”
chips.g2?.querySelector('.hud-close')?.addEventListener('click', () => {
  bus.dispatchEvent(new CustomEvent('object:cleared'));
});
bus.addEventListener('object:cleared', () => {
  hasSelection = false;
  const g2Text = chips.g2?.querySelector('.hud-text');
  if (g2Text) g2Text.textContent = '';
  evalChips();
});

/* ============= 3) Pont d’événements hérités → sélection active ============= */
// on écoute LARGEMENT (window + document) puis on rebroadcast si besoin
const legacyEvents = [
  'planet:selected',
  'dashboard:planet:selected',
  'dashboard:select:planet',
  'planet:focus',
  'object:selected'
];
const onSelectEvent = (srcName) => (e) => {
  hasSelection = true;
  chips.tutorial?.classList.remove('on');
  if (srcName !== 'object:selected') {
    const id = e?.detail?.id || e?.detail?.name || e?.detail?.slug;
    bus.dispatchEvent(new CustomEvent('object:selected', { detail:{ id, source:srcName } }));
  }
  evalChips();
};
legacyEvents.forEach(n => {
  window.addEventListener(n, onSelectEvent(n));
  document.addEventListener(n, onSelectEvent(n));
});

/* ============= 4) Si un bloc se remplit de lui-même, on cache la tuto ============= */
const anyContentObs = new MutationObserver(() => {
  const anyFilled = panelEls.some(p => hasContent(p));
  if (anyFilled) { hasSelection = true; chips.tutorial?.classList.remove('on'); evalChips(); }
});
panelEls.forEach(p => anyContentObs.observe(p, { childList:true, subtree:true, characterData:true }));

/* (Optionnel) raccourci debug : E = simuler Terre
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e') {
    hasSelection = true;
    bus.dispatchEvent(new CustomEvent('object:selected', { detail:{ id:'earth', source:'debug' } }));
    evalChips();
  }
});
*/
