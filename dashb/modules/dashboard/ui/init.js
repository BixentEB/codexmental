// Active .on si du contenu apparaît dans un bloc panel
const ids = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'];
const panels = ids.map(sel => document.querySelector(sel)).filter(Boolean);

const hasContent = el => {
  if (!el) return false;
  const text = (el.textContent || '').trim();
  const child = el.querySelector(':scope > *:not(.placeholder)');
  return (text.length > 0) || !!child;
};

const setState = (el,on) => {
  el.classList.toggle('on', !!on);
  let ph = el.querySelector('.placeholder');
  if (!ph) { ph = document.createElement('div'); ph.className='placeholder'; ph.textContent='— vide —'; el.appendChild(ph); }
  ph.style.display = on ? 'none' : 'flex';
};

const obs = new MutationObserver(() => panels.forEach(p => setState(p, hasContent(p))));
panels.forEach(p => {
  setState(p, hasContent(p));
  obs.observe(p, { childList:true, subtree:true, characterData:true });
});
