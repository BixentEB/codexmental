// ------------------------------
// Helpers
// ------------------------------
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>[...root.querySelectorAll(q)];
function clamp(n,min,max){ return Math.min(max, Math.max(min, n)); }

// ------------------------------
// External DB loader (with fallback)
// ------------------------------
const EXO_FALLBACK = [
  { id:'bench', name:'Développé couché — barre', cat:'upper', equip:'barre', space:'standard', station:'barre+banc+disques', sets:3, reps:'8-12', rest:75, timePerRep:3, tips:'Omoplates serrées.', alt:['pushup','db_press'] },
  { id:'row', name:'Rowing barre penché', cat:'upper', equip:'barre', space:'standard', station:'barre+disques (debout)', sets:3, reps:'10-12', rest:75, timePerRep:3, tips:'Buste ~45°.', alt:['db_row'] },
  { id:'squat', name:'Squat (barre ou poids du corps)', cat:'lower', equip:'barre', space:'standard', station:'barre+disques (debout)', sets:3, reps:'10-15', rest:75, timePerRep:3, tips:'Pieds ancrés.', alt:['goblet'] },
  { id:'plank', name:'Gainage planche', cat:'core', equip:'poids_corps', space:'faible', station:'poids du corps (tapis)', sets:3, reps:'30-45s', rest:45, timePerRep:1, tips:'Bassin neutre.', alt:['plank_knee'] },
];
let EXO_DB = EXO_FALLBACK;

async function loadDB(){
  try{
    const res = await fetch('exercises.json', {cache:'no-store'});
    if(!res.ok) throw new Error('HTTP '+res.status);
    const data = await res.json();
    if(Array.isArray(data) && data.length) EXO_DB = data;
  }catch(e){
    console.warn('exercises.json non disponible, fallback utilisé', e);
    EXO_DB = EXO_FALLBACK;
  }
}
function byId(id){ return EXO_DB.find(x=>x.id===id); }

// ------------------------------
// Ordering strategies
// ------------------------------
function orderPlan(list, strategy, mode){
  if(strategy==='balanced') return list;

  if(strategy==='min_switch'){
    const prio = [
      'barre+banc+disques',
      'haltères+banc',
      'barre+disques (debout)',
      'banc (levier)',
      'haltères (debout)',
      'poids du corps (tapis)'
    ];
    const idx = s => { const i = prio.indexOf(s||''); return i === -1 ? 999 : i; };
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

// ------------------------------
// Duration & misc helpers
// ------------------------------
function estimateDurationSec(plan, sets, reps, rest){
  let repN = parseInt(String(reps).split(/[-/s]/)[0],10);
  if(Number.isNaN(repN)) repN = 10;
  let total = 0;
  for(const ex of plan){
    const tRep = ex.timePerRep || 3;
    const s = sets;
    const perSet = (repN * tRep) + 30 + rest; // +30s setup
    total += s * perSet;
  }
  return Math.round(total);
}
function fmtTime(sec){ const m = Math.floor(sec/60), s= sec%60; return `${m}m ${String(s).padStart(2,'0')}s`; }

// ------------------------------
// Persistence
// ------------------------------
const KEY = 'coach_session_v1';
function loadAll(){ try{ return JSON.parse(localStorage.getItem(KEY) || '[]'); }catch(e){ return []; } }
function saveAll(arr){ localStorage.setItem(KEY, JSON.stringify(arr)); }
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

// ------------------------------
// UI builders
// ------------------------------
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
          ${(ex.alt||[]).map(aid=>{ const a=typeof aid==='string'?byId(aid):aid; return a?`<button class="chip" data-replace="${a.id}">${a.name}</button>`:''; }).join('') || '<span class="tips">Aucune alternative listée</span>'}
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
        <div class="tips js-est">Durée estimée pour cet exo : — • Volume : —</div>
      </form>
    </div>
  `;
  det.addEventListener('click', (e)=>{
    const btn = e.target.closest('[data-replace]');
    if(btn){
      const replId = btn.dataset.replace;
      const alt = byId(replId);
      if(alt){
        det.querySelector('.name').textContent = alt.name;
        det.querySelector('.badge').textContent = `${alt.sets} × ${alt.reps}`;
        det.dataset.id = alt.id;
        det.querySelector('.tips').textContent = alt.tips || '';
        det.querySelector('.alt').innerHTML = (alt.alt||[]).map(aid=>{ const a=byId(aid); return a?`<button class="chip" data-replace="${a.id}">${a.name}</button>`:''; }).join('') || '<span class="tips">Aucune alternative listée</span>';
        det.querySelector('input[name=sets]').value = alt.sets;
        det.querySelector('input[name=reps]').value = parseInt(String(alt.reps),10)||10;
        det.querySelector('input[name=rest]').value = alt.rest;
        det.querySelector('.js-est').textContent = 'Durée estimée pour cet exo : — • Volume : —';
      }
      e.preventDefault();
    }
  });
  const form = det.querySelector('form');
  form.querySelector('.act-calc').addEventListener('click', ()=>{
    const v = getFormVals(form);
    const t = estimateDurationSec([ex], v.sets, v.reps, v.rest);
    const vol = v.kg * v.reps * v.sets;
    det.querySelector('.js-est').textContent = `Durée estimée pour cet exo : ${fmtTime(t)} • Volume : ${vol} kg·rep • RPE ${v.rpe}`;
  });
  form.querySelector('.act-add').addEventListener('click', ()=>{
    const v = getFormVals(form);
    saveEntry(det.dataset.id, det.querySelector('.name').textContent, v);
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

// ------------------------------
// Filters
// ------------------------------
function pickByMode(mode){
  if(mode==='full') return EXO_DB.filter(x=>x.cat==='upper' || x.cat==='lower' || x.cat==='core').slice(0);
  return EXO_DB.filter(x=>x.cat===mode);
}
function filterByConstraints(list, equip, space, zones, plateLite){
  let L = list.filter(x=> zones.has(x.cat));
  L = L.filter(x=>(equip==='all' || x.equip===equip || ((x.alt||[]).map(byId).filter(Boolean)).some(a=>a.equip===equip)));
  L = L.filter(x=> (space===x.space || space==='standard' || x.space==='faible'));
  if(plateLite){
    const penalty = s => s==='barre+banc+disques'?3 : (s&&s.includes('barre+disques')?2 : 0);
    L = L.slice().sort((a,b)=> penalty(a.station)-penalty(b.station));
  }
  return L;
}

// ------------------------------
// Rendering
// ------------------------------
let listEl, kDur, kVol, kRpe, logEl;
function renderPlan(list, sets, reps, rest){
  listEl.innerHTML='';
  list.forEach(ex=>{
    const card = buildCard(ex);
    card.querySelector('.badge').textContent = `${sets} × ${reps}`;
    card.querySelector('input[name=sets]').value = sets;
    card.querySelector('input[name=reps]').value = reps;
    card.querySelector('input[name=rest]').value = rest;
    listEl.appendChild(card);
  });
  const t = estimateDurationSec(list, sets, reps, rest);
  kDur.textContent = fmtTime(t);
  kVol.textContent = '—';
  kRpe.textContent = '—';
  logEl.textContent = '';
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
  if(!all.length){ console.log('Rien à exporter'); return; }
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
}

// ------------------------------
// Build plan
// ------------------------------
function buildPlan(){
  const mode = $('#mode').value;
  const nb = clamp(parseInt($('#nbExo').value,10),1,12);
  const sets = clamp(parseInt($('#sets').value,10),1,5);
  const reps = clamp(parseInt($('#reps').value,10),1,30);
  const rest = clamp(parseInt($('#rest').value,10),15,240);
  const space = $('#space').value;
  const equip = $('#equip').value;
  const order = $('#order') ? $('#order').value : 'balanced';
  const zonesSel = new Set([...$$('#zones input:checked')].map(i=>i.value));
  if(zonesSel.size===0){ zonesSel.add('upper'); zonesSel.add('lower'); }
  const plateLite = $('#plateLite')?.checked || false;

  let pool = pickByMode(mode);
  pool = filterByConstraints(pool, equip, space, zonesSel, plateLite);

  if(mode==='full'){
    const upp = pool.filter(x=>x.cat==='upper');
    const low = pool.filter(x=>x.cat==='lower');
    const core = pool.filter(x=>x.cat==='core');
    const plan = [];
    let i=0;
    while(plan.length<nb && (upp.length || low.length || core.length)){
      if(i%3===0 && upp.length) plan.push(upp.shift());
      else if(i%3===1 && low.length) plan.push(low.shift());
      else if(core.length) plan.push(core.shift());
      i++;
    }
    renderPlan(orderPlan(plan, order, mode), sets, reps, rest);
  } else {
    renderPlan(orderPlan(pool.slice(0,nb), order, mode), sets, reps, rest);
  }
}

// ------------------------------
// Boot
// ------------------------------
document.addEventListener('DOMContentLoaded', async () => {
  listEl = $('#exerciseList');
  kDur = $('#kDur'); kVol=$('#kVol'); kRpe=$('#kRpe');
  logEl = $('#log');

  const btnBuild = $('#btnBuild');
  const btnSave = $('#btnSave');
  const btnCsv = $('#btnCsv');
  const btnReset = $('#btnReset');

  if(btnBuild) btnBuild.addEventListener('click', buildPlan);
  if(btnSave) btnSave.addEventListener('click', updateSummary);
  if(btnCsv) btnCsv.addEventListener('click', exportCSV);
  if(btnReset) btnReset.addEventListener('click', resetAll);

  await loadDB();
  buildPlan();
  updateSummary();
});
