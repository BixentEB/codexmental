// app.js — Coach v3
const CAL_STORAGE = 'coach_v3_calendar';
const CYCLE_STORAGE = 'coach_v3_cycle_start';
const prefs = { layout: 'dense' }; // 'dense' | 'chips'

// ===== Calendar Pro =====
const calEl = document.getElementById('calendar');
const calTitle = document.getElementById('cal-title');
let calState = { y: new Date().getFullYear(), m: new Date().getMonth() };
const planJour = {1:'full',2:'cardio',3:'full',4:'cardio',5:'full',6:'cardio',0:'off'}; // Dim=0

function weekNumber(d) {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = (date.getUTCDay() || 7);
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(),0,1));
  return Math.ceil((((date - yearStart) / 86400000) + 1)/7);
}

function loadCal() {
  try { return JSON.parse(localStorage.getItem(CAL_STORAGE) || '{}'); }
  catch(e){ return {}; }
}
function saveCal(v) { localStorage.setItem(CAL_STORAGE, JSON.stringify(v)); }

function renderCalendar() {
  if(!calEl) return;
  const { y, m } = calState;
  const first = new Date(y, m, 1);
  const last = new Date(y, m+1, 0);
  const todayStr = new Date().toISOString().slice(0,10);

  calTitle.textContent = first.toLocaleDateString('fr-FR',{ month:'long', year:'numeric' });
  calEl.innerHTML = '';

  const heads = ['#','L','M','M','J','V','S','D'];
  for (const h of heads) {
    const hd = document.createElement('div');
    hd.className = 'weeknum';
    hd.textContent = h;
    calEl.appendChild(hd);
  }

  const pad = ((first.getDay() - 1 + 7) % 7);
  let curRowDayCount = 0;
  const valids = loadCal();

  const wn0 = weekNumber(new Date(y,m,1));
  const wnCell0 = document.createElement('div');
  wnCell0.className = 'weeknum';
  wnCell0.textContent = wn0;
  calEl.appendChild(wnCell0);
  curRowDayCount++;

  for (let i=0;i<pad;i++){ const e=document.createElement('div'); calEl.appendChild(e); curRowDayCount++; }

  for (let d=1; d<=last.getDate(); d++) {
    if (curRowDayCount===0) {
      const wn = weekNumber(new Date(y,m,d));
      const wnc = document.createElement('div');
      wnc.className = 'weeknum'; wnc.textContent = wn;
      calEl.appendChild(wnc);
      curRowDayCount++;
    }

    const date = new Date(y, m, d);
    const key = date.toISOString().slice(0,10);
    const cell = document.createElement('button');
    cell.className = 'cell';
    cell.textContent = d;
    if (key===todayStr) cell.classList.add('today');

    const dow = date.getDay();
    const type = planJour[dow] || 'off';
    const dot = document.createElement('span');
    dot.className = 'badge-mini ' + type;
    if (valids[key]) dot.className = 'badge-mini ok';
    cell.appendChild(dot);

    cell.title = `${key} • Prévu: ${type}${valids[key]?' • Validé':''}`;
    cell.addEventListener('click', ()=>{
      const cur = loadCal();
      if (cur[key]) delete cur[key]; else cur[key] = true;
      saveCal(cur);
      renderCalendar();
    });

    calEl.appendChild(cell);
    curRowDayCount++;
    if (curRowDayCount===8) curRowDayCount=0;
  }
}

document.getElementById('cal-prev').addEventListener('click', ()=>{
  calState.m--; if(calState.m<0){ calState.m=11; calState.y--; } renderCalendar();
});
document.getElementById('cal-next').addEventListener('click', ()=>{
  calState.m++; if(calState.m>11){ calState.m=0; calState.y++; } renderCalendar();
});
renderCalendar();

// ===== Collapse days
document.querySelectorAll('.day').forEach(day=>{
  const btn = day.querySelector('.chev');
  const body = day.querySelector('.body');
  btn.addEventListener('click', ()=>{
    const open = btn.getAttribute('aria-expanded')==='true';
    btn.setAttribute('aria-expanded', String(!open));
    btn.textContent = open ? '▸' : '▾';
    body.classList.toggle('hidden', open);
  });
});

// ===== Notes toggle
document.querySelectorAll('.note-btn').forEach(btn=>{
  btn.addEventListener('click', ()=>{
    const note = btn.closest('.exo').querySelector('.note');
    note.classList.toggle('hidden');
  });
});

// ===== Layout toggle (dense <-> chips)
document.getElementById('toggleLayout').addEventListener('click', ()=>{
  prefs.layout = (prefs.layout==='dense' ? 'chips' : 'dense');
  document.body.dataset.layout = prefs.layout;
  renderExoChips();
});

function renderExoChips(){
  document.querySelectorAll('.exo').forEach(exo=>{
    let chip = exo.querySelector('.chips');
    if (prefs.layout==='chips'){
      if (!chip){
        chip = document.createElement('div');
        chip.className = 'chips';
        exo.appendChild(chip);
      }
      const sets = exo.querySelector('[data-k="sets"]')?.value ?? '';
      const reps = exo.querySelector('[data-k="reps"]')?.value ?? '';
      const tempo = exo.querySelector('[data-k="tempo"]')?.value ?? '';
      const rpe = exo.querySelector('[data-k="rpe"]')?.value ?? '';
      chip.textContent = `${sets}×${reps} • ${tempo} • RPE ${rpe}`;
      exo.querySelector('.params').style.display = 'none';
    } else {
      if (chip) chip.remove();
      exo.querySelector('.params').style.display = '';
    }
  });
}
renderExoChips();

// ===== Difficulty presets + custom + 4-week rotation
const presetBtns = document.querySelectorAll('#difficulty [data-preset]');
const rpeCustom = document.getElementById('rpeCustom');
const rpeVal = document.getElementById('rpeVal');
const add05 = document.getElementById('add05');
let rpeOffset = 0;

presetBtns.forEach(b=>b.addEventListener('click', ()=>{
  presetBtns.forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  rpeOffset = Number(b.dataset.preset);
  rpeCustom.value = rpeOffset;
  rpeVal.textContent = String(rpeOffset);
}));

rpeCustom.addEventListener('input', ()=>{
  rpeOffset = Number(rpeCustom.value);
  rpeVal.textContent = String(rpeOffset);
  presetBtns.forEach(x=>x.classList.remove('active'));
});

const cycleStartInput = document.getElementById('cycleStart');
const cycleInfo = document.getElementById('cycleInfo');
function loadCycleStart(){
  const v = localStorage.getItem(CYCLE_STORAGE);
  if (v) cycleStartInput.value = v;
}
function saveCycleStart(){
  if (cycleStartInput.value) localStorage.setItem(CYCLE_STORAGE, cycleStartInput.value);
}
function updateCycleInfo(){
  if (!cycleStartInput.value){ cycleInfo.textContent = 'Définis une date de début de cycle'; return; }
  const s = new Date(cycleStartInput.value + 'T00:00:00');
  const now = new Date();
  const diffDays = Math.floor((now - s)/(1000*60*60*24));
  const week = Math.max(1, Math.floor(diffDays/7)+1);
  const block = ((Math.floor((week-1)/4))%2===0) ? 'A' : 'B';
  const tempo = block==='A' ? '2-1-2' : '3-1-1';
  const repRange = block==='A' ? '10–15' : '8–12 (+charge)';
  cycleInfo.textContent = `Semaine ${week} • Tempo ${tempo} • ${repRange}`;
}
loadCycleStart(); updateCycleInfo();
cycleStartInput.addEventListener('change', ()=>{ saveCycleStart(); updateCycleInfo(); });

function currentDayIndex(){ return new Date().getDay(); } // 0..6
function applyToDay(dayIdx){
  const card = document.querySelector(`.day[data-day="${dayIdx}"]`);
  if (!card) return;
  const blockB = cycleInfo.textContent.includes('3-1-1');
  card.querySelectorAll('.exo').forEach(exo=>{
    const setsI = exo.querySelector('[data-k="sets"]');
    const repsI = exo.querySelector('[data-k="reps"]');
    const tempoI = exo.querySelector('[data-k="tempo"]');
    const rpeI = exo.querySelector('[data-k="rpe"]');
    const loadI = exo.querySelector('[data-k="load"]');

    if (tempoI) tempoI.value = blockB ? '3-1-1' : '2-1-2';
    if (repsI) repsI.value = Math.max(1, Number(repsI.value) + rpeOffset);
    if (setsI) setsI.value = Math.max(1, Number(setsI.value) + Math.floor(rpeOffset/2));
    if (rpeI)  rpeI.value = (Number(rpeI.value) + rpeOffset).toString().replace(/\.0$/,'');

    if (add05.checked && loadI && /\d/.test(loadI.value)){
      loadI.value = loadI.value.replace(/(\d+(?:[.,]\d+)?)/g, (m)=>{
        const n = parseFloat(m.replace(',','.'));
        return String((n+0.5).toFixed(1)).replace('.',',');
      });
    }
  });
  renderExoChips();
}

document.getElementById('applyToday').addEventListener('click', ()=>applyToDay(currentDayIndex()));
document.getElementById('resetToday').addEventListener('click', ()=>location.reload());
