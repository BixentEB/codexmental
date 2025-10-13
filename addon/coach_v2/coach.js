// ===== Données d'exercices =====
const CATS = [
  {name:'Échauffement', color:'c1'},
  {name:'Haut du corps', color:'c2'},
  {name:'Bas du corps', color:'c3'},
  {name:'Core/Abdos', color:'c4'},
  {name:'Étirements', color:'c5'}
];
const EXOS = {
  'Échauffement': [
    {name:'Jumping jacks', gear:'PDC', muscles:'Cardio, épaules, hanches', desc:"Ouverture dynamique corps entier.", mode:'time', base:{time:45, sets:2}},
    {name:'Corde à sauter (ou simulée)', gear:'PDC', muscles:'Mollets, cardio', desc:"Sauts rythmés, pieds légers.", mode:'time', base:{time:60, sets:2}},
    {name:'Mobilité épaules (bâton/serviette)', gear:'Bâton/Serviette', muscles:'Épaules, poitrine', desc:"Amplitude sans douleur.", mode:'reps', base:{reps:12, sets:2}},
    {name:'Squats PDC (pré‑activation)', gear:'PDC', muscles:'Quadriceps, fessiers', desc:"Squat profond, talons au sol.", mode:'reps', base:{reps:12, sets:2}}
  ],
  'Haut du corps': [
    {name:'Développé couché — barre', gear:'Barre + banc', muscles:'Pecs, triceps, épaules', desc:'Pieds ancrés, trajectoire en J.', mode:'reps', base:{weight:10,reps:8,sets:3,rpe:7}},
    {name:'Développé haltères — banc', gear:'Haltères + banc', muscles:'Pecs, triceps', desc:'Poignets neutres, amplitude contrôlée.', mode:'reps', base:{weight:6,reps:10,sets:3,rpe:7}},
    {name:'Écartés haltères — banc', gear:'Haltères + banc', muscles:'Pectoraux (ouverture)', desc:'Coudes souples, grand étirement.', mode:'reps', base:{weight:4,reps:12,sets:3,rpe:7}},
    {name:'Rowing barre penché', gear:'Barre', muscles:'Dos, biceps, lombaires', desc:'Dos à 45°, tirage nombril.', mode:'reps', base:{weight:10,reps:10,sets:3,rpe:7}},
    {name:'Développé militaire — assis', gear:'Barre/Haltères + banc', muscles:'Épaules, triceps', desc:'Trajectoire verticale.', mode:'reps', base:{weight:6,reps:8,sets:3,rpe:7}},
    {name:'Curl biceps (haltères) / marteau', gear:'Haltères', muscles:'Biceps, brachial', desc:'Coudes fixes, montée contrôlée.', mode:'reps', base:{weight:6,reps:10,sets:3,rpe:7}},
    {name:'Triceps — barre front', gear:'Barre', muscles:'Triceps', desc:'Coudes serrés, descente au front.', mode:'reps', base:{weight:0,reps:12,sets:3,rpe:7}},
    {name:'Pompes au sol', gear:'PDC', muscles:'Pecs, triceps, core', desc:'Poitrine proche du sol.', mode:'reps', base:{reps:12,sets:3,rpe:6}}
  ],
  'Bas du corps': [
    {name:'Squat (barre ou PDC)', gear:'Barre / PDC', muscles:'Quadriceps, fessiers', desc:'Genoux suivent orteils, dos neutre.', mode:'reps', base:{weight:8,reps:10,sets:3,rpe:7}},
    {name:'Goblet squat — haltère', gear:'Haltère', muscles:'Quadriceps, fessiers', desc:'Haltère contre poitrine, buste droit.', mode:'reps', base:{weight:8,reps:10,sets:3,rpe:7}},
    {name:'Soulevé de terre jambes tendues', gear:'Barre', muscles:'Ischios, fessiers, lombaires', desc:"Hanches en arrière, étirement ischios.", mode:'reps', base:{weight:12,reps:8,sets:3,rpe:7}},
    {name:'Pont fessier au sol', gear:'PDC', muscles:'Fessiers', desc:'Rétroversion, contraction en haut.', mode:'reps', base:{reps:15,sets:3,rpe:7}},
    {name:'Chaise au mur (isométrique)', gear:'Mur', muscles:'Quadriceps', desc:'Cuisses // au sol, dos plaqué.', mode:'time', base:{time:40,sets:3,rpe:7}},
    {name:'Fentes avant — haltères', gear:'Haltères', muscles:'Quadriceps, fessiers', desc:'Grand pas, contrôle redescente.', mode:'reps', base:{weight:6,reps:10,sets:3,rpe:7}}
  ],
  'Core/Abdos': [
    {name:'Planche sur genoux', gear:'Tapis', muscles:'Transverse, grand droit', desc:'Gainage neutre, respiration basse.', mode:'time', base:{time:20,sets:3}},
    {name:'Gainage planche', gear:'Tapis', muscles:'Tronc', desc:'Progresser par paliers de 5s.', mode:'time', base:{time:20,sets:3}},
    {name:'Crunch contrôlé', gear:'Tapis', muscles:'Grand droit', desc:'Regard plafond, montée courte.', mode:'reps', base:{reps:15,sets:3}},
    {name:'Hollow hold (banane)', gear:'Tapis', muscles:'Transverse', desc:'Bas du dos plaqué.', mode:'time', base:{time:12,sets:3}}
  ],
  'Étirements': [
    {name:'Étirement pectoraux au mur', gear:'Mur', muscles:'Pectoraux', desc:'Bras à 90°, pivoter doucement.', mode:'time', base:{time:30,sets:1}},
    {name:'Étirement ischios — assis', gear:'Tapis', muscles:'Ischios', desc:'Dos droit, flexion hanche.', mode:'time', base:{time:30,sets:1}},
    {name:'Étirement quadriceps — debout', gear:'—', muscles:'Quadriceps', desc:'Attraper cheville, genou sous hanche.', mode:'time', base:{time:30,sets:1}},
    {name:'Étirement fléchisseurs de hanches', gear:'Tapis', muscles:'Psoas', desc:'Fente genou au sol, rétroversion.', mode:'time', base:{time:30,sets:1}}
  ]
};

// ===== Utilitaires =====
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>[...root.querySelectorAll(q)];
const today = ()=> new Date().toISOString().slice(0,10);
const KEY = 'journal_fullbody_v1';

function save(data){localStorage.setItem(KEY, JSON.stringify(data));}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{items:[]}}catch{return {items:[]}}}
const journal = load();

// ===== Construire le catalogue =====
function buildCatalogue(){
  const host = $('#catList'); host.innerHTML='';
  const q = ($('#q').value||'').toLowerCase();
  CATS.forEach((c,i)=>{
    const det=document.createElement('details'); det.className='cat'; det.open = i===0; // première catégorie ouverte
    det.innerHTML = `<summary><span class="badge"><span class="dot ${c.color}"></span>${c.name}</span></summary>`;
    const items=document.createElement('div'); items.className='items';
    (EXOS[c.name]||[]).forEach(ex=>{
      if(q && ![ex.name, ex.muscles, ex.gear].join(' ').toLowerCase().includes(q)) return;
      const div=document.createElement('div'); div.className='item';
      div.innerHTML = `
        <div class="itemHead">
          <div>
            <h4>${ex.name}</h4>
            <small>${ex.gear} • Muscles : ${ex.muscles}</small>
          </div>
          <div>
            <button class="pick">Sélectionner</button>
          </div>
        </div>
        <details>
          <summary>+ Détails</summary>
          <div style="padding:6px 0;color:#d7e6ff">${ex.desc}</div>
          <div style="font-size:.85rem;color:#cfe1ff">Mode par défaut : <b>${ex.mode==='reps'?'Répétitions':'Chrono'}</b>. Bases : ${ex.base.weight?`Poids ${ex.base.weight}kg, `:''}${ex.base.reps?`${ex.base.reps} réps, `:''}${ex.base.time?`${ex.base.time}s, `:''}${ex.base.sets||3} séries${ex.base.rpe?`, RPE ${ex.base.rpe}`:''}.</div>
        </details>
      `;
      div.querySelector('.pick').onclick=()=>selectExercise(c.name, ex);
      items.appendChild(div);
    });
    det.appendChild(items); host.appendChild(det);
  });
}
$('#q').addEventListener('input', buildCatalogue);

// ===== Sélection + formulaire =====
function selectExercise(cat, ex){
  $('#fxName').value = `${ex.name}`;
  $('#fxMode').value = ex.mode;
  $('#fxWeight').value = ex.base.weight||0;
  $('#fxReps').value = ex.base.reps||0;
  $('#fxTime').value = ex.base.time||0;
  $('#fxSets').value = ex.base.sets||3;
  $('#fxRpe').value = ex.base.rpe||7;
  $('#fxFeel').value = 'Moyen';
  $('#fxName').dataset.cat = cat; // stocker catégorie
}

$('#fxMode').addEventListener('change', ()=>{
  const isTime = $('#fxMode').value==='time';
  if(isTime){ $('#fxReps').value = 0; } else { $('#fxTime').value = 0; }
});

$('#add').onclick = ()=>{
  const name=$('#fxName').value.trim(); if(!name){alert('Sélectionne un exercice à gauche.'); return;}
  const cat=$('#fxName').dataset.cat||'';
  const mode=$('#fxMode').value;
  const weight=+$('#fxWeight').value||0; const reps=+$('#fxReps').value||0; const time=+$('#fxTime').value||0; const sets=+$('#fxSets').value||0; const rpe=+$('#fxRpe').value||0; const feel=$('#fxFeel').value;
  if(mode==='reps' && reps===0){alert('Renseigne le nombre de répétitions.'); return;}
  if(mode==='time' && time===0){alert('Renseigne le temps en secondes.'); return;}
  const item={date:today(), cat, name, mode, weight, reps, time, sets, rpe, feel, volume: (mode==='reps'?weight*reps*sets:0)};
  journal.items.push(item); save(journal); renderTable();
  // scroll to table
  $('#logTable').scrollIntoView({behavior:'smooth', block:'nearest'});
};

function renderTable(){
  const tbody=$('#logTable tbody'); tbody.innerHTML='';
  let vol=0; const fmt=n=>new Intl.NumberFormat('fr-FR').format(n);
  journal.items.forEach((it,i)=>{
    vol+=it.volume||0;
    const tr=document.createElement('tr');
    tr.innerHTML = `<td>${it.date}</td><td>${it.cat||''}</td><td>${it.name}</td><td>${it.mode}</td><td>${it.weight||0}</td><td>${it.reps||0}</td><td>${it.time||0}</td><td>${it.sets||0}</td><td>${it.rpe||0}</td><td>${it.feel||''}</td><td>${fmt(it.volume||0)}</td><td class='rowActions'><button class='btn ghost' data-i='${i}'>Suppr.</button></td>`;
    tr.ondblclick = ()=>{ // recharger dans le formulaire
      $('#fxName').value=it.name; $('#fxName').dataset.cat=it.cat; $('#fxMode').value=it.mode; $('#fxWeight').value=it.weight; $('#fxReps').value=it.reps; $('#fxTime').value=it.time; $('#fxSets').value=it.sets; $('#fxRpe').value=it.rpe; $('#fxFeel').value=it.feel;
      window.scrollTo({top:0,behavior:'smooth'});
    };
    tbody.appendChild(tr);
  });
  $('#volTot').textContent = fmt(vol);
  tbody.onclick=(e)=>{const b=e.target.closest('button'); if(!b) return; const idx=+b.dataset.i; journal.items.splice(idx,1); save(journal); renderTable();};
}

// Export / Import / Clear
$('#exp').onclick=()=>{
  const blob=new Blob([JSON.stringify(journal,null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=`journal-${today()}.json`; a.click(); URL.revokeObjectURL(url);
};
$('#impFile').addEventListener('change', (e)=>{
  const f=e.target.files[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try{ const data=JSON.parse(r.result); if(data && Array.isArray(data.items)){ journal.items=data.items; save(journal); renderTable(); } else alert('Fichier invalide.'); } catch{ alert('JSON invalide.'); } }; r.readAsText(f);
});
$('#clear').onclick=()=>{ if(confirm('Effacer tout le journal ?')){ journal.items=[]; save(journal); renderTable(); } };

// Init
buildCatalogue();
renderTable();
