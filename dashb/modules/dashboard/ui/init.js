// init.js — Auto ON/OFF panels + CHIPS, miroir #bloc-* → chips, pont d'événements sélection

const bus = window.__lab?.bus || document;

// ---------- utils ----------
const hasContent = el => {
  if (!el) return false;
  const text = (el.textContent || '').trim();
  const child = el.querySelector(':scope > *:not(.placeholder)');
  return (text.length > 0) || !!child;
};
const setState = (el,on) => {
  if (!el) return;
  el.classList.toggle('on', !!on);
  const ph = el.querySelector('.placeholder');
  if (ph) ph.style.display = on ? 'none' : 'flex';
};

// ---------- 1) PANELS (compat) ----------
const panelIds = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'];
const panels = panelIds.map(sel => document.querySelector(sel)).filter(Boolean);

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

// ---------- 2) CHIPS ----------
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

// Initial: seules les chips avec contenu doivent être ON; la tutoriel reste ON si aucune autre
const evalChips = () => {
  chipList.forEach(ch => {
    if (!ch || ch.classList.contains('tutorial')) return;
    const content = ch.querySelector('.hud-text');
    setState(ch, hasContent(content));
  });
  const anyOn = chipList.some(ch => ch && !ch.classList.contains('tutorial') && ch.classList.contains('on'));
  if (chips.tutorial) chips.tutorial.classList.toggle('on', !anyOn);
};
evalChips();

const chipObs = new MutationObserver(evalChips);
chipObs.observe(hudRoot, { childList:true, subtree:true, characterData:true });

// Close “×” → deselect
chips.g2?.querySelector('.hud-close')?.addEventListener('click', () => {
  bus.dispatchEvent(new CustomEvent('object:cleared'));
});

// ---------- 3) MIROIR (#bloc-* → chips) ----------
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
  dst.innerHTML = src.innerHTML;
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

// ---------- 4) Pont d'événements de sélection ----------
bus.addEventListener('planet:selected', (e) => {
  const id = e?.detail?.id || e?.detail?.name;
  bus.dispatchEvent(new CustomEvent('object:selected', { detail:{ id, type:'planet' } }));
  chips.tutorial?.classList.remove('on');
});

bus.addEventListener('object:cleared', () => {
  const g2Text = chips.g2?.querySelector('.hud-text');
  if (g2Text) g2Text.textContent = '';
  evalChips();
});
