/* ==========================================================
   COACH V5 — ROUTER (v2 : + plan-b, + programs)
========================================================== */
(function(){
  const SUB = document.getElementById('subview');
  const NAV = document.querySelector('.nav-tabs');
  const TABS = NAV ? NAV.querySelectorAll('.tab') : [];

  const STATE_KEY   = 'coach_v5_state';
  const CAL_STORAGE = 'coach_v5_calendar';

  const routes = {
    '#/plan':     { file: 'pages/plan.html' },
    '#/plan-b':   { file: 'pages/planB.html' },
    '#/encyclo':  { file: 'pages/encyclo.html',  js: 'pages/encyclo.js' },
    '#/programs': { file: 'pages/programs.html', js: 'pages/programs.js' },
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

  // === Export/Import/Reset (barre du haut)
  document.getElementById('btnExport')?.addEventListener('click', ()=>{
    const data = localStorage.getItem(STATE_KEY) || '{}';
    const url = URL.createObjectURL(new Blob([data], { type:'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'coach_v5_state.json'; a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('btnImport')?.addEventListener('click', ()=> 
    document.getElementById('fileImport')?.click()
  );
  document.getElementById('fileImport')?.addEventListener('change', async (e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    try{
      const text = await f.text();
      JSON.parse(text);
      localStorage.setItem(STATE_KEY, text);
      alert('Import réussi ✅ — rechargement.');
      location.reload();
    }catch{
      alert('Fichier invalide 🤕');
    }finally{ e.target.value=''; }
  });

  document.getElementById('btnReset')?.addEventListener('click', ()=>{
    if(!confirm('Tout réinitialiser (plan + calendrier + extras) ?')) return;
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(CAL_STORAGE);
    location.reload();
  });

  // === API minimale pour les sous-pages
  window.V5 = {
    getState(){ try{ return JSON.parse(localStorage.getItem(STATE_KEY)||'{}'); }catch(e){ return {}; } },
    saveState(s){ localStorage.setItem(STATE_KEY, JSON.stringify(s)); },
    dayLabel(i){ return ['','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]; },
    copyAtoB(){
      const s=this.getState(); if(s.programA){ s.programB = JSON.parse(JSON.stringify(s.programA)); this.saveState(s); alert('Programme A copié vers B ✅'); }
    },
    copyBtoA(){
      const s=this.getState(); if(s.programB){ s.programA = JSON.parse(JSON.stringify(s.programB)); this.saveState(s); alert('Programme B copié vers A ✅'); }
    }
  };
})();
