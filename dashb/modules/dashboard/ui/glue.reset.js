(function(){
  if (document.getElementById('dash-closeall')) return;
  const host = document.querySelector('main.dashboard .radar') || document.body;
  const btn=document.createElement('button'); btn.id='dash-closeall'; btn.title='Fermer toutes les informations'; btn.textContent='×';
  host.appendChild(btn);

  const setCloseVisible = (show) => btn.classList.toggle('show', !!show);
  const resetPanels=()=>{
    ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
      const host=document.querySelector(sel); if(!host) return;
      const sc=host.querySelector(':scope > .section-content')||host;
      sc.innerHTML='<div class="placeholder">— vide —</div>';
    });
    // viewers
    window.OrbViewer?.clearPlanet?.(); window.OrbViewer?.clearMoon?.();
    // tuto / chips
    const tut=document.querySelector('.chip.tutorial'); if (tut) tut.classList.add('on');
    setCloseVisible(false);
    window.__DASH__?.forceUpdateHUD?.();
    document.dispatchEvent(new CustomEvent('object:cleared'));
  };

  window.DASH = window.DASH || {};
  window.DASH.resetDashboard = resetPanels;
  window.DASH.setCloseVisible = setCloseVisible;

  btn.addEventListener('click', resetPanels);
})();
