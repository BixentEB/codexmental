// init.js — Auto ON/OFF panels + CHIPS, compat containers, miroir #bloc-* → chips,
//           et pont d'événements (sans modifier simul-system.js)

const bus = window.__lab?.bus || document;

/* ============= utils ============= */
const ensureSectionContent = (host) => {
  // certains modules écrivent dans .section-content — on le crée si absent
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

/* ============= 1) Panels (compat : #bloc-g1..d3) ============= */
const panelIds = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'];
const panels = panelIds.map(sel => document.querySelector(sel)).filter(Boolean);

// Assure la présence de .section-content pour les modules existants
panels.forEach(p => ensureSectionContent(p));

const panelObs = new MutationObserver(() => panels.forEach(p => setState(p, hasContent(p))));
panels.forEach(p => {
  if (!p) return;
  if (!p.querySelector('.placeholder')){
    const ph = document.createElement('div');
    ph.className = 'placeholder';
    ph.textContent = '— vide —';
    p.appendChild(ph);
  }
  setState(p, hasContent(p));
  panelObs.observe(p, { childList:true, subtree:true, characterData:true });
});

/* ============= 2) Chips HUD ============= */
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

// Baseline: tout OFF sauf tutoriel
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
evalChips();

const chipObs = new MutationObserver(evalChips);
chipObs.observe(hudRoot, { childList:true, subtree:true, characterData:true });

// Close “×” → deselect
chips.g2?.querySelector('.hud-close')?.addEventListener('click', () => {
  bus.dispatchEvent(new CustomEvent('object:cleared'));
});

/* ============= 3) Miroir #bloc-* → chips (on copie le vrai contenu, sans placeholders) ============= */
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
  // copie prioritairement ce que les modules mettent dans .section-content s'il existe
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
  applyMirror(mi.from, mi.to); // init
  mirrorObs.observe(src, { childList:true, subtree:true, characterData:true });
});

/* ============= 4) Pont d’événements hérités → UI ============= */
/*
  On écoute un éventail de noms d’événements déjà utilisés possible
  pour NE PAS modifier simul-system.js ni tes modules :
*/
const legacyEvents = [
  'planet:selected',
  'dashboard:planet:selected',
  'dashboard:select:planet',
  'planet:focus',
  'object:selected'           // au cas où déjà émis par tes modules
];

legacyEvents.forEach(ev =>
  bus.addEventListener(ev, (e) => {
    // Quoi qu'il arrive, on cache la tuto
    chips.tutorial?.classList.remove('on');
    // On rebroadcast dans un format “canonique” si besoin (laissera tes modules actuels tranquilles)
    if (ev !== 'object:selected') {
      const id = e?.detail?.id || e?.detail?.name || e?.detail?.slug;
      bus.dispatchEvent(new CustomEvent('object:selected', { detail:{ id, source:ev } }));
    }
  })
);

// Quand on clear, on vide au moins la chip “Objet”
bus.addEventListener('object:cleared', () => {
  const g2Text = chips.g2?.querySelector('.hud-text');
  if (g2Text) g2Text.textContent = '';
  evalChips();
});

/* ============= 5) Secours : si un bloc se remplit “tout seul”, on considère qu’une sélection est active ============= */
const anyContentObs = new MutationObserver(() => {
  const anyFilled = panels.some(p => hasContent(p));
  if (anyFilled) chips.tutorial?.classList.remove('on');
});
panels.forEach(p => anyContentObs.observe(p, { childList:true, subtree:true, characterData:true }));
