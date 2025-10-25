/* ==========================================================
   COACH V5 — Logique globale (sans dépendre de la V4)
   - Sauvegarde: coach_v5_state / coach_v5_calendar
   - Calendrier ISO + validations
   - Extras/marches
   - RPE Muscu / Cardio / TIBO / Core
   - Stats hebdo (Full|Cardio validées + total minutes)
   - Export / Import / Reset
   - Programme A seedé avec ton plan (Programme B géré via /pages)
   ========================================================== */

/* ===========================
   CONSTANTES & ÉTAT
=========================== */
const STATE_KEY   = 'coach_v5_state';
const CAL_STORAGE = 'coach_v5_calendar';

// mapping type prévu par jour de la semaine (0=Dim..6=Sam)
// ici on garde Lundi=Full, Mardi=Cardio, etc.
const planJour = { 1: 'full', 2: 'cardio', 3: 'full', 4: 'cardio', 5: 'full', 6: 'cardio', 0: 'off' };

/* ===========================
   HELPERS TEMPS & FORMAT
=========================== */
function startOfWeek(d=new Date()){
  // ISO: lundi début de semaine
  const x=new Date(d);
  const day=(x.getDay()+6)%7; // 0=lundi
  x.setHours(0,0,0,0);
  x.setDate(x.getDate()-day);
  return x;
}
function endOfWeek(d=new Date()){
  const s=startOfWeek(d);
  const e=new Date(s);
  e.setDate(s.getDate()+7);
  return e;
}
function ymd(date){
  return new Date(date.getFullYear(), date.getMonth(), date.getDate()).toLocaleDateString('sv-SE');
}
function fmtHM(min){
  const h=Math.floor(min/60), m=min%60;
  return `${h}h${String(m).padStart(2,'0')}`;
}
function pad2(n){ return String(n).padStart(2,'0'); }
function weekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() || 7);
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}

/* ===========================
   SAUVEGARDE / ÉTAT GLOBAL
=========================== */
function loadState(){ try{ return JSON.parse(localStorage.getItem(STATE_KEY)||'{}'); }catch(e){ return {}; } }
function saveState(s){ localStorage.setItem(STATE_KEY, JSON.stringify(s)); }

function seedWeek(){
  return {
    1:{type:'full', items:[]}, // Lundi
    2:{type:'cardio', items:[]},
    3:{type:'full', items:[]},
    4:{type:'cardio', items:[]},
    5:{type:'full', items:[]},
    6:{type:'cardio', items:[]},
    7:{type:'off', items:[]}, // Dimanche
  };
}

// ---- Programme A basé sur ta liste (résumé + valeurs par défaut) ----
function seedProgramA(){
  const A = seedWeek();

  // LUNDI – Full Body A
  A[1].items = [
    exMuscu('Développé couché barre',       {sets:4, reps:10, tempo:'2-1-1', rpe:7.5, load:'10–20kg', rest:'90s'}),
    exMuscu('Goblet Squat',                  {sets:4, reps:15, tempo:'3-1-1', rpe:7,   load:'5kg',    rest:'90s'}),
    exMuscu('Rowing barre penché',           {sets:4, reps:12, tempo:'2-1-2', rpe:7,   load:'15–20kg',rest:'90s'}),
    exMuscu('Soulevé de terre jambes tendues',{sets:3, reps:12, tempo:'3-1-1', rpe:7,  load:'15–20kg',rest:'90s'}),
    exMuscu('Pompes sur genoux',             {sets:3, reps:15, tempo:'2-1-1', rpe:6.5, load:'PDC',    rest:'75s'}),
    exCore ('Crunch au sol',                 {sets:3, sec:30,  rpe:6}),
    exCore ('Planche',                       {sets:3, sec:40,  rpe:6}),
    // Finisher optionnel sous forme cardio rapide
    exCardio('Vélo zone 2 (finisher)',       {total:6, wu:1, cd:1, bloc:'continus'})
  ];

  // MARDI – Cardio (marche + run) + TIBO Extrm
  A[2].items = [
    exCardio('Marche + Run',                 {total:35, wu:5, cd:5, bloc:'4’+1’ × 5'}),
    exTibo  ('TIBO Extrm',                   {total:36, wu:5, cd:5, bloc:'3’/3’ × 5'})
  ];

  // MERCREDI – Full Body B
  A[3].items = [
    exMuscu('Développé haltères au sol',     {sets:4, reps:12, tempo:'2-1-2', rpe:7,   load:'3kg/haltère', rest:'90s'}),
    exMuscu('Squat PDC dynamique',           {sets:4, reps:20, tempo:'2-1-1', rpe:7,   load:'PDC',          rest:'90s'}),
    exMuscu('Rowing haltère 1 bras',         {sets:3, reps:15, tempo:'2-1-2', rpe:7,   load:'3–5kg',        rest:'90s'}),
    exMuscu('Hip Thrust sur banc',           {sets:3, reps:15, tempo:'2-1-1', rpe:7,   load:'PDC/charge',   rest:'90s'}),
    exMuscu('Élévations latérales',          {sets:3, reps:20, tempo:'2-1-1', rpe:6,   load:'3kg',          rest:'75s'}),
    exCore ('Crunch jambes levées',          {sets:3, sec:30,  rpe:6}),
    exCore ('Gainage genoux relevés',        {sets:3, sec:40,  rpe:6}),
    exCardio('Marche rapide (finisher)',     {total:10, wu:2, cd:2, bloc:'continu'})
  ];

  // JEUDI – Cardio
  A[4].items = [
    exCardio('Marche + Run',                 {total:35, wu:5, cd:5, bloc:'4’+1’ × 5'}),
    exTibo  ('TIBO Extrm',                   {total:36, wu:5, cd:5, bloc:'3’/3’ × 5'})
  ];

  // VENDREDI – Full Body C
  A[5].items = [
    exMuscu('Développé militaire assis',     {sets:4, reps:10, tempo:'2-1-1', rpe:7,   load:'3–5kg',    rest:'90s'}),
    exMuscu('Front Squat avec barre',        {sets:4, reps:12, tempo:'3-1-1', rpe:7.5, load:'10–20kg',  rest:'90s'}),
    exMuscu('Tirage menton (barre)',         {sets:3, reps:12, tempo:'2-1-2', rpe:7,   load:'10–15kg',  rest:'90s'}),
    exMuscu('Fentes arrière',                {sets:3, reps:10, tempo:'2-1-1', rpe:7,   load:'PDC/haltères', rest:'90s'}),
    exMuscu('Pompes inclinées (mur/banc)',   {sets:3, reps:12, tempo:'2-1-1', rpe:6.5, load:'PDC',      rest:'75s'}),
    exCore ('Crunch avec rotation',          {sets:3, sec:30,  rpe:6}),
    exCore ('Planche + soulèvement bras',    {sets:3, sec:30,  rpe:6}),
    exCardio('Vélo interval 30/30 (finisher)',{total:8, wu:2, cd:2, bloc:'30s rapide / 30s lent'})
  ];

  // SAMEDI – Cardio
  A[6].items = [
    exCardio('Marche + Run (libre)',         {total:30, wu:5, cd:5, bloc:'au feeling'}),
    exTibo  ('TIBO Extrm',                   {total:30, wu:5, cd:5, bloc:'3’/3’ × 4'})
  ];

  // DIMANCHE – OFF
  A[7].items = [];

  return A;
}

// Constructeurs d’items homogènes
function exMuscu(name, vals){ return { id: name.toLowerCase().replace(/[^a-z0-9]+/g,'_'), name, type:'muscu', vals:{...vals} }; }
function exCardio(name, vals){ return { id: name.toLowerCase().replace(/[^a-z0-9]+/g,'_'), name, type:'cardio', vals:{...vals} }; }
function exTibo (name, vals){ return { id: 'tibo_extrm', name, type:'tibo',  vals:{...vals} }; }
function exCore (name, vals){ return { id: name.toLowerCase().replace(/[^a-z0-9]+/g,'_'), name, type:'core',   vals:{...vals} }; }

// Assure un état initial propre
function ensureState(){
  const s = loadState();
  if(!s.programA) s.programA = seedProgramA();     // ton plan de base
  if(!s.programB) s.programB = seedWeek();         // maquette vide (remplie via Encyclopédie)
  if(!s.extras)   s.extras   = [];                 // marches & séances libres
  if(!s.ui)       s.ui       = { restMuscu: 90, rpeMuscu:0, rpeCardio:0, rpeTibo:0, rpeCore:0 };
  saveState(s);
  return s;
}

/* ===========================
   CALENDRIER (ISO + validations)
=========================== */
const calEl    = document.getElementById('calendar');
const calTitle = document.getElementById('cal-title');
let calState   = { y: new Date().getFullYear(), m: new Date().getMonth() };

function loadCal(){ try{ return JSON.parse(localStorage.getItem(CAL_STORAGE)||'{}'); }catch(e){ return {}; } }
function saveCal(v){ localStorage.setItem(CAL_STORAGE, JSON.stringify(v)); }

function renderCalendar(){
  if(!calEl) return;
  const { y, m } = calState;
  const first = new Date(y, m, 1);
  const last  = new Date(y, m+1, 0);
  const todayStr = new Date().toLocaleDateString('sv-SE');

  if(calTitle) calTitle.textContent = first.toLocaleDateString('fr-FR', { month:'long', year:'numeric' });

  calEl.innerHTML = '';
  ['#','L','M','M','J','V','S','D'].forEach(h=>{
    const d=document.createElement('div'); d.className='weeknum'; d.textContent=h; calEl.appendChild(d);
  });

  const pad = ((first.getDay()-1+7)%7);
  let cur = 0;
  const valids = loadCal();

  const wn0=document.createElement('div'); wn0.className='weeknum'; wn0.textContent=weekNumber(new Date(y,m,1)); calEl.appendChild(wn0); cur++;

  for(let i=0;i<pad;i++){ calEl.appendChild(document.createElement('div')); cur++; }

  for(let d=1; d<=last.getDate(); d++){
    if(cur===0){
      const c=document.createElement('div'); c.className='weeknum';
      c.textContent=weekNumber(new Date(y,m,d));
      calEl.appendChild(c); cur++;
    }
    const date = new Date(y,m,d);
    const key  = ymd(date);

    const cell=document.createElement('button');
    cell.className='cell';
    cell.textContent=d;

    if (key===todayStr) cell.classList.add('today');

    const type=planJour[date.getDay()]||'off';
    const dot=document.createElement('span');
    dot.className='badge-mini ' + (valids[key] ? 'ok' : type);
    cell.appendChild(dot);

    cell.title=`${key} • Prévu: ${type}${valids[key]?' • Validé':''}`;
    cell.addEventListener('click', ()=>{
      const cur=loadCal();
      if(cur[key]) delete cur[key]; else cur[key]=true;
      saveCal(cur); renderCalendar(); updateWeekStats();
    });

    calEl.appendChild(cell);
    cur++; if(cur===8) cur=0;
  }
}
document.getElementById('cal-prev')?.addEventListener('click', ()=>{
  calState.m--; if(calState.m<0){ calState.m=11; calState.y--; } renderCalendar();
});
document.getElementById('cal-next')?.addEventListener('click', ()=>{
  calState.m++; if(calState.m>11){ calState.m=0; calState.y++; } renderCalendar();
});
renderCalendar();

/* ===========================
   EXTRAS / MARCHES
=========================== */
function getStateRaw(){ try{ return JSON.parse(localStorage.getItem(STATE_KEY)||'{}'); }catch(e){ return {}; } }
function getExtras(){
  const s=getStateRaw(); return Array.isArray(s.extras)? s.extras : [];
}
function setExtras(arr){
  const s=getStateRaw(); s.extras=arr; localStorage.setItem(STATE_KEY, JSON.stringify(s));
}
function renderExtras(){
  const wrap=document.getElementById('extraList'); if(!wrap) return;
  const arr=getExtras();
  if(!arr.length){ wrap.innerHTML='<div class="hint">Aucun extra pour l’instant.</div>'; return; }
  const wkS=startOfWeek(), wkE=endOfWeek();
  wrap.innerHTML='';
  arr.forEach((e,i)=>{
    const inWeek = (new Date(e.date) >= wkS && new Date(e.date) < wkE);
    const row=document.createElement('div'); row.className='extra-item';
    row.innerHTML=`
      <div>${e.label||'Extra'} — ${e.date} • ${e.minutes} min ${inWeek?'<span class="chip">cette semaine</span>':''}</div>
      <button class="btn small danger" data-del="${i}">Supprimer</button>
    `;
    row.querySelector('[data-del]').addEventListener('click',()=>{ removeExtraAt(i); });
    wrap.appendChild(row);
  });
}
function addExtraEntry(dateStr, minutes, label='Marche'){
  const arr=getExtras();
  arr.push({ date: dateStr, minutes: Number(minutes), label });
  setExtras(arr);
  renderExtras();
  updateWeekStats();
}
function removeExtraAt(idx){
  const arr=getExtras(); arr.splice(idx,1); setExtras(arr); renderExtras(); updateWeekStats();
}
function dateForExtraSelect(){
  const sel=document.getElementById('extraDay');
  const v=sel?.value||'today';
  if(v==='today') return ymd(new Date());
  // v = 0..6 (Dim..Sam) MAIS notre semaine commence lundi; on mappe :
  const target=Number(v);
  const s=startOfWeek(); // lundi
  let d= new Date(s);
  // map 0..6 (Dim..Sam) -> s+6 .. s+5
  const map=[6,0,1,2,3,4,5];
  d.setDate(s.getDate()+map[target]);
  return ymd(d);
}
document.getElementById('addExtra')?.addEventListener('click', ()=>{
  const minutes=Number(document.getElementById('extraMin').value||30);
  const qty=Number(document.getElementById('extraQty').value||1);
  const dateStr=dateForExtraSelect();
  for(let i=0;i<qty;i++) addExtraEntry(dateStr, minutes, 'Marche');
});
document.getElementById('quick3x30')?.addEventListener('click', ()=>{
  const dateStr=ymd(new Date());
  for(let i=0;i<3;i++) addExtraEntry(dateStr, 30, 'Marche');
});
renderExtras();

/* ===========================
   STATS HEBDO
=========================== */
function countValidatedByType(){
  const valids = loadCal();
  const wkS=startOfWeek(), wkE=endOfWeek();
  let full=0, cardio=0;

  for(const [key, ok] of Object.entries(valids)){
    if(!ok) continue;
    const d=new Date(key);
    if(!(d>=wkS && d<wkE)) continue;
    const type = planJour[d.getDay()] || 'off';
    if(type==='full') full++;
    if(type==='cardio') cardio++;
  }
  return {full, cardio};
}

// Estimation temps (minutes) pour un jour du Programme A
function estimateDayMinutes(dayIdx){
  const s=ensureState();
  const d=s.programA?.[dayIdx]; if(!d) return 0;
  const restDefault = Number(s.ui?.restMuscu || 90);
  let sec=0;

  (d.items||[]).forEach(it=>{
    const v = it.vals||{};
    if(it.type==='cardio' || it.type==='tibo'){
      sec += (Number(v.total||0) * 60);
    } else if(it.type==='core'){
      const sets=Number(v.sets||0), t=Number(v.sec||30);
      sec += sets * (t + 15); // transitions
    } else { // muscu
      const sets=Number(v.sets||0), reps=Number(v.reps||0);
      const restSec = parseInt((v.rest||'').replace(/\D/g,'')) || restDefault;
      const perRep=2.5;
      sec += sets * (reps*perRep + restSec);
    }
  });
  sec += 120; // transitions globales
  return Math.round(sec/60);
}

function weeklyPlannedMinutes(){
  let min=0;
  for(let i=1;i<=7;i++) min += estimateDayMinutes(i);
  const wkS=startOfWeek(), wkE=endOfWeek();
  getExtras().forEach(e=>{ const d=new Date(e.date); if(d>=wkS && d<wkE) min += Number(e.minutes||0); });
  return min;
}

function updateWeekStats(){
  const {full, cardio} = countValidatedByType();
  const totalMin = weeklyPlannedMinutes();
  const elF=document.getElementById('statFull');
  const elC=document.getElementById('statCardio');
  const elH=document.getElementById('statHours');
  if(elF) elF.textContent=full;
  if(elC) elC.textContent=cardio;
  if(elH) elH.textContent=fmtHM(totalMin);
}
updateWeekStats();

/* ===========================
   PANNEAU RÉGLAGE ADAPTATIF
=========================== */
// Tabs internes
document.querySelectorAll('#adapt .tab')?.forEach(t=>{
  t.addEventListener('click', ()=>{
    document.querySelectorAll('#adapt .tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
    t.classList.add('active');
    document.getElementById('panel-'+t.dataset.tab).classList.remove('hidden');
  });
});

// Affichage des valeurs RPE actuelles
const rpeMuscu    = document.getElementById('rpeMuscu');
const rpeMuscuVal = document.getElementById('rpeMuscuVal');
const rpeCardio   = document.getElementById('rpeCardio');
const rpeCardioVal= document.getElementById('rpeCardioVal');
const rpeTibo     = document.getElementById('rpeTibo');
const rpeTiboVal  = document.getElementById('rpeTiboVal');
const rpeCore     = document.getElementById('rpeCore');
const rpeCoreVal  = document.getElementById('rpeCoreVal');

rpeMuscu   && (rpeMuscu.oninput    = ()=> rpeMuscuVal.textContent    = rpeMuscu.value);
rpeCardio  && (rpeCardio.oninput   = ()=> rpeCardioVal.textContent   = rpeCardio.value);
rpeTibo    && (rpeTibo.oninput     = ()=> rpeTiboVal.textContent     = rpeTibo.value);
rpeCore    && (rpeCore.oninput     = ()=> rpeCoreVal.textContent     = rpeCore.value);

// Sélecteur de jour (prioritaire) — si non précisé : jour courant (ISO)
const daySelect = document.getElementById('daySelect');
const getSelectedDayIdx = () => {
  const v = Number(daySelect?.value);
  if (!Number.isNaN(v) && v >= 1) return v;
  // sinon jour courant ISO (Lundi=1 .. Dimanche=7)
  const iso = ((new Date().getDay()+6)%7)+1;
  return iso;
};

// Simulations textuelles (affichées sous les boutons)
const simMuscuOut = document.getElementById('simMuscuOut');
const simCardioOut= document.getElementById('simCardioOut');
const simTiboOut  = document.getElementById('simTiboOut');
const simCoreOut  = document.getElementById('simCoreOut');

// Règles d’adaptation
function applyMuscuDelta(dayIdx, delta, add05kg, restLabel){
  const s=ensureState(); const day=s.programA?.[dayIdx]; if(!day) return [];
  const lines=[];
  day.items.forEach(it=>{
    if(it.type!=='muscu') return;
    const v=it.vals||(it.vals={});
    const cap=15;
    v.reps = Number(v.reps||0) + delta;
    if(v.reps>cap){ v.sets = Number(v.sets||0)+1; v.reps = 9; }
    if(v.reps<6) v.reps = 6;
    if(restLabel) v.rest = restLabel;
    if(add05kg && /\d/.test(String(v.load||''))){
      v.load = String(v.load).replace(/(\d+(?:[.,]\d+)?)/g, m =>
        String((parseFloat(m.replace(',','.'))+0.5).toFixed(1)).replace('.',',')
      );
    }
    lines.push(`${it.name}: ${v.sets||'?'}×${v.reps}${v.load?` @${v.load}`:''} • repos ${v.rest||'90s'}`);
  });
  saveState(s); updateWeekStats();
  return lines;
}
function simulateMuscuDelta(dayIdx, delta, add05kg, restLabel){
  const s=ensureState(); const day=s.programA?.[dayIdx]; if(!day) return [];
  const lines=[];
  day.items.forEach(it=>{
    if(it.type!=='muscu') return;
    const v={...it.vals};
    const cap=15;
    v.reps = Number(v.reps||0) + delta;
    if(v.reps>cap){ v.sets = Number(v.sets||0)+1; v.reps = 9; }
    if(v.reps<6) v.reps = 6;
    const loadTxt = (add05kg && /\d/.test(String(v.load||'')))
      ? String(v.load).replace(/(\d+(?:[.,]\d+)?)/g, m =>
          String((parseFloat(m.replace(',','.'))+0.5).toFixed(1)).replace('.',','))
      : v.load;
    lines.push(`${it.name}: ${v.sets||'?'}×${v.reps}${loadTxt?` @${loadTxt}`:''} • repos ${restLabel||v.rest||'90s'}`);
  });
  return lines;
}

function splitCardio(total){
  total = Math.max(15, total);
  const wu = Math.round(total * 0.1);
  const cd = Math.round(total * 0.1);
  const bloc = Math.max(0, total - wu - cd);
  const cycles = Math.max(1, Math.floor(bloc/5));
  return { total, wu, cd, cycles };
}
function applyCardioDelta(dayIdx, delta){
  const s=ensureState(); const day=s.programA?.[dayIdx]; if(!day) return [];
  const lines=[];
  day.items.forEach(it=>{
    if(it.type!=='cardio') return;
    const v=it.vals||(it.vals={});
    v.total = Math.max(10, Number(v.total||0) + delta*5);
    const {wu, cd, cycles} = splitCardio(v.total);
    v.wu=wu; v.cd=cd;
    if(/tibo/i.test(it.name) || it.type==='tibo'){
      const cyc=Math.max(3, Math.round(v.total/6));
      v.bloc = `3’/3’ × ${cyc}`;
    } else {
      v.bloc = `4’+1’ × ${cycles}`;
    }
    lines.push(`${it.name}: ${v.total} min (WU ${v.wu} / ${v.bloc} / CD ${v.cd})`);
  });
  saveState(s); updateWeekStats();
  return lines;
}
function simulateCardioDelta(dayIdx, delta){
  const s=ensureState(); const day=s.programA?.[dayIdx]; if(!day) return [];
  const lines=[];
  day.items.forEach(it=>{
    if(it.type!=='cardio') return;
    const base=Number(it.vals?.total||0);
    const total = Math.max(10, base + delta*5);
    const {wu, cd, cycles} = splitCardio(total);
    const bloc = (/tibo/i.test(it.name)||it.type==='tibo')
      ? `3’/3’ × ${Math.max(3, Math.round(total/6))}`
      : `4’+1’ × ${cycles}`;
    lines.push(`${it.name}: ${total} min (WU ${wu} / ${bloc} / CD ${cd})`);
  });
  return lines;
}

function applyTiboDelta(dayIdx, delta){
  const s=ensureState(); const day=s.programA?.[dayIdx]; if(!day) return [];
  // TIBO doit être sur jours "cardio" (prévu), mais on ne bloque pas si déjà présent
  const lines=[];
  // trouve ou crée TIBO
  let tibo = (day.items||[]).find(x=>x.type==='tibo' || /tibo/i.test(x.name));
  const cycles = Math.max(3, 5 + delta);
  const total  = cycles * 6;
  if(!tibo){
    tibo = exTibo('TIBO Extrm', { total, wu:5, cd:5, bloc:`3’/3’ × ${cycles}` });
    day.items.push(tibo);
  } else {
    tibo.vals.total = total;
    tibo.vals.wu = 5; tibo.vals.cd = 5;
    tibo.vals.bloc = `3’/3’ × ${cycles}`;
  }
  lines.push(`TIBO Extrm: ~${total} min (${cycles} cycles 3’/3’)`);
  saveState(s); updateWeekStats();
  return lines;
}
function simulateTiboDelta(delta){
  const cycles = Math.max(3, 5 + delta);
  return [`TIBO Extrm: ~${cycles*6} min (${cycles} cycles 3’/3’)`];
}

function applyCoreDelta(dayIdx, delta){
  const s=ensureState(); const day=s.programA?.[dayIdx]; if(!day) return [];
  const lines=[];
  day.items.forEach(it=>{
    if(it.type!=='core') return;
    const v=it.vals||(it.vals={});
    v.sec = Math.max(20, Number(v.sec||0) + delta*5);
    if(v.sec>45){ v.sets = Number(v.sets||0)+1; v.sec=30; }
    lines.push(`${it.name}: ${v.sets||'?'}×${v.sec}s`);
  });
  saveState(s); updateWeekStats();
  return lines;
}
function simulateCoreDelta(dayIdx, delta){
  const s=ensureState(); const day=s.programA?.[dayIdx]; if(!day) return [];
  const lines=[];
  day.items.forEach(it=>{
    if(it.type!=='core') return;
    let sets=Number(it.vals?.sets||0);
    let sec =Number(it.vals?.sec||0);
    sec += delta*5;
    if(sec>45){ sets+=1; sec=30; }
    if(sec<20){ sec=20; }
    lines.push(`${it.name}: ${sets}×${sec}s`);
  });
  return lines;
}

// Wire boutons SIMULER/APPLIQUER
document.getElementById('simMuscu')?.addEventListener('click', ()=>{
  const day=getSelectedDayIdx();
  const delta=Number(document.getElementById('rpeMuscu')?.value||0);
  const add05 = !!document.getElementById('add05')?.checked;
  const rest  = document.getElementById('restMuscu')?.value || '90s';
  simMuscuOut.textContent = simulateMuscuDelta(day, delta, add05, rest).join(' • ');
});
document.getElementById('applyMuscu')?.addEventListener('click', ()=>{
  const day=getSelectedDayIdx();
  const delta=Number(document.getElementById('rpeMuscu')?.value||0);
  const add05 = !!document.getElementById('add05')?.checked;
  const rest  = document.getElementById('restMuscu')?.value || '90s';
  const lines = applyMuscuDelta(day, delta, add05, rest);
  simMuscuOut.textContent = lines.join(' • ');
});

document.getElementById('simCardio')?.addEventListener('click', ()=>{
  const day=getSelectedDayIdx();
  const delta=Number(document.getElementById('rpeCardio')?.value||0);
  simCardioOut.textContent = simulateCardioDelta(day, delta).join(' • ');
});
document.getElementById('applyCardio')?.addEventListener('click', ()=>{
  const day=getSelectedDayIdx();
  const delta=Number(document.getElementById('rpeCardio')?.value||0);
  const lines = applyCardioDelta(day, delta);
  simCardioOut.textContent = lines.join(' • ');
});

document.getElementById('simTibo')?.addEventListener('click', ()=>{
  const delta=Number(document.getElementById('rpeTibo')?.value||0);
  simTiboOut.textContent = simulateTiboDelta(delta).join(' • ');
});
document.getElementById('applyTibo')?.addEventListener('click', ()=>{
  const day=getSelectedDayIdx();
  const delta=Number(document.getElementById('rpeTibo')?.value||0);
  const lines = applyTiboDelta(day, delta);
  simTiboOut.textContent = lines.join(' • ');
});

document.getElementById('simCore')?.addEventListener('click', ()=>{
  const day=getSelectedDayIdx();
  const delta=Number(document.getElementById('rpeCore')?.value||0);
  simCoreOut.textContent = simulateCoreDelta(day, delta).join(' • ');
});
document.getElementById('applyCore')?.addEventListener('click', ()=>{
  const day=getSelectedDayIdx();
  const delta=Number(document.getElementById('rpeCore')?.value||0);
  const lines = applyCoreDelta(day, delta);
  simCoreOut.textContent = lines.join(' • ');
});

/* ===========================
   EXPORT / IMPORT / RESET
=========================== */
document.getElementById('btnExport')?.addEventListener('click', ()=>{
  const data=JSON.stringify(ensureState(), null, 2);
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  const a=document.createElement('a'); a.href=url; a.download='coach_v5_state.json'; a.click(); URL.revokeObjectURL(url);
});

document.getElementById('btnImport')?.addEventListener('click', ()=> document.getElementById('fileImport').click());
document.getElementById('fileImport')?.addEventListener('change', async (e)=>{
  const f=e.target.files?.[0]; if(!f) return;
  try{
    const text=await f.text(); const st=JSON.parse(text);
    saveState(st);
    alert('Import OK — rechargement.');
    location.reload();
  }catch(err){
    alert('Fichier invalide 🤕');
  } finally { e.target.value=''; }
});

document.getElementById('btnReset')?.addEventListener('click', ()=>{
  if(!confirm('Tout réinitialiser (plan + calendrier + extras) ?')) return;
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(CAL_STORAGE);
  location.reload();
});

/* ===========================
   ANTI-HALO SCROLL (cosmétique)
=========================== */
let _scrollT=null;
window.addEventListener('scroll', ()=>{
  document.body.classList.add('scrolling');
  clearTimeout(_scrollT);
  _scrollT=setTimeout(()=> document.body.classList.remove('scrolling'), 120);
},{passive:true});

/* ===========================
   INIT
=========================== */
ensureState();
updateWeekStats();
