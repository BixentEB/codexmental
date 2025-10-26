/* ==========================================================
   COACH V5 — ROUTER (v3)
   - Routing + Export/Import/Reset
   - Seed Programme A (v4) si vide
   - Garde-fou anti double initialisation
========================================================== */
(function(){
  if (window.__V5_ROUTER_INIT__) return;           // anti double-bind
  window.__V5_ROUTER_INIT__ = true;

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

  // === Helpers état ===
  function getState(){ try{ return JSON.parse(localStorage.getItem(STATE_KEY)||'{}'); }catch(e){ return {}; } }
  function saveState(s){ localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

  // === Export/Import/Reset
  document.getElementById('btnExport')?.addEventListener('click', ()=>{
    const data = localStorage.getItem(STATE_KEY) || '{}';
    const url = URL.createObjectURL(new Blob([data], { type:'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'coach_v5_state.json'; a.click();
    URL.revokeObjectURL(url);
  });

  document.getElementById('btnImport')?.addEventListener('click', ()=>{
    document.getElementById('fileImport')?.click();
  });

  document.getElementById('fileImport')?.addEventListener('change', async (e)=>{
    const f=e.target.files?.[0]; if(!f) return;
    try{
      const text = await f.text();
      JSON.parse(text);                         // validation
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

  // === Seed Programme A (reprend ta v4) — seulement si A est vide
  function ensureSeed(){
    const s = getState();
    if (s.programA && Object.keys(s.programA).length) return; // déjà rempli

    // util
    const muscu = (name, vals) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g,'_'), name, type:'muscu', vals });
    const cardio= (name, vals) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g,'_'), name, type:'cardio', vals });
    const tibo  = (name, vals) => ({ id: 'tibo_extrm', name, type:'tibo', vals });
    const core  = (name, vals) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g,'_'), name, type:'core', vals });

    s.programA = {
      1: { type:'full', items: [ // Lundi — A
        muscu('Développé couché barre', { sets:4, reps:10, tempo:'2-1-1', rpe:7.5, load:'10–20kg', rest:'90s' }),
        muscu('Goblet Squat',           { sets:4, reps:15, tempo:'3-1-1', rpe:7,   load:'5kg',     rest:'90s' }),
        muscu('Rowing barre penché',    { sets:4, reps:12, tempo:'2-1-2', rpe:7,   load:'15–20kg', rest:'90s' }),
        muscu('Soulevé de terre JT',    { sets:3, reps:12, tempo:'3-1-1', rpe:7,   load:'15–20kg', rest:'90s' }),
        muscu('Pompes sur genoux',      { sets:3, reps:15, tempo:'2-1-1', rpe:6.5, load:'PDC',     rest:'90s' }),
        muscu('Crunch au sol',          { sets:3, reps:20, tempo:'2-1-2', rpe:6,   load:'PDC',     rest:'60s' }),
        core ('Planche',                 { sets:3, sec:40,  rpe:6 })
      ]},
      2: { type:'cardio', items: [      // Mardi — Cardio + TIBO
        cardio('Séance fractionnée douce', { total:40, wu:5, cd:5, bloc:'Marche 4’ + Run 1’ × 6' }),
        tibo('TIBO Extrm',                 { total:36, wu:5, cd:5, bloc:'3’/3’ × 5' })
      ]},
      3: { type:'full', items: [        // Mercredi — B
        muscu('Développé haltères au sol', { sets:4, reps:12, tempo:'2-1-2', rpe:7,   load:'3kg/haltère', rest:'90s' }),
        muscu('Squat PDC dynamique',       { sets:4, reps:20, tempo:'2-1-1', rpe:7,   load:'PDC',          rest:'90s' }),
        muscu('Rowing haltère 1 bras',     { sets:3, reps:15, tempo:'2-1-2', rpe:7,   load:'3–5kg',        rest:'90s' }),
        muscu('Hip Thrust sur banc',       { sets:3, reps:15, tempo:'2-1-1', rpe:7,   load:'PDC/charge',   rest:'90s' }),
        muscu('Élévations latérales',      { sets:3, reps:20, tempo:'2-1-1', rpe:6,   load:'3kg',          rest:'60s' }),
        muscu('Crunch jambes levées',      { sets:3, reps:20, tempo:'2-1-2', rpe:6,   load:'PDC',          rest:'60s' }),
        core ('Gainage genoux relevés',     { sets:3, sec:40,  rpe:6 })
      ]},
      4: { type:'cardio', items: [      // Jeudi — Cardio
        cardio('Séance fractionnée douce', { total:40, wu:5, cd:5, bloc:'Marche 4’ + Run 1’ × 6' })
      ]},
      5: { type:'full', items: [        // Vendredi — C
        muscu('Développé militaire assis', { sets:4, reps:10, tempo:'2-1-1', rpe:7,   load:'3–5kg',     rest:'90s' }),
        muscu('Front Squat avec barre',    { sets:4, reps:12, tempo:'3-1-1', rpe:7.5, load:'10–20kg',  rest:'90s' }),
        muscu('Tirage menton (barre)',     { sets:3, reps:12, tempo:'2-1-2', rpe:7,   load:'10–15kg',  rest:'90s' }),
        muscu('Fentes arrière',            { sets:3, reps:10, tempo:'2-1-1', rpe:7,   load:'PDC/haltères', rest:'90s' }),
        muscu('Pompes inclinées',          { sets:3, reps:12, tempo:'2-1-1', rpe:6.5, load:'PDC',      rest:'90s' }),
        muscu('Crunch avec rotation',      { sets:3, reps:20, tempo:'2-1-2', rpe:6,   load:'PDC',      rest:'60s' }),
        core ('Planche + soulèvement bras', { sets:3, sec:30,  rpe:6 })
      ]},
      6: { type:'cardio', items: [      // Samedi — Cardio libre (+ option TIBO via réglages si tu veux)
        cardio('Cardio libre', { total:30, wu:5, cd:5, bloc:'À la carte' })
      ]},
      7: { type:'off', items: [] }      // Dimanche — OFF
    };

    saveState(s);
  }
  ensureSeed();

  // === API minimale dispo pour les sous-pages
  window.V5 = {
    getState, saveState,
    dayLabel(i){ return ['','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]; },
    copyAtoB(){
      const s=this.getState(); if(s.programA){ s.programB = JSON.parse(JSON.stringify(s.programA)); this.saveState(s); alert('Programme A copié vers B ✅'); }
    },
    copyBtoA(){
      const s=this.getState(); if(s.programB){ s.programA = JSON.parse(JSON.stringify(s.programB)); this.saveState(s); alert('Programme B copié vers A ✅'); }
    }
  };
})();
