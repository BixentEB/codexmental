// init.js — Auto ON/OFF des panneaux + chips, et gestion du “deselect”

// 1) Panneaux (compat)
const panelIds = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'];
const panels = panelIds.map(sel => document.querySelector(sel)).filter(Boolean);

// 2) Chips HUD
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

// Chips: ON/OFF selon contenu de .hud-text ; tutoriel visible si aucune autre chip n’est “on”
const chipObs = new MutationObserver(() => {
  chipList.forEach(ch => {
    const content = ch.classList.contains('tutorial') ? ch.querySelector('.hud-text') : ch.querySelector('.hud-text');
    const on = ch.classList.contains('tutorial') ? hasContent(ch) : hasContent(content);
    // on ne coupe pas la tutoriel ici, on la coupe après calcul global
    if (!ch.classList.contains('tutorial')) setState(ch, on);
  });
  const anyChipOn = chipList.some(ch => !ch.classList.contains('tutorial') && ch.classList.contains('on'));
  if (chips.tutorial) chips.tutorial.classList.toggle('on', !anyChipOn);
});

// Observer sur la zone chips
const hudRoot = document.querySelector('.hud-chips') || document;
chipObs.observe(hudRoot, { childList:true, subtree:true, characterData:true });

// Bouton “×” sur la chip Objet → deselect
const bus = window.__lab?.bus || document;
chips.g2?.querySelector('.hud-close')?.addEventListener('click', () => {
  bus.dispatchEvent(new CustomEvent('object:cleared'));
});

// Si tes modules émettent object:selected → on masque la tutoriel
bus.addEventListener('object:selected', () => {
  if (chips.tutorial) chips.tutorial.classList.remove('on');
});

// Si object:cleared → on vide g2 (à toi de vider les autres dans tes modules) ; la tutoriel reviendra automatiquement
bus.addEventListener('object:cleared', () => {
  const g2Text = chips.g2?.querySelector('.hud-text');
  if (g2Text) g2Text.textContent = '';
});
