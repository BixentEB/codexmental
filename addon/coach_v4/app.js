// ===== Calendar =====
const CAL_STORAGE='coach_v4_calendar';
const calEl=document.getElementById('calendar');
const calTitle=document.getElementById('cal-title');
let calState={y:new Date().getFullYear(), m:new Date().getMonth()};
const planJour={1:'full',2:'cardio',3:'full',4:'cardio',5:'full',6:'cardio',0:'off'};
function weekNumber(d){const date=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const dayNum=(date.getUTCDay()||7);date.setUTCDate(date.getUTCDate()+4-dayNum);const yearStart=new Date(Date.UTC(date.getUTCFullYear(),0,1));return Math.ceil((((date-yearStart)/86400000)+1)/7);}
function loadCal(){try{return JSON.parse(localStorage.getItem(CAL_STORAGE)||'{}')}catch(e){return {}}}
function saveCal(v){localStorage.setItem(CAL_STORAGE,JSON.stringify(v))}
function renderCalendar(){
  if(!calEl) return;
  const {y,m}=calState, first=new Date(y,m,1), last=new Date(y,m+1,0);
  const todayStr=new Date().toLocaleDateString('sv-SE');
  calTitle.textContent=first.toLocaleDateString('fr-FR',{month:'long',year:'numeric'});
  calEl.innerHTML='';
  ['#','L','M','M','J','V','S','D'].forEach(h=>{const d=document.createElement('div');d.className='weeknum';d.textContent=h;calEl.appendChild(d);});
  const pad=((first.getDay()-1+7)%7); let cur=0; const valids=loadCal();
  const wn0=weekNumber(new Date(y,m,1)); const wn=document.createElement('div'); wn.className='weeknum'; wn.textContent=wn0; calEl.appendChild(wn); cur++;
  for(let i=0;i<pad;i++){calEl.appendChild(document.createElement('div'));cur++;}
  for(let d=1; d<=last.getDate(); d++){
    if(cur===0){const c=document.createElement('div'); c.className='weeknum'; c.textContent=weekNumber(new Date(y,m,d)); calEl.appendChild(c); cur++;}
    const date=new Date(y,m,d), key=new Date(date.getFullYear(),date.getMonth(),date.getDate()).toLocaleDateString('sv-SE');
    const cell=document.createElement('button'); cell.className='cell'; cell.textContent=d; if(key===todayStr) cell.classList.add('today');
    const type=planJour[date.getDay()]||'off'; const dot=document.createElement('span'); dot.className='badge-mini '+(valids[key]?'ok':type); cell.appendChild(dot);
    cell.title=`${key} • Prévu: ${type}${valids[key]?' • Validé':''}`;
    cell.addEventListener('click',()=>{const cur=loadCal(); if(cur[key]) delete cur[key]; else cur[key]=true; saveCal(cur); renderCalendar();});
    calEl.appendChild(cell); cur++; if(cur===8) cur=0;
  }
}
document.getElementById('cal-prev').onclick=()=>{calState.m--; if(calState.m<0){calState.m=11;calState.y--;} renderCalendar();};
document.getElementById('cal-next').onclick=()=>{calState.m++; if(calState.m>11){calState.m=0;calState.y++;} renderCalendar();};
renderCalendar();

// ===== Collapse & Chips =====
document.querySelectorAll('.day').forEach(day=>{
  const btn=day.querySelector('.chev'), body=day.querySelector('.body');
  btn.addEventListener('click',()=>{const open=btn.getAttribute('aria-expanded')==='true'; btn.setAttribute('aria-expanded',String(!open)); btn.textContent=open?'▸':'▾'; body.classList.toggle('hidden',open);});
});
document.getElementById('toggleLayout').onclick=()=>{
  const old=document.body.dataset.layout||'dense', next=(old==='dense'?'chips':'dense'); document.body.dataset.layout=next; renderExoChips(next);
};
function renderExoChips(layout=(document.body.dataset.layout||'dense')){
  document.querySelectorAll('.exo').forEach(exo=>{
    let chip=exo.querySelector('.chips');
    if(layout==='chips'){
      if(!chip){chip=document.createElement('div'); chip.className='chips'; exo.appendChild(chip);}
      const sets=exo.querySelector('[data-k="sets"]')?.value??'';
      const reps=exo.querySelector('[data-k="reps"]')?.value??'';
      const tempo=exo.querySelector('[data-k="tempo"]')?.value??'';
      const rpe=exo.querySelector('[data-k="rpe"]')?.value??'';
      chip.textContent=`${sets?sets+'×':''}${reps} • ${tempo} • RPE ${rpe}`;
      const p=exo.querySelector('.params'); if(p) p.style.display='none';
    } else { if(chip) chip.remove(); const p=exo.querySelector('.params'); if(p) p.style.display=''; }
  });
}
renderExoChips();

// ===== Tabs =====
document.querySelectorAll('.tab').forEach(t=>{
  t.addEventListener('click',()=>{
    document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.add('hidden'));
    t.classList.add('active'); document.getElementById('panel-'+t.dataset.tab).classList.remove('hidden');
  });
});

// ===== Helpers =====
const daySelect=document.getElementById('daySelect');
const targetDayIdx=()=>{
  const v=Number(daySelect.value);
  if(!isNaN(v) && v>=0) return v;
  const open=document.querySelector('.day .chev[aria-expanded="true"]');
  return open ? Number(open.closest('.day').dataset.day) : new Date().getDay();
};

// ===== LOGIQUE ADAPTATIVE =====
// MUSCU
const simMuscuOut=document.getElementById('simMuscuOut');
const rpeMuscu=document.getElementById('rpeMuscu'), rpeMuscuVal=document.getElementById('rpeMuscuVal');
const add05=document.getElementById('add05'), restMuscu=document.getElementById('restMuscu');
rpeMuscu.oninput=()=>rpeMuscuVal.textContent=rpeMuscu.value;

function simulateMuscu(card, delta){
  const lines=[];
  card.querySelectorAll('.exo:not(.cardio)').forEach(exo=>{
    const setsI=exo.querySelector('[data-k="sets"]'), repsI=exo.querySelector('[data-k="reps"]'), loadI=exo.querySelector('[data-k="load"]');
    if(!repsI) return;
    let sets=Number(setsI?.value||0), reps=Number(repsI.value||0);
    reps+=delta;
    if(reps>15){sets+=1; reps=8;}
    if(reps<6) reps=6;
    let loadTxt=loadI?.value||'';
    if(add05.checked && /\d/.test(loadTxt)){
      loadTxt=loadTxt.replace(/(\d+(?:[.,]\d+)?)/g,m=>String((parseFloat(m.replace(',','.'))+0.5).toFixed(1)).replace('.',','));
    }
    lines.push(`${exo.dataset.name}: ${sets}×${reps}${loadTxt?` @${loadTxt}`:''} • repos ${restMuscu.value}`);
  });
  return lines;
}
function applyMuscu(card, delta){
  card.querySelectorAll('.exo:not(.cardio)').forEach(exo=>{
    const setsI=exo.querySelector('[data-k="sets"]'), repsI=exo.querySelector('[data-k="reps"]'), loadI=exo.querySelector('[data-k="load"]');
    if(!repsI) return;
    let sets=Number(setsI?.value||0), reps=Number(repsI.value||0);
    reps+=delta; if(reps>15){sets+=1; reps=8;} if(reps<6) reps=6;
    if(setsI) setsI.value=sets; repsI.value=reps;
    if(add05.checked && loadI && /\d/.test(loadI.value)){
      loadI.value=loadI.value.replace(/(\d+(?:[.,]\d+)?)/g,m=>String((parseFloat(m.replace(',','.'))+0.5).toFixed(1)).replace('.',','));
    }
  });
  renderExoChips();
}

// CARDIO
const rpeCardio=document.getElementById('rpeCardio'), rpeCardioVal=document.getElementById('rpeCardioVal');
const simCardioOut=document.getElementById('simCardioOut'); rpeCardio.oninput=()=>rpeCardioVal.textContent=rpeCardio.value;
function splitCardio(total){ total=Math.max(15,total); const wu=Math.round(total*0.1), cd=Math.round(total*0.1); const bloc=Math.max(0,total-wu-cd); const cycles=Math.max(1,Math.floor(bloc/5)); return {total,wu,cd,cycles};}
function simulateCardio(card,delta){
  const lines=[];
  card.querySelectorAll('.exo.cardio:not(.tibo)').forEach(exo=>{
    const totalI=exo.querySelector('[data-k="total"]'); const base=Number(totalI?.value||0); const total=Math.max(10, base+delta*5);
    const {wu,cd,cycles}=splitCardio(total);
    lines.push(`${exo.dataset.name||'Cardio'}: ${total} min (WU ${wu} / 4’+1’ × ${cycles} / CD ${cd})`);
  });
  return lines;
}
function applyCardio(card,delta){
  card.querySelectorAll('.exo.cardio:not(.tibo)').forEach(exo=>{
    const totalI=exo.querySelector('[data-k="total"]'), wuI=exo.querySelector('[data-k="wu"]'), cdI=exo.querySelector('[data-k="cd"]'), blocI=exo.querySelector('[data-k="bloc"]');
    const base=Number(totalI?.value||0); const total=Math.max(10, base+delta*5); const {wu,cd,cycles}=splitCardio(total);
    if(totalI) totalI.value=total; if(wuI) wuI.value=wu; if(cdI) cdI.value=cd; if(blocI) blocI.value=`Marche 4’ + Run 1’ × ${cycles}`;
  });
}

// TIBO — jamais sur jours Muscu
const rpeTibo=document.getElementById('rpeTibo'), rpeTiboVal=document.getElementById('rpeTiboVal'); rpeTibo.oninput=()=>rpeTiboVal.textContent=rpeTibo.value;
const simTiboOut=document.getElementById('simTiboOut');
function simulateTibo(delta){const cycles=Math.max(3,5+delta); return [`TIBO Extrm: ~${cycles*6} min (${cycles} cycles 3’/3’)`];}
function addTibo(card,delta){
  if(card.dataset.type!=='cardio'){alert('TIBO ne s’ajoute que sur les jours Cardio.'); return;}
  if(card.querySelector('.exo.cardio.tibo')) return;
  const cycles=Math.max(3,5+delta);
  const b=document.createElement('div'); b.className='exo cardio tibo'; b.innerHTML=`
    <div class="line1"><span class="name">TIBO Extrm</span><span class="goal">Brûle graisse (HIIT guidé)</span></div>
    <div class="line2 params">
      <label>Total <input class="num xs" data-k="total" type="number" value="${cycles*6}"></label>
      <label>WU <input class="num xs" data-k="wu" type="number" value="5"></label>
      <label>CD <input class="num xs" data-k="cd" type="number" value="5"></label>
      <label>Bloc <input class="num lg" data-k="bloc" type="text" value="${cycles} cycles 3’/3’"></label>
    </div>`;
  card.querySelector('.body').appendChild(b);
}

// GAINAGE
const rpeCore=document.getElementById('rpeCore'), rpeCoreVal=document.getElementById('rpeCoreVal'); rpeCore.oninput=()=>rpeCoreVal.textContent=rpeCore.value;
const simCoreOut=document.getElementById('simCoreOut');
function simulateCore(card,delta){
  const lines=[]; card.querySelectorAll('.exo.core').forEach(exo=>{
    const setsI=exo.querySelector('[data-k="sets"]'), secI=exo.querySelector('[data-k="sec"]');
    let sets=Number(setsI?.value||0), sec=Number(secI?.value||0); sec+=delta*5; if(sec>45){sets+=1; sec=30;} if(sec<20) sec=20;
    lines.push(`${exo.dataset.name}: ${sets}×${sec}s`);
  }); return lines;
}
function applyCore(card,delta){
  card.querySelectorAll('.exo.core').forEach(exo=>{
    const setsI=exo.querySelector('[data-k="sets"]'), secI=exo.querySelector('[data-k="sec"]');
    let sets=Number(setsI?.value||0), sec=Number(secI?.value||0); sec+=delta*5; if(sec>45){sets+=1; sec=30;} if(sec<20) sec=20;
    if(setsI) setsI.value=sets; if(secI) secI.value=sec;
  });
}

// ===== Wire buttons =====
const getDayCard=()=>document.querySelector(`.day[data-day="${targetDayIdx()}"]`);
document.getElementById('simMuscu').onclick=()=>{simMuscuOut.textContent=simulateMuscu(getDayCard(), Number(rpeMuscu.value)).join(' • ');}
document.getElementById('applyMuscu').onclick=()=>applyMuscu(getDayCard(), Number(rpeMuscu.value));
document.getElementById('simCardio').onclick=()=>{simCardioOut.textContent=simulateCardio(getDayCard(), Number(rpeCardio.value)).join(' • ');}
document.getElementById('applyCardio').onclick=()=>applyCardio(getDayCard(), Number(rpeCardio.value));
document.getElementById('simTibo').onclick=()=>{simTiboOut.textContent=simulateTibo(Number(rpeTibo.value)).join(' • ');}
document.getElementById('applyTibo').onclick=()=>addTibo(getDayCard(), Number(rpeTibo.value));
document.getElementById('simCore').onclick=()=>{simCoreOut.textContent=simulateCore(getDayCard(), Number(rpeCore.value)).join(' • ');}
document.getElementById('applyCore').onclick=()=>applyCore(getDayCard(), Number(rpeCore.value));
