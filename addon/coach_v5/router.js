/* ==========================================================
   COACH V5 — ROUTER
   Charge dynamiquement les sous-pages dans <main id="subview">
   sans casser la logique du app.js (plan, stats, etc.)
   ========================================================== */

(function(){
  const SUB = document.getElementById('subview');
  const NAV = document.querySelector('.nav-tabs');
  const TABS = NAV ? NAV.querySelectorAll('.tab') : [];

  const STATE_KEY   = 'coach_v5_state';
  const CAL_STORAGE = 'coach_v5_calendar';

  // --- routes disponibles
  const routes = {
    '#/plan':     { file: 'pages/plan.html' },
    '#/encyclo':  { file: 'pages/encyclo.html', js: 'pages/encyclo.js' },
    '#/lexique':  { file: 'pages/lexique.html' },
    '#/reglages': { file: 'pages/reglages.html' }
  };

  function setActive(hash){
    TABS.forEach(a => a.classList.toggle('active', a.getAttribute('href') === hash));
  }

  async function load(hash){
    const r = routes[hash] || routes['#/plan'];
    setActive(hash);
    if(!SUB) return;
    try{
      const resp = await fetch(r.file, { cache: 'no-store' });
      SUB.innerHTML = await resp.text();
      if(r.js){
        const s = document.createElement('script');
        s.src = r.js + '?v=' + Date.now();
        s.defer = true;
        SUB.appendChild(s);
      }
    }catch(e){
      SUB.innerHTML = `<div class="card"><h2>Erreur</h2><p>Impossible de charger <b>${r.file}</b></p></div>`;
    }
  }

  window.addEventListener('hashchange', ()=> load(location.hash || '#/plan'));
  load(location.hash || '#/plan');

  /* === Fonctions de sauvegarde et reset (mêmes clés que app.js) === */
  function getState(){ try{ return JSON.parse(localStorage.getItem(STATE_KEY)||'{}'); }catch(e){ return {}; } }
  function saveState(s){ localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

  // --- Export global
  document.getElementById('btnExport')?.addEventListener('click', ()=>{
    const data = localStorage.getItem(STATE_KEY) || '{}';
    const url = URL.createObjectURL(new Blob([data], { type:'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'coach_v5_state.json';
    a.click();
    URL.revokeObjectURL(url);
  });

  // --- Import global
  document.getElementById('btnImport')?.addEventListener('click', ()=> 
    document.getElementById('fileImport')?.click()
  );
  document.getElementById('fileImport')?.addEventListener('change', async (e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    try{
      const text = await f.text();
      JSON.parse(text); // validation
      localStorage.setItem(STATE_KEY, text);
      alert('Import réussi ✅ — rechargement.');
      location.reload();
    }catch{
      alert('Fichier invalide 🤕');
    }finally{ e.target.value=''; }
  });

  // --- Reset total
  document.getElementById('btnReset')?.addEventListener('click', ()=>{
    if(!confirm('Tout réinitialiser (plan + calendrier + extras) ?')) return;
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(CAL_STORAGE);
    location.reload();
  });

  /* === Mini API accessible depuis les autres pages === */
  window.V5 = {
    getState,
    saveState,
    dayLabel(i){ return ['','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]; },
    ensureProgramB(){
      const s=getState(); if(!s.programB) s.programB = {};
      saveState(s); return s;
    },
    copyAtoB(){
      const s=getState(); if(s.programA){ s.programB = JSON.parse(JSON.stringify(s.programA)); saveState(s); alert('Programme A copié vers B ✅'); }
    },
    copyBtoA(){
      const s=getState(); if(s.programB){ s.programA = JSON.parse(JSON.stringify(s.programB)); saveState(s); alert('Programme B copié vers A ✅'); }
    }
  };
})();
