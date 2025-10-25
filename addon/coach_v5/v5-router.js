/* v5-router.js — pages additionnelles sans casser la V4 */
(function(){
  const SUB = document.getElementById('subview');
  const NAV = document.getElementById('v5-nav');
  const TABS = NAV ? NAV.querySelectorAll('.tab') : [];
  const STATE_KEY = 'coach_v4_state';
  const CAL_STORAGE = 'coach_v4_calendar';

  const routes = {
    '#/plan':     { file: null },
    '#/encyclo':  { file: 'pages/encyclo.html', js: 'pages/encyclo.js' },
    '#/lexique':  { file: 'pages/lexique.html' },
    '#/reglages': { file: 'pages/reglages.html' }
  };

  function setActive(hash){
    TABS.forEach(a => a.classList.toggle('active', a.getAttribute('href')===hash));
  }

  async function load(hash){
    const r = routes[hash] || routes['#/plan'];
    setActive(hash);
    if(!SUB) return;
    if(!r.file){ SUB.innerHTML=''; return; }
    try{
      const resp = await fetch(r.file, {cache:'no-store'});
      SUB.innerHTML = await resp.text();
      if(r.js){
        const s = document.createElement('script');
        s.src = r.js + '?v=' + Date.now();
        s.defer = true;
        SUB.appendChild(s);
      }
    }catch(e){
      SUB.innerHTML = `<div class="card"><h2>Erreur</h2><p>Impossible de charger ${r.file}</p></div>`;
    }
  }
  window.addEventListener('hashchange', ()=>load(location.hash||'#/plan'));
  load(location.hash||'#/plan');

  // Export / Import / Reset (réutilise l’état V4)
  document.getElementById('v5-export')?.addEventListener('click', ()=>{
    const data = localStorage.getItem(STATE_KEY) || '{}';
    const url = URL.createObjectURL(new Blob([data], {type:'application/json'}));
    const a = document.createElement('a'); a.href=url; a.download='coach_v4_state.json'; a.click(); URL.revokeObjectURL(url);
  });
  document.getElementById('v5-import')?.addEventListener('click', ()=> document.getElementById('v5-file').click());
  document.getElementById('v5-file')?.addEventListener('change', async (e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    try{
      const text = await f.text(); JSON.parse(text);
      localStorage.setItem(STATE_KEY, text);
      alert('Import OK'); location.reload();
    }catch{ alert('Fichier invalide'); }
  });
  document.getElementById('v5-reset')?.addEventListener('click', ()=>{
    if(!confirm('Tout réinitialiser (plan + calendrier + extras) ?')) return;
    localStorage.removeItem(STATE_KEY);
    localStorage.removeItem(CAL_STORAGE);
    location.reload();
  });

  // Mini API pour les pages
  window.V5 = {
    getState(){ try{return JSON.parse(localStorage.getItem(STATE_KEY)||'{}');}catch(e){return{};} },
    setState(s){ localStorage.setItem(STATE_KEY, JSON.stringify(s)); },
    dayLabel(i){ return ['','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]; },
    ensureProgramB(){
      const s=this.getState(); if(!s.programB) s.programB = s.programA ? JSON.parse(JSON.stringify(s.programA)) : {};
      this.setState(s); return s;
    },
    copyAtoB(){
      const s=this.getState(); if(s.programA){ s.programB = JSON.parse(JSON.stringify(s.programA)); this.setState(s); alert('Programme A copié vers B ✅');}
    },
    copyBtoA(){
      const s=this.getState(); if(s.programB){ s.programA = JSON.parse(JSON.stringify(s.programB)); this.setState(s); alert('Programme B copié vers A ✅');}
    }
  };
})();
