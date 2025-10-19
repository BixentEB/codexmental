// ===== Calendar =====
const CAL_STORAGE = 'coach_v4_calendar';
const STATE_KEY   = 'coach_v4_state';

const calEl = document.getElementById('calendar');
const calTitle = document.getElementById('cal-title');
let calState = { y: new Date().getFullYear(), m: new Date().getMonth() };
const planJour = { 1: 'full', 2: 'cardio', 3: 'full', 4: 'cardio', 5: 'full', 6: 'cardio', 0: 'off' };

function weekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() || 7);
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil((((date - yearStart) / 86400000) + 1) / 7);
}
function loadCal(){ try { return JSON.parse(localStorage.getItem(CAL_STORAGE) || '{}'); } catch(e){ return {}; } }
function saveCal(v){ localStorage.setItem(CAL_STORAGE, JSON.stringify(v)); }

function renderCalendar(){
  if (!calEl) return;
  const { y, m } = calState;
  const first = new Date(y, m, 1);
  const last  = new Date(y, m+1, 0);
  const todayStr = new Date().toLocaleDateString('sv-SE');

  calTitle.textContent = first.toLocaleDateString('fr-FR', { month:'long', year:'numeric' });
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
    if(cur===0){ const c=document.createElement('div'); c.className='weeknum'; c.textContent=weekNumber(new Date(y,m,d)); calEl.appendChild(c); cur++; }
    const date = new Date(y,m,d);
    const key  = new Date(date.getFullYear(),date.getMonth(),date.getDate()).toLocaleDateString('sv-SE');

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
      saveCal(cur); renderCalendar();
      setTimeout(saveStateDebounced, 50);
    });

    calEl.appendChild(cell);
    cur++; if(cur===8) cur=0;
  }
}
document.getElementById('cal-prev').onclick=()=>{ calState.m--; if(calState.m<0){calState.m=11; calState.y--;} renderCalendar(); };
document.getElementById('cal-next').onclick=()=>{ calState.m++; if(calState.m>11){calState.m=0; calState.y++;} renderCalendar(); };
renderCalendar();


// ===== Collapse & Chips =====
document.querySelectorAll('.day').forEach(day=>{
  const btn=day.querySelector('.chev'), body=day.querySelector('.body');
  btn.addEventListener('click', ()=>{
    const open = btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded', String(!open));
    btn.textContent = open ? '▸' : '▾';
    body.classList.toggle('hidden', open);
  });
});

document.getElementById('toggleLayout').onclick=()=>{
  const old=document.body.dataset.layout||'dense';
  const next=(old==='dense'?'chips':'dense');
  document.body.dataset.layout=next;
  renderExoChips(next);
  saveStateDebounced();
};

function renderExoChips(layout=(document.body.dataset.layout||'dense')){
  document.querySelectorAll('.exo').forEach(exo=>{
    let chip=exo.querySelector('.chips');
    if(layout==='chips'){
      if(!chip){ chip=document.createElement('div'); chip.className='chips'; exo.appendChild(chip); }
      const sets=exo.querySelector('[data-k="sets"]')?.value??'';
      const reps=exo.querySelector('[data-k="reps"]')?.value??'';
      const tempo=exo.querySelector('[data-k="tempo"]')?.value??'';
      const rpe=exo.querySelector('[data-k="rpe"]')?.value??'';
      chip.textContent=`${sets?sets+'×':''}${reps} • ${tempo} • RPE ${rpe}`;
      const p=exo.querySelector('.params'); if(p) p.style.display='none';
    } else {
      if(chip) chip.remove();
      const p=exo.querySelector('.params'); if(p) p.style.display='';
    }
  });
}
renderExoChips();


// ===== Tabs =====
document.querySelectorAll('#adapt .tab').forEach(t=>{
  t.addEventListener('click', ()=>{
    document.querySelectorAll('#adapt .tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('#adapt .panel').forEach(p=>p.classList.add('hidden'));
    t.classList.add('active');
    document.getElementById('panel-'+t.dataset.tab).classList.remove('hidden');
  });
});

// ===== Lexique tabs =====
document.querySelectorAll('#lexique .tab').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    document.querySelectorAll('#lexique .tab').forEach(x=>x.classList.remove('active'));
    btn.classList.add('active');
    document
      .querySelectorAll('#lexique > div[id^="panel-lex"]')
      .forEach(p=>p.classList.add('hidden'));
    document.getElementById('panel-'+btn.dataset.tab).classList.remove('hidden');
  });
});


// ===== Helpers (sélecteur de jour prioritaire) =====
const daySelect = document.getElementById('daySelect');
const getSelectedDayIdx = () => {
  const v = Number(daySelect?.value);
  if (!Number.isNaN(v) && v >= 0) return v;
  const open = document.querySelector('.day .chev[aria-expanded="true"]');
  return open ? Number(open.closest('.day').dataset.day) : new Date().getDay();
};
const getDayCard = () =>
  document.querySelector(`.day[data-day="${getSelectedDayIdx()}"]`);


// ===== LOGIQUE ADAPTATIVE =====
// ---- MUSCU ----
const simMuscuOut = document.getElementById('simMuscuOut');
const rpeMuscu = document.getElementById('rpeMuscu');
const rpeMuscuVal = document.getElementById('rpeMuscuVal');
const add05 = document.getElementById('add05');
const restMuscu = document.getElementById('restMuscu');
rpeMuscu.oninput = () => rpeMuscuVal.textContent = rpeMuscu.value;

function simulateMuscu(card, delta){
  const lines=[];
  card.querySelectorAll('.exo:not(.cardio)').forEach(exo=>{
    const setsI=exo.querySelector('[data-k="sets"]');
    const repsI=exo.querySelector('[data-k="reps"]');
    const loadI=exo.querySelector('[data-k="load"]');
    if(!repsI) return;

    let sets=Number(setsI?.value||0);
    let reps=Number(repsI.value||0);

    reps += delta;
    if(reps>15){ sets+=1; reps=8; }
    if(reps<6) reps=6;

    let loadTxt=loadI?.value||'';
    if(add05.checked && /\d/.test(loadTxt)){
      loadTxt = loadTxt.replace(/(\d+(?:[.,]\d+)?)/g, m =>
        String((parseFloat(m.replace(',','.'))+0.5).toFixed(1)).replace('.',',')
      );
    }
    lines.push(`${exo.dataset.name}: ${sets}×${reps}${loadTxt?` @${loadTxt}`:''} • repos ${restMuscu.value}`);
  });
  return lines;
}
function applyMuscu(card, delta){
  card.querySelectorAll('.exo:not(.cardio)').forEach(exo=>{
    const setsI=exo.querySelector('[data-k="sets"]');
    const repsI=exo.querySelector('[data-k="reps"]');
    const loadI=exo.querySelector('[data-k="load"]');
    if(!repsI) return;

    let sets=Number(setsI?.value||0);
    let reps=Number(repsI.value||0);

    reps += delta;
    if(reps>15){ sets+=1; reps=8; }
    if(reps<6) reps=6;

    if(setsI) setsI.value=sets;
    repsI.value=reps;

    if(add05.checked && loadI && /\d/.test(loadI.value)){
      loadI.value = loadI.value.replace(/(\d+(?:[.,]\d+)?)/g, m =>
        String((parseFloat(m.replace(',','.'))+0.5).toFixed(1)).replace('.',',')
      );
    }
  });
  renderExoChips();
  saveStateDebounced();
}


// ---- CARDIO ----
const rpeCardio = document.getElementById('rpeCardio');
const rpeCardioVal = document.getElementById('rpeCardioVal');
const simCardioOut = document.getElementById('simCardioOut');
rpeCardio.oninput = () => rpeCardioVal.textContent = rpeCardio.value;

function splitCardio(total){
  total = Math.max(15, total);
  const wu = Math.round(total * 0.1);
  const cd = Math.round(total * 0.1);
  const bloc = Math.max(0, total - wu - cd);
  const cycles = Math.max(1, Math.floor(bloc/5));
  return { total, wu, cd, cycles };
}
function simulateCardio(card, delta){
  const lines=[];
  card.querySelectorAll('.exo.cardio:not(.tibo)').forEach(exo=>{
    const totalI=exo.querySelector('[data-k="total"]');
    const base = Number(totalI?.value||0);
    const total = Math.max(10, base + delta * 5);
    const {wu, cd, cycles} = splitCardio(total);
    lines.push(`${exo.dataset.name||'Cardio'}: ${total} min (WU ${wu} / 4’+1’ × ${cycles} / CD ${cd})`);
  });
  return lines;
}
function applyCardio(card, delta){
  card.querySelectorAll('.exo.cardio:not(.tibo)').forEach(exo=>{
    const totalI=exo.querySelector('[data-k="total"]');
    const wuI=exo.querySelector('[data-k="wu"]');
    const cdI=exo.querySelector('[data-k="cd"]');
    const blocI=exo.querySelector('[data-k="bloc"]');

    const base = Number(totalI?.value||0);
    const total = Math.max(10, base + delta * 5);
    const {wu, cd, cycles} = splitCardio(total);

    if(totalI) totalI.value = total;
    if(wuI)    wuI.value = wu;
    if(cdI)    cdI.value = cd;
    if(blocI)  blocI.value = `Marche 4’ + Run 1’ × ${cycles}`;
  });
  saveStateDebounced();
}


// ---- TIBO (uniquement jours Cardio) ----
const rpeTibo = document.getElementById('rpeTibo');
const rpeTiboVal = document.getElementById('rpeTiboVal');
const simTiboOut = document.getElementById('simTiboOut');
rpeTibo.oninput = () => rpeTiboVal.textContent = rpeTibo.value;

function simulateTibo(delta){
  const cycles = Math.max(3, 5 + delta);
  return [`TIBO Extrm: ~${cycles*6} min (${cycles} cycles 3’/3’)`];
}
function addOrUpdateTibo(delta){
  const card = getDayCard();
  if(!card) return;
  if(card.dataset.type !== 'cardio'){
    alert('TIBO ne s’ajoute que sur les jours Cardio.');
    return;
  }
  const cycles = Math.max(3, 5 + delta);
  const total  = cycles * 6;

  let exo = card.querySelector('.exo.cardio.tibo');
  if(!exo){
    exo = document.createElement('div');
    exo.className = 'exo cardio tibo';
    exo.innerHTML = `
      <div class="line1"><span class="name">TIBO Extrm</span>
        <span class="goal">Brûle graisse (HIIT guidé)</span></div>
      <div class="line2 params">
        <label>Total <input class="num xs" data-k="total" type="number"></label>
        <label>WU <input class="num xs" data-k="wu" type="number"></label>
        <label>CD <input class="num xs" data-k="cd" type="number"></label>
        <label>Bloc <input class="num lg" data-k="bloc" type="text"></label>
      </div>`;
    card.querySelector('.body').appendChild(exo);
  }
  exo.querySelector('[data-k="total"]').value = total;
  exo.querySelector('[data-k="wu"]').value    = 5;
  exo.querySelector('[data-k="cd"]').value    = 5;
  exo.querySelector('[data-k="bloc"]').value  = `${cycles} cycles 3’/3’`;

  saveStateDebounced();
}


// ---- GAINAGE ----
const rpeCore = document.getElementById('rpeCore');
const rpeCoreVal = document.getElementById('rpeCoreVal');
const simCoreOut = document.getElementById('simCoreOut');
rpeCore.oninput = () => rpeCoreVal.textContent = rpeCore.value;

function simulateCore(card, delta){
  const lines=[];
  card.querySelectorAll('.exo.core').forEach(exo=>{
    const setsI=exo.querySelector('[data-k="sets"]');
    const secI =exo.querySelector('[data-k="sec"]');
    let sets=Number(setsI?.value||0);
    let sec =Number(secI?.value||0);
    sec += delta * 5;
    if(sec>45){ sets+=1; sec=30; }
    if(sec<20){ sec=20; }
    lines.push(`${exo.dataset.name}: ${sets}×${sec}s`);
  });
  return lines;
}
function applyCore(card, delta){
  card.querySelectorAll('.exo.core').forEach(exo=>{
    const setsI=exo.querySelector('[data-k="sets"]');
    const secI =exo.querySelector('[data-k="sec"]');
    let sets=Number(setsI?.value||0);
    let sec =Number(secI?.value||0);
    sec += delta * 5;
    if(sec>45){ sets+=1; sec=30; }
    if(sec<20){ sec=20; }
    if(setsI) setsI.value = sets;
    if(secI)  secI.value  = sec;
  });
  saveStateDebounced();
}


// ===== Wire buttons =====
document.getElementById('simMuscu').onclick = () => {
  simMuscuOut.textContent = simulateMuscu(getDayCard(), Number(rpeMuscu.value)).join(' • ');
};
document.getElementById('applyMuscu').onclick = () => applyMuscu(getDayCard(), Number(rpeMuscu.value));

document.getElementById('simCardio').onclick = () => {
  simCardioOut.textContent = simulateCardio(getDayCard(), Number(rpeCardio.value)).join(' • ');
};
document.getElementById('applyCardio').onclick = () => applyCardio(getDayCard(), Number(rpeCardio.value));

document.getElementById('simTibo').onclick = () => {
  simTiboOut.textContent = simulateTibo(Number(rpeTibo.value)).join(' • ');
};
document.getElementById('applyTibo').onclick = () => addOrUpdateTibo(Number(rpeTibo.value));

document.getElementById('simCore').onclick = () => {
  simCoreOut.textContent = simulateCore(getDayCard(), Number(rpeCore.value)).join(' • ');
};
document.getElementById('applyCore').onclick = () => applyCore(getDayCard(), Number(rpeCore.value));


// ====== Sauvegarde locale (autosave + export/import) ======
let _saveT = null;
function saveStateDebounced() {
  clearTimeout(_saveT);
  _saveT = setTimeout(() => {
    localStorage.setItem(STATE_KEY, JSON.stringify(collectState()));
  }, 300);
}

function collectState() {
  // Jours + exos
  const days = [];
  document.querySelectorAll('.day').forEach(day => {
    const d = { day: Number(day.dataset.day), type: day.dataset.type, exos: [] };
    day.querySelectorAll('.exo').forEach(exo => {
      const one = { name: exo.dataset.name || exo.querySelector('.name')?.textContent?.trim() || '', vals:{} };
      exo.querySelectorAll('[data-k]').forEach(inp => {
        one.vals[inp.getAttribute('data-k')] = inp.value;
      });
      d.exos.push(one);
    });
    days.push(d);
  });

  const calendar = loadCal();
  const ui = {
    layout: document.body.dataset.layout || 'dense',
    daySelect: document.getElementById('daySelect')?.value || '-1',
    muscu: { rpe: document.getElementById('rpeMuscu')?.value||'0', rest: document.getElementById('restMuscu')?.value||'60s', add05: !!document.getElementById('add05')?.checked },
    cardio: { rpe: document.getElementById('rpeCardio')?.value||'0' },
    tibo:   { rpe: document.getElementById('rpeTibo')?.value||'0' },
    core:   { rpe: document.getElementById('rpeCore')?.value||'0' }
  };

  return { days, calendar, ui };
}

function applyState(state) {
  if (!state) return;

  // calendrier
  if (state.calendar) {
    saveCal(state.calendar);
    renderCalendar();
  }

  // UI
  if (state.ui) {
    document.body.dataset.layout = state.ui.layout || 'dense';
    renderExoChips();
    const ds = document.getElementById('daySelect'); if (ds) ds.value = state.ui.daySelect ?? '-1';
    const _rM = document.getElementById('rpeMuscu'); if (_rM) { _rM.value = state.ui.muscu?.rpe ?? '0'; document.getElementById('rpeMuscuVal').textContent = _rM.value; }
    const _rest = document.getElementById('restMuscu'); if (_rest) _rest.value = state.ui.muscu?.rest ?? '60s';
    const _add = document.getElementById('add05'); if (_add) _add.checked = !!state.ui.muscu?.add05;
    const _rC = document.getElementById('rpeCardio'); if (_rC) { _rC.value = state.ui.cardio?.rpe ?? '0'; document.getElementById('rpeCardioVal').textContent = _rC.value; }
    const _rT = document.getElementById('rpeTibo'); if (_rT) { _rT.value = state.ui.tibo?.rpe ?? '0'; document.getElementById('rpeTiboVal').textContent = _rT.value; }
    const _rCore = document.getElementById('rpeCore'); if (_rCore) { _rCore.value = state.ui.core?.rpe ?? '0'; document.getElementById('rpeCoreVal').textContent = _rCore.value; }
  }

  // exos
  if (state.days?.length) {
    state.days.forEach(sd => {
      const day = document.querySelector(`.day[data-day="${sd.day}"]`);
      if (!day) return;
      sd.exos.forEach(e => {
        let exo = Array.from(day.querySelectorAll('.exo'))
          .find(x => (x.dataset.name || x.querySelector('.name')?.textContent?.trim() || '') === e.name);

        if (!exo && sd.type === 'cardio' && /tibo/i.test(e.name)) {
          addOrUpdateTibo(0);
          exo = day.querySelector('.exo.cardio.tibo');
        }
        if (!exo) return;
        Object.entries(e.vals||{}).forEach(([k,v])=>{
          const input = exo.querySelector(`[data-k="${k}"]`);
          if (input) input.value = v;
        });
      });
    });
  }
}

// autosave sur inputs
document.addEventListener('input', (e)=>{
  if (e.target.closest('.params') || e.target.id==='daySelect') saveStateDebounced();
});

// Export
document.getElementById('btnExport').onclick = ()=>{
  const data = JSON.stringify(collectState(), null, 2);
  const blob = new Blob([data], {type:'application/json'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'coach_v4_state.json'; a.click();
  URL.revokeObjectURL(url);
};

// Import
document.getElementById('btnImport').onclick = ()=> document.getElementById('fileImport').click();
document.getElementById('fileImport').addEventListener('change', async (e)=>{
  const file = e.target.files?.[0]; if(!file) return;
  const text = await file.text();
  try{
    const state = JSON.parse(text);
    applyState(state);
    localStorage.setItem(STATE_KEY, JSON.stringify(state));
    alert('Import OK — sauvegardé.');
  } catch(err){
    alert('Fichier invalide 🤕');
  } finally { e.target.value=''; }
});

// Reset
document.getElementById('btnReset').onclick = ()=>{
  if(!confirm('Tout réinitialiser (plan + calendrier) ?')) return;
  localStorage.removeItem(STATE_KEY);
  localStorage.removeItem(CAL_STORAGE);
  location.reload();
};

// Restauration au chargement
try {
  const raw = localStorage.getItem(STATE_KEY);
  if (raw) applyState(JSON.parse(raw));
} catch(e){ /* ignore */ }
