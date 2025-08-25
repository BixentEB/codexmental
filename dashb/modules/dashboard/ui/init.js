// Sélecteurs des slots (grille) et des chips (flottants)
const slots = [
  '#bloc-g1','#bloc-g2','#bloc-g3',
  '#bloc-d1','#bloc-d2','#bloc-d3'
].map(q => document.querySelector(q));

const chips = {
  g1: document.querySelector('.chip.g1'),
  g2: document.querySelector('.chip.g2'),
  g3: document.querySelector('.chip.g3'),
  d1: document.querySelector('.chip.d1'),
  d2: document.querySelector('.chip.d2'),
  d3: document.querySelector('.chip.d3'),
};

// MutationObserver: si un slot reçoit du contenu non-vide → .on
const hasMeaningfulContent = el => {
  if(!el) return false;
  const text = (el.textContent || '').trim();
  const hasNodes = el.querySelector(':scope > *') !== null;
  return text.length > 0 || hasNodes;
};

const setState = (el, on) => {
  if(!el) return;
  el.classList.toggle('on', !!on);
  const ph = el.querySelector('.placeholder');
  if(ph) ph.style.display = on ? 'none' : 'flex';
};

const observer = new MutationObserver(() => {
  slots.forEach(el => setState(el, hasMeaningfulContent(el)));
  // si tu veux refléter certains slots dans des chips :
  // ex: copier un résumé dans .chip.g2
  // chips.g2.innerHTML = synthèse(...); setState(chips.g2, true/false);
});

slots.forEach(el => {
  if(!el) return;
  // placeholder par défaut
  if(!el.querySelector('.placeholder')){
    const ph = document.createElement('div');
    ph.className = 'placeholder';
    ph.textContent = '— vide —';
    el.appendChild(ph);
  }
  setState(el, hasMeaningfulContent(el));
  observer.observe(el, {childList:true, subtree:true, characterData:true});
});

// Bus d’événements simple (exposé global si besoin)
export const bus = new EventTarget();
export const emit = (type, detail={}) => bus.dispatchEvent(new CustomEvent(type,{detail}));

// Exemple: quand un objet est sélectionné dans le radar 3D
// emit('object:selected', { id:'mars', type:'planet' });
