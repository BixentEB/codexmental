(function(){
  if (document.getElementById('ship-console')) {
    return; // déjà en place
  }
  const host = document.querySelector('main.dashboard .radar') || document.querySelector('main.dashboard') || document.body;
  const box = document.createElement('div'); box.id='ship-console'; host.appendChild(box);

  const moved = new Set();
  const push=(txt)=>{ const t=(txt||'').trim(); if(!t||moved.has(t)) return; moved.add(t);
    const row=document.createElement('div'); row.textContent=t; box.appendChild(row);
    while(box.childElementCount>160) box.removeChild(box.firstElementChild);
    box.scrollTop=box.scrollHeight;
  };

  const isShipLine = (txt='') =>
    /^\s*\[\d{1,2}:\d{2}:\d{2}\]/.test(txt) || /^→\s/.test(txt) ||
    /STANDBY|Gyroscope|Évitement|Evitement|Vaisseau/i.test(txt);

  // on observe le conteneur entier de missions (certains modules écrivent hors .section-content)
  const missionsHost = document.querySelector('#info-missions') || document.querySelector('#bloc-d1');
  if (!missionsHost) return;

  const sweep = () => {
    const walker = document.createTreeWalker(missionsHost, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT, null);
    const toRemove=[];
    while (walker.nextNode()) {
      const n = walker.currentNode;
      const t = (n.nodeType===3 ? n.nodeValue : n.textContent) || '';
      if (isShipLine(t)) { push((n.innerText||n.textContent||'').trim()); toRemove.push(n); }
    }
    toRemove.forEach(n=>{ if(n.parentNode) n.parentNode.removeChild(n); });
  };
  sweep();
  new MutationObserver(sweep).observe(missionsHost,{childList:true,subtree:true,characterData:true});
})();
