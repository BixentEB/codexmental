// glue.reset.js – reset dashboard
(function(){
  const btn = document.getElementById('dash-closeall');
  if (!btn) return;

  const reset = ()=>{
    ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
      const host=document.querySelector(sel);
      if (!host) return;
      host.querySelectorAll('.section-content').forEach(sc=>{
        sc.innerHTML='<div class="placeholder">— vide —</div>';
      });
    });
    window.OrbViewer?.clearPlanet?.();
    window.OrbViewer?.clearMoon?.();
    document.querySelector('.chip.tutorial')?.classList.add('on');
    btn.style.display='none';
    window.dispatchEvent(new CustomEvent('object:cleared'));
  };

  btn.addEventListener('click', reset);

  // exposé global
  window.DASH = window.DASH||{};
  window.DASH.resetDashboard = reset;
  window.DASH.setCloseVisible = (show)=>{ btn.style.display = show?'block':'none'; };

  // état initial : tuto ON, croix OFF
  reset();
})();
