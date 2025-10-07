// --- Données d'exercices (cat, equip, space, alternatives) ---
const EXO_DB = [
  { id:'bench', name:'Développé couché — barre', cat:'upper', equip:'barre', space:'standard', station:'barre+banc+disques',
    sets:3, reps:'8-12', rest:75, timePerRep:3,
    tips:'Trajectoire légère diagonale vers le bas des pecs. Omoplates serrées, pieds ancrés.',
    alt:[
      {id:'pushup', name:'Pompes au sol', equip:'poids_corps', space:'faible'},
      {id:'db_press', name:'Développé haltères — banc', equip:'haltères', space:'standard'},
      {id:'dip_chair', name:'Dips entre chaises', equip:'poids_corps', space:'faible'}
    ]
  },
  { id:'fly', name:'Écartés haltères — banc', cat:'upper', equip:'haltères', space:'standard', station:'haltères+banc',
    sets:3, reps:'10-12', rest:60, timePerRep:3,
    tips:'Amplitude contrôlée, coudes souples. Option : papillon du banc.',
    alt:[
      {id:'pec_deck', name:'Papillon du banc', equip:'banc', space:'standard'},
      {id:'pushup_wide', name:'Pompes larges', equip:'poids_corps', space:'faible'}
    ]
  },
  { id:'row', name:'Rowing barre penché', cat:'upper', equip:'barre', space:'standard', station:'barre+disques (debout)',
    sets:3, reps:'10-12', rest:75, timePerRep:3,
    tips:'Buste ~45°, tire vers l’ombilic, omoplates qui se rapprochent.',
    alt:[
      {id:'db_row', name:'Rowing unilatéral — haltère', equip:'haltères', space:'standard'},
      {id:'inverted_row', name:'Tirage sous table (inversé)', equip:'poids_corps', space:'faible'}
    ]
  },
  { id:'ohp', name:'Développé militaire — assis', cat:'upper', equip:'haltères', space:'standard', station:'haltères+banc',
    sets:3, reps:'8-12', rest:75, timePerRep:3,
    tips:'Tronc gainé, ne casse pas les poignets, redescends sous contrôle.',
    alt:[
      {id:'pike_pushup', name:'Pompes pike', equip:'poids_corps', space:'faible'},
      {id:'landmine_press', name:'Presse à terre (barre coin)', equip:'barre', space:'faible'}
    ]
  },
  { id:'curl', name:'Curl biceps (barre ou haltères)', cat:'upper', equip:'haltères', space:'faible', station:'haltères (debout)',
    sets:3, reps:'10-12', rest:60, timePerRep:3,
    tips:'Coudes près du corps, pas d’élan. Excentrique contrôlée.',
    alt:[
      {id:'hammer', name:'Curl marteau', equip:'haltères', space:'faible'},
      {id:'towel_curl', name:'Curl isométrique serviette', equip:'poids_corps', space:'faible'}
    ]
  },
  { id:'skull', name:'Triceps : barre front', cat:'upper', equip:'barre', space:'standard', station:'barre+banc+disques',
    sets:3, reps:'10-12', rest:60, timePerRep:3,
    tips:'Coudes fixes, descends derrière le front puis extension complète.',
    alt:[
      {id:'bench_dip', name:'Dips banc', equip:'banc', space:'faible'},
      {id:'oh_triceps', name:'Triceps au-dessus tête — haltère', equip:'haltères', space:'faible'}
    ]
  },
  { id:'plank', name:'Gainage planche', cat:'upper', equip:'poids_corps', space:'faible', station:'poids du corps (tapis)',
    sets:3, reps:'30-45s', rest:45, timePerRep:1,
    tips:'Coudes sous épaules, bassin neutre.',
    alt:[
      {id:'plank_knee', name:'Planche sur genoux', equip:'poids_corps', space:'faible'}
    ]
  },
  // Lower
  { id:'squat', name:'Squat (barre ou poids du corps)', cat:'lower', equip:'barre', space:'standard', station:'barre+disques (debout)',
    sets:3, reps:'10-15', rest:75, timePerRep:3,
    tips:'Descends en poussant les hanches en arrière, genoux suivent la pointe.',
    alt:[
      {id:'goblet', name:'Goblet squat — haltère', equip:'haltères', space:'faible'},
      {id:'chair_squat', name:'Squat à la chaise', equip:'poids_corps', space:'faible'}
    ]
  },
  { id:'lunge', name:'Fentes avant — haltères', cat:'lower', equip:'haltères', space:'standard', station:'haltères (debout)',
    sets:3, reps:'10/jamb', rest:60, timePerRep:3,
    tips:'Grand pas, torse vertical, pousse dans le talon avant.',
    alt:[
      {id:'rev_lunge', name:'Fentes arrière', equip:'poids_corps', space:'faible'},
      {id:'step_up', name:'Montées sur marche', equip:'poids_corps', space:'faible'}
    ]
  },
  { id:'legext', name:'Extension jambes — levier du banc', cat:'lower', equip:'banc', space:'standard', station:'banc (levier)',
    sets:3, reps:'12-15', rest:60, timePerRep:3,
    tips:'Tends sans verrouiller. Pause 1s en haut, redescends en 3s.',
    alt:[
      {id:'sissy', name:'Sissy squat tenu', equip:'poids_corps', space:'faible'},
      {id:'wall_sit', name:'Chaise au mur (isométrique)', equip:'poids_corps', space:'faible'}
    ]
  },
  { id:'rdl', name:'Soulevé de terre jambes tendues', cat:'lower', equip:'barre', space:'standard', station:'barre+disques (debout)',
    sets:3, reps:'12', rest:75, timePerRep:3,
    tips:'Charnière de hanches, barre proche des jambes, dos plat.',
    alt:[
      {id:'db_rdl', name:'RDL haltères', equip:'haltères', space:'faible'},
      {id:'hip_hinge', name:'Hip hinge au bâton', equip:'poids_corps', space:'faible'}
    ]
  },
  { id:'hip', name:'Hip Thrust / Pont fessier — barre', cat:'lower', equip:'barre', space:'standard', station:'barre+banc+disques',
    sets:3, reps:'12', rest:60, timePerRep:3,
    tips:'Aligne épaules-hanches-genoux, tension continue.',
    alt:[
      {id:'glute_bridge', name:'Pont fessier au sol', equip:'poids_corps', space:'faible'},
      {id:'single_glute', name:'Pont fessier une jambe', equip:'poids_corps', space:'faible'}
    ]
  },
  // Warm / Stretch (quelques entrées)
  { id:'jj', name:'Jumping jacks', cat:'warm', equip:'poids_corps', space:'faible', station:'poids du corps (tapis)', sets:2, reps:'30s', rest:30, timePerRep:1, tips:'Impact léger, genoux souples.', alt:[] },
  { id:'mob', name:'Mobilité épaules & hanches', cat:'warm', equip:'poids_corps', space:'faible', station:'poids du corps (tapis)', sets:1, reps:'1-2min', rest:0, timePerRep:1, tips:'Recherche la fluidité.', alt:[] },
  { id:'chest_st', name:'Étirement pectoraux au mur', cat:'stretch', equip:'poids_corps', space:'faible', station:'poids du corps (tapis)', sets:1, reps:'20-30s', rest:0, timePerRep:1, tips:'Ouvre doucement la poitrine.', alt:[] },
  { id:'hams_st', name:'Ischios — assis', cat:'stretch', equip:'poids_corps', space:'faible', station:'poids du corps (tapis)', sets:1, reps:'20-30s', rest:0, timePerRep:1, tips:'Dos long, penche depuis les hanches.', alt:[] },
];

// --- Helpers ---
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>[...root.querySelectorAll(q)];

function pickByMode(mode){
  if(mode==='full') return EXO_DB.filter(x=>x.cat==='upper' || x.cat==='lower').slice(0);
  return EXO_DB.filter(x=>x.cat===mode);
}
function filterByConstraints(list, equip, space){
  return list.filter(x=>(equip==='all'||x.equip===equip||x.alt.some(a=>a.equip===equip)) && (space===x.space || space==='standard' || x.space==='faible'));
}

function estimateDurationSec(plan, sets, reps, rest){
  // reps might be range like "8-12" or "30s"; simplify
  let repN = parseInt(String(reps).split(/[-/s]/)[0],10);
  if(Number.isNaN(repN)) repN = 10;
  let total = 0;
  for(const ex of plan){
    const tRep = ex.timePerRep || 3;
    const s = sets;
    const perSet = (repN * tRep) + 30 /*setup approx*/ + rest;
    total += s * perSet;
  }
  return Math.round(total);
}

function fmtTime(sec){
  const m = Math.floor(sec/60), s= sec%60;
  return `${m}m ${String(s).padStart(2,'0')}s`;
}

function numberInput(min, max, val, step=1){
  const i = document.createElement('input');
  i.type='number'; i.min=min; i.max=max; i.value=val; i.step=step;
  i.className='';
  return i;
}

// --- UI Build ---
const listEl = $('#exerciseList');
const kDur = $('#kDur'), kVol=$('#kVol'), kRpe=$('#kRpe');
const logEl = $('#log');

function buildCard(ex){
  const det = document.createElement('details');
  det.className='card';
  det.dataset.id = ex.id;
  det.innerHTML = `
    <summary>
      <span class="badge">${ex.sets} × ${ex.reps}</span>
      <span class="name">${ex.name}</span>
      <span class="plus" aria-hidden="true">+</span>
    </summary>
    <div class="content">
      <div class="row">
        <div class="tips">${ex.tips||''}</div>
        <div class="alt" role="group" aria-label="Alternatives">
          ${ex.alt.map(a=>`<button class="chip" data-replace="${a.id}">${a.name}</button>`).join('') || '<span class="tips">Aucune alternative listée</span>'}
        </div>
      </div>
      <form class="form" onsubmit="return false">
        <div class="rowx">
          <label>Séries<br><input name="sets" type="number" min="1" max="5" value="${ex.sets}"></label>
          <label>Reps<br><input name="reps" type="number" min="1" max="30" value="${parseInt(String(ex.reps),10)||10}"></label>
          <label>Repos (s)<br><input name="rest" type="number" min="15" max="240" value="${ex.rest}"></label>
          <label>Charge (kg)<br><input name="kg" type="number" min="0" max="300" step="0.5" value="0"></label>
          <label>RPE (0–10)<br><input name="rpe" type="number" min="0" max="10" step="0.5" value="6"></label>
          <div style="align-self:end;display:flex;gap:8px;justify-content:flex-end">
            <button class="btn ghost act-calc">Calculer</button>
            <button class="btn act-add">Valider exo</button>
          </div>
        </div>
        <div class="tips js-est">Durée estimée pour cet exo : — • Volume : —</div>
      </form>
    </div>
  `;
  // interactions
  det.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-replace]');
    if(btn){
      const replId = btn.dataset.replace;
      const alt = EXO_DB.find(x=>x.id===replId);
      if(alt){
        // Remplacer le titre + badge + meta dans la carte courante
        det.querySelector('.name').textContent = alt.name;
        det.querySelector('.badge').textContent = `${alt.sets} × ${alt.reps}`;
        det.dataset.id = alt.id;
        det.querySelector('.tips').textContent = alt.tips || '';
        // rebuild alternatives list of the new exercise
        det.querySelector('.alt').innerHTML = alt.alt.map(a=>`<button class="chip" data-replace="${a.id}">${a.name}</button>`).join('') || '<span class="tips">Aucune alternative listée</span>';
        // reset form defaults
        det.querySelector('input[name=sets]').value = alt.sets;
        det.querySelector('input[name=reps]').value = parseInt(String(alt.reps),10)||10;
        det.querySelector('input[name=rest]').value = alt.rest;
        det.querySelector('.js-est').textContent = 'Durée estimée pour cet exo : — • Volume : —';
      }
      e.preventDefault();
    }
  });

  const form = det.querySelector('form');
  form.querySelector('.act-calc').addEventListener('click', ()=>{
    const v = getFormVals(form);
    const t = estimateDurationSec([ex], v.sets, v.reps, v.rest);
    const vol = v.kg * v.reps * v.sets;
    det.querySelector('.js-est').textContent = `Durée estimée pour cet exo : ${fmtTime(t)} • Volume : ${vol} kg·rep • RPE ${v.rpe}`;
  });
  form.querySelector('.act-add').addEventListener('click', ()=>{
    const v = getFormVals(form);
    saveEntry(det.dataset.id, det.querySelector('.name').textContent, v);
    toast(`Enregistré : ${det.querySelector('.name').textContent} (${v.sets}×${v.reps} @ ${v.kg}kg, RPE ${v.rpe})`);
    updateSummary();
  });

  return det;
}

function getFormVals(form){
  return {
    sets: clamp(parseInt(form.sets.value,10),1,5),
    reps: clamp(parseInt(form.reps.value,10),1,60),
    rest: clamp(parseInt(form.rest.value,10),15,240),
    kg: Math.max(0, parseFloat(form.kg.value)||0),
    rpe: clamp(parseFloat(form.rpe.value)||0,0,10)
  };
}
function clamp(n,min,max){ return Math.min(max, Math.max(min, n)); }
function orderPlan(list, strategy, mode){
  if(strategy==='balanced'){
    return list;
  }
  if(strategy==='min_switch'){
    const prio = [
      'barre+banc+disques',
      'haltères+banc',
      'barre+disques (debout)',
      'banc (levier)',
      'haltères (debout)',
      'poids du corps (tapis)'
    ];
    const idx = s => {
      const i = prio.indexOf(s||'');
      return i === -1 ? 999 : i;
    };
    return list.slice().sort((a,b)=>{
      const da = idx(a.station), db = idx(b.station);
      if(da!==db) return da-db;
      const pushNames = ['Développé','Écartés','Hip Thrust','Extension'];
      const isPush = x => pushNames.some(k=> (x.name||'').includes(k));
      if(isPush(a) !== isPush(b)) return isPush(a) ? -1 : 1;
      return 0;
    });
  }
  if(strategy==='pushpull'){
    const pushK = ['Développé','Écartés','Pompes','Hip Thrust','Extension'];
    const pullK = ['Rowing','Soulevé','Curl','Tirage','Good Morning','Gainage'];
    const score = (x)=> (pushK.some(k=>x.name.includes(k))?0 : (pullK.some(k=>x.name.includes(k))?1:2));
    return list.slice().sort((a,b)=>{
      const da=score(a), db=score(b);
      if(da!==db) return da-db;
      if(a.station!==b.station) return (a.station||'').localeCompare(b.station||'');
      return 0;
    });
  }
  return list;
}


function buildPlan(){
  const mode = $('#mode').value;
  const nb = clamp(parseInt($('#nbExo').value,10),1,12);
  const sets = clamp(parseInt($('#sets').value,10),1,5);
  const reps = clamp(parseInt($('#reps').value,10),1,30);
  const rest = clamp(parseInt($('#rest').value,10),15,240);
  const space = $('#space').value;
  const equip = $('#equip').value;

    const order = $('#order').value;
  // pick pool by mode then filter by constraints then slice nb unique
  let pool = pickByMode(mode);
  pool = filterByConstraints(pool, equip, space);

  // Ensure representation of both chains in full‑body
  if(mode==='full'){
    const upp = pool.filter(x=>x.cat==='upper');
    const low = pool.filter(x=>x.cat==='lower');
    const plan = [];
    let i=0;
    while(plan.length<nb && (upp.length || low.length)){
      if(i%2===0 && upp.length) plan.push(upp.shift());
      else if(low.length) plan.push(low.shift());
      i++;
    }
    renderPlan(orderPlan(plan, order, mode), sets, reps, rest);
  } else {
    renderPlan(orderPlan(pool.slice(0,nb), order, mode), sets, reps, rest);
  }
}

function renderPlan(list, sets, reps, rest){
  listEl.innerHTML='';
  list.forEach(ex=>{
    const card = buildCard(ex);
    // override default badge to reflect global choices
    card.querySelector('.badge').textContent = `${sets} × ${reps}`;
    card.querySelector('input[name=sets]').value = sets;
    card.querySelector('input[name=reps]').value = reps;
    card.querySelector('input[name=rest]').value = rest;
    listEl.appendChild(card);
  });
  // update duration estimate for whole plan
  const t = estimateDurationSec(list, sets, reps, rest);
  kDur.textContent = fmtTime(t);
  kVol.textContent = '—';
  kRpe.textContent = '—';
  logEl.textContent = '';
}

// --- Persistance (localStorage) ---
const KEY = 'coach_session_v1';

function loadAll(){
  try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(e){ return []; }
}
function saveAll(arr){
  localStorage.setItem(KEY, JSON.stringify(arr));
}
function saveEntry(id, name, vals){
  const all = loadAll();
  const row = {
    ts: new Date().toISOString(),
    id, name,
    sets: vals.sets, reps: vals.reps, rest: vals.rest,
    kg: vals.kg, rpe: vals.rpe,
    volume: vals.kg * vals.reps * vals.sets
  };
  all.push(row);
  saveAll(all);
}

function updateSummary(){
  const all = loadAll();
  if(!all.length){
    kVol.textContent = '—'; kRpe.textContent='—';
    logEl.textContent = 'Aucune saisie pour cette séance.';
    return;
  }
  const totalVol = all.reduce((a,b)=>a+b.volume,0);
  const avgRpe = (all.reduce((a,b)=>a+b.rpe,0) / all.length).toFixed(1);
  kVol.textContent = `${Math.round(totalVol)} kg·rep`;
  kRpe.textContent = `${avgRpe}`;

  const lines = all.slice(-12).map(r=>`• ${new Date(r.ts).toLocaleTimeString()} — ${r.name}: ${r.sets}×${r.reps} @ ${r.kg}kg (RPE ${r.rpe}) → ${Math.round(r.volume)} kg·rep`);
  logEl.textContent = lines.join('\n');
}

function exportCSV(){
  const all = loadAll();
  if(!all.length){ toast('Rien à exporter'); return; }
  const head = ['timestamp','id','name','sets','reps','rest','kg','rpe','volume'];
  const rows = all.map(r=>[r.ts,r.id,`"${r.name.replace(/"/g,'""')}"`,r.sets,r.reps,r.rest,r.kg,r.rpe,r.volume].join(','));
  const csv = [head.join(','), ...rows].join('\n');
  const blob = new Blob([csv], {type:'text/csv'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `seance-${new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function resetAll(){
  localStorage.removeItem(KEY);
  updateSummary();
  toast('Séance réinitialisée');
}

function toast(msg){
  console.log(msg);
}

// --- Wire ---
$('#btnBuild').addEventListener('click', buildPlan);
$('#btnSave').addEventListener('click', updateSummary);
$('#btnCsv').addEventListener('click', exportCSV);
$('#btnReset').addEventListener('click', resetAll);

// initial render
buildPlan();
updateSummary();
