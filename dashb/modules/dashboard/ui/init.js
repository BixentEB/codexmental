// init.js — Compat DOM (anciens blocs), conteneurs #info-* attendus par le métier,
// miroir #bloc-* → chips, pont d’événements, & gestion tutoriel.

const bus = window.__lab?.bus || document;

/* ============= utilitaires ============= */
const ensure = (host, sel, mk) => {
  let el = host.querySelector(sel);
  if (!el) {
    el = mk();
    host.appendChild(el);
  }
  return el;
};
const ensureSectionContent = (host) =>
  ensure(host, ':scope > .section-content', () => {
    const sc = document.createElement('div');
    sc.className = 'section-content';
    return sc;
  });

const cleanHTML = (src) => {
  const clone = src.cloneNode(true);
  // On peut filtrer ici si besoin
  return clone.innerHTML;
};
const setState = (el,on) => { if (el) el.classList.toggle('on', !!on); };
const hasContent = (host) => {
  if (!host) return false;
  const sc = host.querySelector(':scope > .section-content') || host;
  const txt = (sc.textContent || '').trim();
  return !!txt && txt !== '— vide —';
};

/* ============= 0) Compat DOM attendu par les modules "métier" ============= */
/* G1 : viewer + couche */
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

/* Fabrique un bloc avec un conteneur #info-*, un select[data-section] et une .section-content */
const mountInfo = (blocSel, infoId, dataSection, options) => {
  const host = document.querySelector(blocSel);
  if (!host) return null;

  // Conteneur #info-*
  let info = host.querySelector(`#${infoId}`);
  if (!info) {
    info = document.createElement('div');
    info.id = infoId;
    host.appendChild(info);
  }

  // Select (on réutilise s’il existe déjà dans le bloc)
  let select = info.querySelector('select[data-section]');
  if (!select) {
    select = (host.querySelector('select[data-section]') || document.createElement('select'));
    select.className = 'codex-select';
    select.setAttribute('data-section', dataSection);
    // options
    select.innerHTML = options.map(o =>
      `<option value="${o.value}" ${o.selected?'selected':''}>${o.label}</option>`
    ).join('');
    const h3 = document.createElement('h3');
    h3.appendChild(select);
    info.appendChild(h3);
  }

  // Section content (on réutilise celle du bloc si elle existe)
  let target = info.querySelector('.section-content');
  if (!target) {
    const existingSC = host.querySelector(':scope > .section-content');
    target = existingSC || document.createElement('div');
    target.classList.add('section-content');
    info.appendChild(target);
  } else {
    // s’il y a une .section-content au bloc racine et pas dans info, on la déplace dedans
    const rootSC = host.querySelector(':scope > .section-content');
    if (rootSC && rootSC !== target && !target.childNodes.length) {
      target.innerHTML = rootSC.innerHTML;
      rootSC.remove();
    }
  }

  // Placeholder si vide
  if (!target.textContent.trim()) {
    const ph = document.createElement('div');
    ph.className = 'placeholder';
    ph.textContent = '— vide —';
    target.appendChild(ph);
  }

  return { host, info, select, target };
};

// G2 : Informations principales → #info-data
mountInfo('#bloc-g2', 'info-data', 'informations', [
  {value:'basic', label:'Données principales', selected:true},
  {value:'composition', label:'Composition'},
  {value:'climat', label:'Climat'}
]);

// G3 : Terraformation → #info-colony
mountInfo('#bloc-g3', 'info-colony', 'colony', [
  {value:'summary', label:'Résumé', selected:true},
  {value:'explanation', label:'Explications'},
  {value:'bases', label:'Implantations'}
]);

// D1 : Missions → #info-missions
mountInfo('#bloc-d1', 'info-missions', 'missions', [
  {value:'summary', label:'Exploration', selected:true},
]);

// D2 : Lunes → #info-moons
mountInfo('#bloc-d2', 'info-moons', 'moons', [
  {value:'summary', label:'Lunes', selected:true},
  {value:'details', label:'Détails'}
]);

// D3 : viewer/logs secondaire – on prépare juste le conteneur
ensureSectionContent(document.querySelector('#bloc-d3'));

// Placeholders au niveau bloc (pour l’état OFF)
['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
  const p = document.querySelector(sel);
  if (!p) return;
  if (!p.querySelector(':scope > .placeholder')) {
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

/* ============= 2) HUD Chips : miroir blocs → chips + tutoriel ============= */
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

// Tout OFF sauf la tuto
chipList.forEach(ch => { if (ch && !ch.classList.contains('tutorial')) ch.classList.remove('on'); });
chips.tutorial?.classList.add('on');

// Flag “une sélection a eu lieu”
let hasSelection = false;

const evalChips = () => {
  chipList.forEach(ch => {
    if (!ch || ch.classList.contains('tutorial')) return;
    const content = ch.querySelector('.hud-text') || ch;
    let on = !!content && content.textContent.trim() !== '';
    if (ch === chips.g1 && !hasSelection) on = false; // la carte “Planète” s’allume après sélection
    setState(ch, on);
  });
  const anyOn = chipList.some(ch => ch && !ch.classList.contains('tutorial') && ch.classList.contains('on'));
  chips.tutorial?.classList.toggle('on', !anyOn);
};
evalChips();

// Miroirs
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

// Bouton fermer sur “Informations”
chips.g2?.querySelector('.hud-close')?.addEventListener('click', () => {
  bus.dispatchEvent(new CustomEvent('object:cleared'));
});
bus.addEventListener('object:cleared', () => {
  hasSelection = false;
  const tgt = chips.g2?.querySelector('.hud-text');
  if (tgt) tgt.textContent = '';
  evalChips();
});

/* ============= 3) Pont d’événements hérités → sélection active ============= */
// Écoute large (window + document), rebroadcast éventuel en object:selected
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
  // Normalisation minimale vers object:selected
  if (srcName !== 'object:selected') {
    const id = e?.detail?.id || e?.detail?.name || e?.detail?.slug;
    if (id) bus.dispatchEvent(new CustomEvent('object:selected', { detail:{ id, source:srcName } }));
  }
  evalChips();
};
legacyEvents.forEach(n => {
  window.addEventListener(n, onSelectEvent(n));
  document.addEventListener(n, onSelectEvent(n));
});

/* ============= 4) Si un bloc se remplit “tout seul”, on cache la tuto ============= */
const anyContentObs = new MutationObserver(() => {
  const anyFilled = panelEls.some(p => hasContent(p));
  if (anyFilled) { hasSelection = true; chips.tutorial?.classList.remove('on'); evalChips(); }
});
panelEls.forEach(p => anyContentObs.observe(p, { childList:true, subtree:true, characterData:true }));

/* (debug) simuler une sélection avec “E”
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e') {
    hasSelection = true;
    bus.dispatchEvent(new CustomEvent('object:selected', { detail:{ id:'earth', source:'debug' } }));
    evalChips();
  }
});
*/
