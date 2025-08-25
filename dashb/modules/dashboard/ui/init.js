// init.js — Auto ON/OFF des panneaux + chips, et gestion du “deselect”

// Panneaux (compat)
const panelIds = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'];
const panels = panelIds.map(sel => document.querySelector(sel)).filter(Boolean);

// Chips HUD
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

// Panels: placeholder “— vide —” + observer
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

// Chips: ON/OFF selon contenu de .hud-text ; tutoriel visible si aucune chip n’est on
const chipObs = new MutationObserver(() => {
  chipList.forEach(ch => {
    if (!ch) return;
    if (ch.classList.contains('tutorial')) return; // tutoriel géré plus bas
    const content = ch.querySelector('.hud-text');
    setState(ch, hasContent(content));
  });
  const anyChipOn = chipList.some(ch => ch && !ch.classList.contains('tutorial') && ch.classList.contains('on'));
  if (chips.tutorial) chips.tutorial.classList.toggle('on', !anyChipOn);
});
const hudRoot = document.querySelector('.hud-chips') || document;
chipObs.observe(hudRoot, { childList:true, subtree:true, characterData:true });

// Close “×” → deselect
const bus = window.__lab?.bus || document;
chips.g2?.querySelector('.hud-close')?.addEventListener('click', () => {
  bus.dispatchEvent(new CustomEvent('object:cleared'));
});

// Quand une sélection arrive, on masque la tutoriel (elle se ré‑affichera si tout redevient vide)
bus.addEventListener('object:selected', () => {
  if (chips.tutorial) chips.tutorial.classList.remove('on');
});

// Resize: si on veut que le canvas prenne toute la place dispo
const radar = document.getElementById('radar');
const canvas = document.getElementById('simul-system');
if (radar && canvas) {
  const ro = new ResizeObserver(() => {
    // fit le canvas à la zone (CSS fait déjà l'essentiel, ceci ajuste l'attribut pixel pour un rendu net)
    const rect = radar.getBoundingClientRect();
    const ratio = Math.min(window.devicePixelRatio || 1, 1.5);
    canvas.width  = Math.floor((rect.width  - 24) * ratio);
    canvas.height = Math.floor((rect.height - 24) * ratio);
  });
  ro.observe(radar);
}
