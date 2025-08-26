// init.js — Compat DOM (anciens blocs), miroir #bloc-* → chips, pont d’événements.
// AUCUNE modif de tes scripts métier. On reconstruit juste le markup attendu.

const bus = window.__lab?.bus || document;

/* ============= utils ============= */
const ensure = (host, html) => {
  if (!host) return null;
  if (!host.firstElementChild) host.insertAdjacentHTML('beforeend', html);
  return host;
};
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
const cleanHTML = (node) => {
  const clone = node.cloneNode(true);
  clone.querySelectorAll('.placeholder').forEach(el => el.remove());
  return clone.innerHTML.trim();
};
const hasContent = (el) => {
  if (!el) return false;
  const tmp = el.cloneNode(true);
  tmp.querySelectorAll('.placeholder').forEach(n => n.remove());
  const text = (tmp.textContent || '').trim();
  const child = tmp.querySelector(':scope > *:not(.placeholder)');
  return (text.length > 0) || !!child;
};
const setState = (el,on) => {
  if (!el) return;
  el.classList.toggle('on', !!on);
  const ph = el.querySelector('.placeholder');
  if (ph) ph.style.display = on ? 'none' : 'flex';
};

/* ============= 0) Reconstruire le DOM “ancien” si besoin ============= */
// G1 : viewer + couche
{
  const g1 = document.querySelector('#bloc-g1');
  if (g1 && !g1.querySelector('#planet-main-viewer')) {
    g1.insertAdjacentHTML('beforeend', `
      <canvas id="planet-main-viewer" width="150" height="150" data-planet=""></canvas>
      <div class="viewer-controls" style="margin-top:.5rem">
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
// G2..D3 : selects + section-content (suivant l’index historique)
const ensureBlock = (sel, title, dataSection, options) => {
  const host = document.querySelector(sel);
  if (!host) return;
  let hasSelect = host.querySelector('select[data-section]');
  if (!hasSelect) {
    const opts = options.map(o => `<option value="${o.value}" ${o.selected?'selected':''}>${o.label}</option>`).join('');
    host.insertAdjacentHTML('afterbegin', `
      <h3>
        <select data-section="${dataSection}" class="codex-select">
          ${opts}
        </select>
      </h3>
    `);
  }
  ensureSectionContent(host);
};
ensureBlock('#bloc-g2', 'Informations', 'informations', [
  {value:'basic', label:'Données principales', selected:true},
  {value:'composition', label:'Composition'},
  {value:'climat', label:'Climat'},
]);
ensureBlock('#bloc-g3', 'Terraformation', 'colony', [
  {value:'colonization', label:'État de terraformation', selected:true},
  {value:'potentials', label:'Potentiels'},
  {value:'phases', label:'Phases'},
  {value:'bases', label:'Implantations'},
]);
ensureBlock('#bloc-d1', 'Missions', 'missions', [
  {value:'summary', label:'Exploration', selected:true},
]);
ensureBlock('#bloc-d2', 'Lunes', 'moons', [
  {value:'summary', label:'Lunes', selected:true},
  {value:'details', label:'Détails'},
]);
// D3 : viewer secondaire/logs → au moins une section-content
ensureSectionContent(document.querySelector('#bloc-d3'));

/* Ajoute des placeholders “— vide —” pour l’état OFF */
['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
  const p = document.querySelector(sel);
  if (!p) return;
  if (!p.querySelector('.placeholder')){
    const ph = document.createElement('div');
    ph.className = 'placeholder';
    ph.textContent = '— vide —';
    p.appendChild(ph);
  }
});

/* ============= 1) Panels ON/OFF ============= */
const panels = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3']
  .map(sel => document.querySelector(sel)).filter(Boolean);

const panelObs = new MutationObserver(() => panels.forEach(p => setState(p, hasContent(p))));
panels.forEach(p => {
  setState(p, hasContent(p));
  panelObs.observe(p, { childList:true, subtree:true, characterData:true });
});

/* ============= 2) CHIPS HUD (miroir #bloc-* → chips) ============= */
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
const hudRoot = document.querySelector('.hud-chips') || document;

// baseline : OFF (sauf tuto)
chipList.forEach(ch => { if (ch && !ch.classList.contains('tutorial')) ch.classList.remove('on'); });
chips.tutorial?.classList.add('on');

const evalChips = () => {
  chipList.forEach(ch => {
    if (!ch || ch.classList.contains('tutorial')) return;
    const content = ch.querySelector('.hud-text');
    setState(ch, hasContent(content));
  });
  const anyOn = chipList.some(ch => ch && !ch.classList.contains('tutorial') && ch.classList.contains('on'));
  chips.tutorial?.classList.toggle('on', !anyOn);
};

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
  const g2Text = chips.g2?.querySelector('.hud-text');
  if (g2Text) g2Text.textContent = '';
  evalChips();
});

/* ============= 3) Pont d’événements hérités ============= */
// On écoute à la fois document ET window pour tout capter,
// puis on rebroadcast sur bus en “object:selected”.
const legacyEvents = [
  'planet:selected',
  'dashboard:planet:selected',
  'dashboard:select:planet',
  'planet:focus',
  'object:selected'
];

const rebroadcast = (srcName) => (e) => {
  chips.tutorial?.classList.remove('on');
  // log léger pour debug
  if (window.console) console.info('[BUS]', srcName, e?.detail);
  if (srcName !== 'object:selected') {
    const id = e?.detail?.id || e?.detail?.name || e?.detail?.slug;
    bus.dispatchEvent(new CustomEvent('object:selected', { detail:{ id, source:srcName } }));
  }
};
legacyEvents.forEach(n => {
  window.addEventListener(n, rebroadcast(n));
  document.addEventListener(n, rebroadcast(n));
});

/* ============= 4) Secours : si un bloc se remplit, on cache la tuto ============= */
const anyContentObs = new MutationObserver(() => {
  const anyFilled = panels.some(p => hasContent(p));
  if (anyFilled) chips.tutorial?.classList.remove('on');
});
panels.forEach(p => anyContentObs.observe(p, { childList:true, subtree:true, characterData:true }));

/* ============= 5) Raccourci debug : 'E' → simuler Terre ============= */
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e') {
    bus.dispatchEvent(new CustomEvent('object:selected', { detail:{ id:'earth', source:'debug' } }));
  }
});
