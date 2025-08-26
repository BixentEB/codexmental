(function(){
  // Ajoute le canvas planet si absent (certains modules en ont besoin)
  const g1 = document.querySelector('#bloc-g1');
  if (g1 && !g1.querySelector('#planet-main-viewer')) {
    g1.insertAdjacentHTML('afterbegin', `
      <canvas id="planet-main-viewer" width="300" height="220" data-planet=""></canvas>
      <div class="viewer-controls" style="margin:.35rem 0 .25rem;">
        <label for="layer-select" style="margin-right:.35rem; opacity:.8">🛰️ Couche :</label>
        <select id="layer-select" class="codex-select">
          <option value="surface" selected>Surface</option>
          <option value="cloud">Nuages</option>
          <option value="infrared">Infrarouge</option>
        </select>
      </div>
    `);
  }

  // Couche -> si OrbViewer existe
  document.getElementById('layer-select')?.addEventListener('change',(e)=>{
    window.OrbViewer?.setLayer?.(e.target.value);
  });

  // Heuristique lune : si #info-moons change et expose un nom -> viewer lune
  const moonsSC = document.querySelector('#info-moons .section-content');
  if (moonsSC) {
    const mo = new MutationObserver(() => {
      const attr = moonsSC.querySelector('[data-moon]')?.getAttribute('data-moon');
      let id = (attr||'').toLowerCase();
      if (!id) {
        const t = (moonsSC.textContent||'').toLowerCase();
        // si “lune” + mot en gras/fort -> nom probable
        const m = t.match(/\b(?:lune|satellite)\b.*?\b([a-zàâçéèêëîïôûùüÿñ\-]+)\b/i);
        if (m) id = m[1];
      }
      if (id) {
        window.DASH?.setCloseVisible?.(true);
        window.OrbViewer?.showMoon?.(id);
        window.__DASH__?.forceUpdateHUD?.();
      }
    });
    mo.observe(moonsSC,{childList:true,subtree:true,characterData:true});
  }

  // API viewer optionnelle => évite erreurs si non présent
  window.OrbViewer = window.OrbViewer || {
    setLayer(){}, showPlanet(){}, showMoon(){}, clearPlanet(){}, clearMoon(){}
  };
})();
