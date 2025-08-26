// init.js — Compat DOM attendu par les modules, création #info-*,
// sélecteurs aux bonnes valeurs, miroir blocs→chips, et tuto qui ne
// disparaît qu'après un vrai clic utilisateur.

const bus = window.__lab?.bus || document;

/* ============= utilitaires ============= */
const ensure = (host, sel, mk) => {
  let el = host.querySelector(sel);
  if (!el) { el = mk(); host.appendChild(el); }
  return el;
};
const ensureSectionContent = (host) =>
  ensure(host, ':scope > .section-content', () => {
    const sc = document.createElement('div');
    sc.className = 'section-content';
    return sc;
  });

const isMeaningful = (el) => {
  if (!el) return false;
  const sc = el.querySelector(':scope > .section-content') || el;
  const txt = (sc.textContent || '').trim();
  return !!txt && txt !== '— vide —';
};

const setOn = (el, on) => {
  if (!el) return;
  el.classList.toggle('on', !!on);
  const ph = el.querySelector('.placeholder');
  if (ph) ph.style.display = on ? 'none' : 'flex';
};

/* ============= 0) Compat DOM attendu par TES MODULES ============= */
/* G1 : viewer + couche (si absent) */
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

/* Fabrique un #info-* complet dans le bloc demandé (select + .section-content) */
const mountInfo = (blocSel, infoId, selectOptions) => {
  const host = document.querySelector(blocSel);
  if (!host) return null;

  // Conteneur #info-*
  let info = host.querySelector(`#${infoId}`);
  if (!info) {
    info = document.createElement('div');
    info.id = infoId;
    host.appendChild(info);
  }

  // Select[data-section]
  let select = info.querySelector('select[data-section]');
  if (!select) {
    select = document.createElement('select');
    select.className = 'codex-select';
    select.setAttribute('data-section', infoId);
    select.innerHTML = selectOptions.map(o =>
      `<option value="${o.value}" ${o.selected ? 'selected' : ''}>${o.label}</option>`
    ).join('');
    const h3 = document.createElement('h3');
    h3.appendChild(select);
    info.appendChild(h3);
  }

  // Zone de rendu
  let target = info.querySelector('.section-content');
  if (!target) {
    const maybe = host.querySelector(':scope > .section-content');
    target = maybe || document.createElement('div');
    target.classList.add('section-content');
    info.appendChild(target);
  }

  // Placeholder initial
  if (!target.textContent.trim()) {
    const ph = document.createElement('div');
    ph.className = 'placeholder';
    ph.textContent = '— vide —';
    target.appendChild(ph);
  }

  return { host, info, select, target };
};

/* === installe les 4 conteneurs aux bonnes clés que tes modules attendent === */
// Informations principales → #info-data (basic/composition/climat)
mountInfo('#bloc-g2', 'info-data', [
  { value: 'basic',       label: 'Données principales', selected: true },
  { value: 'composition', label: 'Composition' },
  { value: 'climat',      label: 'Climat' }
]);

// Terraformation → #info-colony (summary/explanation)
mountInfo('#bloc-g3', 'info-colony', [
  { value: 'summary',     label: 'Résumé',      selected: true },
  { value: 'explanation', label: 'Explications' }
]);

// Missions → #info-missions (summary)
mountInfo('#bloc-d1', 'info-missions', [
  { value: 'summary',     label: 'Exploration', selected: true }
]);

// Lunes → #info-moons (summary/details) — labels cohérents avec le titre “LUNES”
mountInfo('#bloc-d2', 'info-moons', [
  { value: 'summary',     label: 'Résumé',  selected: true },
  { value: 'details',     label: 'Détails' }
]);

// D3 : viewer/log secondaire — juste la zone si besoin
ensureSectionContent(document.querySelector('#bloc-d3'));

// Placeholders bloc (état OFF visuel tant qu’il n’y a pas de contenu)
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

/* ============= 1) ON/OFF des panels ============= */
const panels = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3']
  .map(sel => document.querySelector(sel)).filter(Boolean);

const panelObs = new MutationObserver(() => panels.forEach(p => setOn(p, isMeaningful(p))));
panels.forEach(p => {
  setOn(p, isMeaningful(p));
  panelObs.observe(p, { childList:true, subtree:true, characterData:true });
});

/* ============= 2) HUD Chips : miroir blocs → chips + tuto ============= */
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

// Tuto ON au chargement. On ne le cache qu’après clic utilisateur sur le radar.
let hasUserSelection = false;
if (chips.tutorial) chips.tutorial.classList.add('on');

// Miroir simple bloc→chip
const cleanCloneHTML = (src) => {
  const node = src.cloneNode(true);
  node.querySelectorAll('.placeholder, .viewer-controls, #planet-main-viewer').forEach(n => n.remove());
  return node.innerHTML.trim();
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
  dst.innerHTML = cleanCloneHTML(sc);
  // ON seulement si contenu réel
  const chip = dst.closest('.chip');
  if (chip) chip.classList.toggle('on', isMeaningful(src) && hasUserSelection);
  // Tuto se cache uniquement après une sélection utilisateur
  if (chips.tutorial) chips.tutorial.classList.toggle('on', !hasUserSelection);
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

// Clic utilisateur sur le radar -> on bascule l’état et on réévalue les chips
document.getElementById('simul-system')?.addEventListener('click', () => {
  hasUserSelection = true;
  // ré-appliquer une fois pour mettre ON les chips si contenu
  mirrors.forEach(mi => applyMirror(mi.from, mi.to));
});

/* ============= 3) Compat événements hérités (si présents) ============= */
['planet:selected','dashboard:planet:selected','dashboard:select:planet','planet:focus','object:selected']
  .forEach(n => {
    window.addEventListener(n, () => {
      hasUserSelection = true;
      mirrors.forEach(mi => applyMirror(mi.from, mi.to));
    });
    document.addEventListener(n, () => {
      hasUserSelection = true;
      mirrors.forEach(mi => applyMirror(mi.from, mi.to));
    });
  });

/* (debug)
document.addEventListener('keydown', (e) => {
  if (e.key.toLowerCase() === 'e') {
    hasUserSelection = true;
    bus.dispatchEvent(new CustomEvent('object:selected', { detail:{ id:'earth', source:'debug' } }));
    mirrors.forEach(mi => applyMirror(mi.from, mi.to));
  }
});
*/
