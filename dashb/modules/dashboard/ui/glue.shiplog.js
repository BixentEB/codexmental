(function(){
  // Hôte : on colle la console dans la zone radar si possible
  var host = document.querySelector('main.dashboard .radar') ||
             document.querySelector('main.dashboard') || document.body;

  if (!document.getElementById('ship-console')) {
    var box = document.createElement('div');
    box.id = 'ship-console';
    host.appendChild(box);
  }
  var boxEl = document.getElementById('ship-console');
  if (!boxEl) return;

  var pushed = new Set();
  function txtOf(el){
    return (el && (el.innerText || el.textContent) || '').trim();
  }
  function push(line){
    var t = (line||'').trim();
    if (!t || pushed.has(t)) return;
    pushed.add(t);
    var row = document.createElement('div');
    row.textContent = t;
    boxEl.appendChild(row);
    while (boxEl.childElementCount > 160) boxEl.removeChild(boxEl.firstElementChild);
    boxEl.scrollTop = boxEl.scrollHeight;
  }

  // Heuristique de détection
  var reShip = /(\[\s*\d{1,2}:\d{2}:\d{2}\s*\])|(^\s*→\s)|⏳|STANDBY|Gyroscope|Évitement|Evitement|Vaisseau/i;

  // On observe le conteneur ENTIER de Missions (pas seulement .section-content)
  var missionsHost = document.querySelector('#info-missions') || document.querySelector('#bloc-d1');
  if (!missionsHost) return;

  function sweep(){
    // 1) Parcours éléments : si l'élément au complet ressemble à un log, on le dégage
    var elements = missionsHost.querySelectorAll('*');
    elements.forEach(function(el){
      // ignore les conteneurs info-missions eux-mêmes
      if (el === missionsHost) return;
      var t = txtOf(el);
      if (!t) return;
      if (reShip.test(t)) {
        push(t);
        if (el.parentNode) el.parentNode.removeChild(el);
      }
    });

    // 2) Sécurité : on retire aussi les nœuds texte "isolés"
    var walker = document.createTreeWalker(missionsHost, NodeFilter.SHOW_TEXT, null);
    var toRemove = [];
    var n;
    while ((n = walker.nextNode())) {
      var v = (n.nodeValue||'').trim();
      if (v && reShip.test(v)) {
        push(v);
        // supprime le parent proche si c'est un petit wrapper
        var p = n.parentNode;
        if (p && p !== missionsHost && p.childNodes.length <= 3) {
          toRemove.push(p);
        } else {
          toRemove.push(n);
        }
      }
    }
    toRemove.forEach(function(node){
      if (node && node.parentNode) node.parentNode.removeChild(node);
    });
  }

  sweep();
  var mo = new MutationObserver(sweep);
  mo.observe(missionsHost, {childList:true, subtree:true, characterData:true});
})();
