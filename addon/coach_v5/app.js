/* ===========================
   STATE & HELPERS
=========================== */
const KEY = 'coach_v5_state';

function loadState(){ try{ return JSON.parse(localStorage.getItem(KEY)||'{}'); }catch(e){ return {}; } }
function saveState(s){ localStorage.setItem(KEY, JSON.stringify(s)); }
function ensureState(){
  const s = loadState();
  if(!s.programA) s.programA = seedWeek();
  if(!s.programB) s.programB = seedWeek();
  if(!s.exercises) s.exercises = seedExercises();
  if(!s.library) s.library = [];
  if(!s.calendar) s.calendar = {};
  if(!s.extras) s.extras = [];
  if(!s.ui) s.ui = { activeProgram:'A', activeDay:1, restMuscu:90 };
  saveState(s); return s;
}
function seedWeek(){ return {
  1:{type:'full',items:[]},2:{type:'cardio',items:[]},3:{type:'full',items:[]},
  4:{type:'cardio',items:[]},5:{type:'full',items:[]},6:{type:'cardio',items:[]},7:{type:'off',items:[]}
};}
function seedExercises(){
  return [
    {id:'bench_bar', name_fr:'Développé couché barre', name_en:'Barbell Bench Press',
     category:['Muscu','Barre'], groups:['Pecs médian','Triceps','Ant. delts'], difficulty:2,
     metrics:['sets','reps','tempo','rpe','load'], defaults:{sets:4,reps:10,tempo:'2-1-1',rpe:7.5,load:'10–20kg'}},
    {id:'goblet_squat', name_fr:'Goblet Squat', name_en:'Goblet Squat',
     category:['Muscu','Haltères'], groups:['Cuisses','Fessiers','Abdos'], difficulty:1,
     metrics:['sets','reps','tempo','rpe','load'], defaults:{sets:4,reps:15,tempo:'3-1-1',rpe:7,load:'5kg'}},
    {id:'row_band', name_fr:'Row élastique', name_en:'Band Row',
     category:['Muscu','Élastique'], groups:['Dos','Biceps'], difficulty:1,
     metrics:['sets','reps','tempo','rpe'], defaults:{sets:3,reps:15,tempo:'2-1-2',rpe:7}},
    {id:'plank', name_fr:'Planche', name_en:'Plank',
     category:['Gainage','PDC'], groups:['Core','Transverse'], difficulty:1,
     metrics:['sets','sec','rpe'], defaults:{sets:3,sec:40,rpe:6}},
    {id:'walk_run', name_fr:'Marche + Run', name_en:'Walk/Run',
     category:['Cardio'], groups:['Aérobie'], difficulty:1,
     metrics:['total','wu','cd','bloc'], defaults:{total:35,wu:5,cd:5,bloc:'4’+1’ × 5'}},
    {id:'tibo_extrm', name_fr:'TIBO Extrm', name_en:'TIBO Extreme',
     category:['Cardio'], groups:['HIIT'], difficulty:2,
     metrics:['total','wu','cd','bloc'], defaults:{total:36,wu:5,cd:5,bloc:'3’/3’ × 5'}}
  ];
}
function fmtHM(min){ const h=Math.floor(min/60), m=min%60; return `${h}h${String(m).padStart(2,'0')}`; }
function dayLabel(i){ return ['','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi','Dimanche'][i]; }

/* ===========================
   ROUTER (hash)
=========================== */
const view = document.getElementById('view');
const tabs = document.querySelectorAll('.tab');

function setActiveTab(hash){
  tabs.forEach(t=>t.classList.toggle('active', t.getAttribute('href')===hash));
}
function route(){
  ensureState();
  const hash = location.hash || '#/plan';
  setActiveTab(hash);
  view.innerHTML = '';
  if(hash==='#/plan') renderProgram('A');
  else if(hash==='#/builder') renderProgramB();
  else if(hash==='#/encyclo') renderEncyclopedie();
  else if(hash==='#/lexique') renderLexique();
  else if(hash==='#/settings') renderSettings();
  updateMiniStats();
}
window.addEventListener('hashchange', route);
route();

/* ===========================
   MINI STATS
=========================== */
function estimateDayMinutes(day){
  const s = ensureState(); const prog=s['program'+s.ui.activeProgram]; const d=prog[day];
  let min=0;
  d.items.forEach(it=>{
    const ex = s.exercises.find(x=>x.id===it.id); if(!ex) return;
    const v = it.vals||{};
    if(ex.category.includes('Cardio')) min += Number(v.total||ex.defaults.total||0);
    else if(ex.category.includes('Gainage')){
      const sets=Number(v.sets||ex.defaults.sets||0), sec=Number(v.sec||ex.defaults.sec||0);
      min += Math.round((sets*sec)/60);
    } else {
      const sets=Number(v.sets||ex.defaults.sets||0), reps=Number(v.reps||ex.defaults.reps||0);
      const rest = Number(ensureState().ui.restMuscu||90);
      const sec = sets*((reps*2.5)+rest);
      min += Math.round(sec/60);
    }
  });
  return min;
}
function updateMiniStats(){
  const s = ensureState(); const p = s['program'+s.ui.activeProgram];
  let full=0, cardio=0, total=0;
  Object.values(p).forEach(d=>{ if(d.type==='full') full++; if(d.type==='cardio') cardio++; });
  for(let i=1;i<=7;i++) total += estimateDayMinutes(i);
  document.getElementById('statFull').textContent=full;
  document.getElementById('statCardio').textContent=cardio;
  document.getElementById('statHours').textContent=fmtHM(total);
}

/* ===========================
   PROGRAMME A (Plan)
=========================== */
function renderProgram(programKey='A'){
  const s = ensureState(); s.ui.activeProgram=programKey; saveState(s);

  const sec=document.createElement('section'); sec.className='section';
  sec.innerHTML = `<div class="card"><h2>Programme ${programKey} — Hebdo</h2></div>`;
  const card=sec.firstElementChild;

  const days=[[1,'Lundi'],[2,'Mardi'],[3,'Mercredi'],[4,'Jeudi'],[5,'Vendredi'],[6,'Samedi'],[7,'Dimanche']];
  const prog=s['program'+programKey];

  days.forEach(([idx,label])=>{
    const d=prog[idx];
    const node=document.createElement('div'); node.className='dayCard'; node.dataset.type=d.type;
    node.innerHTML=`
      <header>
        <strong>${label}</strong>
        <div class="tools">
          <select class="dayType">
            <option value="full" ${d.type==='full'?'selected':''}>Full Body</option>
            <option value="cardio" ${d.type==='cardio'?'selected':''}>Cardio</option>
            <option value="off" ${d.type==='off'?'selected':''}>Off</option>
          </select>
          <button class="btn addFromEncy">+ Ajouter (Encyclo)</button>
        </div>
      </header>
      <div class="body"></div>
    `;
    const body=node.querySelector('.body');
    d.items.forEach((it,i)=> body.appendChild(renderExoRow(programKey, idx, it, i)));

    node.querySelector('.dayType').onchange=(ev)=>{ d.type=ev.target.value; saveState(s); node.dataset.type=d.type; };
    node.querySelector('.addFromEncy').onclick=()=>{
      const st=ensureState(); st.ui.activeProgram=programKey; st.ui.activeDay=idx; saveState(st);
      location.hash='#/encyclo';
    };

    card.appendChild(node);
  });

  // sync rapide
  const rpe = document.getElementById('syncRpe'); const rpeVal=document.getElementById('syncRpeVal');
  rpe.oninput=()=> rpeVal.textContent=rpe.value;
  document.getElementById('restMuscuBand').value = s.ui.restMuscu||90;
  document.getElementById('btnApplySync').onclick=()=>{
    s.ui.restMuscu = Number(document.getElementById('restMuscuBand').value||90);
    applySync(programKey, document.getElementById('syncScope').value, document.getElementById('syncType').value, Number(rpe.value||0));
    saveState(s); route();
  };

  view.appendChild(sec);
}
function renderExoRow(programKey, dayIdx, item, itemIdx){
  const s = ensureState(); const ex=s.exercises.find(x=>x.id===item.id); const vals=item.vals||{};
  const row=document.createElement('div'); row.className='exo';
  row.innerHTML = `
    <div class="name">${ex?.name_fr||item.id}</div>
    <div class="params"></div>
    <div class="tools"><button class="btn-sm" data-del>Supprimer</button></div>
  `;
  const params=row.querySelector('.params');
  (ex?.metrics||[]).forEach(m=>{
    const v = vals[m] ?? ex.defaults?.[m] ?? '';
    const size=(m==='tempo'||m==='bloc')?'lg' : (m==='total'||m==='load')?'sm':'xs';
    const lab = m.toUpperCase();
    const el=document.createElement('label');
    el.innerHTML=`${lab} <input class="num ${size}" data-k="${m}" value="${v}">`;
    params.appendChild(el);
  });
  row.addEventListener('input',(ev)=>{
    const k=ev.target.getAttribute('data-k'); if(!k) return;
    const st=ensureState(); const it=st['program'+programKey][dayIdx].items[itemIdx];
    it.vals[k]=ev.target.value; saveState(st); updateMiniStats();
  });
  row.querySelector('[data-del]').onclick=()=>{
    const st=ensureState(); st['program'+programKey][dayIdx].items.splice(itemIdx,1); saveState(st); route();
  };
  return row;
}

/* ===========================
   PROGRAMME B (Builder drag & drop)
=========================== */
function renderProgramB(){
  const s=ensureState(); s.ui.activeProgram='B'; saveState(s);

  const panel=document.createElement('section'); panel.className='section';
  panel.innerHTML = `
    <div class="card">
      <h2>Programme B — Maquette (drag & drop)</h2>
      <div class="row">
        <div class="palette" id="palette"></div>
        <div class="tools">
          <button id="btnToPlanB" class="btn primary">Valider en plan</button>
          <button id="btnCopyA" class="btn">Copier vers A</button>
        </div>
      </div>
      <div class="grid7" id="board"></div>
    </div>
  `;
  view.appendChild(panel);

  const pal=panel.querySelector('#palette');
  pal.innerHTML = `
    <div class="tools">
      <input type="search" class="search" id="q" placeholder="Rechercher exo FR/EN..." />
    </div>
    <div id="chips"></div>`;
  const chipsWrap=pal.querySelector('#chips');
  function refreshPalette(){
    const st=ensureState(); const q=(pal.querySelector('#q').value||'').toLowerCase().trim();
    chipsWrap.innerHTML=''; st.exercises
      .filter(e=>!q || `${e.name_fr} ${e.name_en}`.toLowerCase().includes(q))
      .slice(0,50)
      .forEach(e=>{
        const c=document.createElement('div'); c.className='chip'; c.draggable=true; c.textContent=e.name_fr; c.dataset.id=e.id;
        c.addEventListener('dragstart',(ev)=> ev.dataTransfer.setData('text/plain', e.id));
        chipsWrap.appendChild(c);
      });
  }
  pal.querySelector('#q').addEventListener('input', refreshPalette);
  refreshPalette();

  const labels=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim']; const board=panel.querySelector('#board');
  labels.forEach((lab,i)=>{
    const col=document.createElement('div'); col.className='col'; col.innerHTML=`<h4>${lab}</h4><div class="drop"></div>`;
    const drop=col.querySelector('.drop');
    drop.addEventListener('dragover',(e)=> e.preventDefault());
    drop.addEventListener('drop',(e)=>{
      e.preventDefault();
      const id=e.dataTransfer.getData('text/plain'); const st=ensureState(); const ex=st.exercises.find(x=>x.id===id); if(!ex) return;
      const chip=document.createElement('div'); chip.className='chip'; chip.textContent=ex.name_fr; chip.dataset.id=id;
      drop.appendChild(chip);
    });
    board.appendChild(col);
  });

  panel.querySelector('#btnToPlanB').onclick=()=>{
    const st=ensureState(); const prog=st.programB=seedWeek();
    Array.from(board.querySelectorAll('.col')).forEach((col,idx)=>{
      const day=idx+1, items=[];
      col.querySelectorAll('.chip').forEach(ch=>{
        const ex=st.exercises.find(x=>x.id===ch.dataset.id); if(!ex) return;
        items.push({id:ex.id, vals:{...ex.defaults}});
      });
      prog[day].items=items;
      prog[day].type = items.some(it=>st.exercises.find(e=>e.id===it.id)?.category.includes('Cardio')) ? 'cardio' : (items.length?'full':'off');
    });
    saveState(st); alert('Maquette validée dans Programme B ✅');
  };

  panel.querySelector('#btnCopyA').onclick=()=>{
    const st=ensureState(); st.programA = JSON.parse(JSON.stringify(st.programB)); saveState(st);
    alert('Programme B copié vers A ✅');
  };
}

/* ===========================
   ENCYCLOPÉDIE
=========================== */
function renderEncyclopedie(){
  const s=ensureState();
  const sec=document.createElement('section'); sec.className='section';
  sec.innerHTML = `
    <div class="card">
      <h2>Encyclopédie — Gestion & insertion</h2>
      <div class="tools">
        <input id="qExo" class="search" placeholder="Rechercher (FR/EN, groupes)…">
        <select id="cat">
          <option value="">Toutes catégories</option>
          <option>Muscu</option><option>Cardio</option><option>Gainage</option><option>Élastique</option><option>PDC</option>
        </select>
        <select id="progPick"><option value="A" ${s.ui.activeProgram==='A'?'selected':''}>Programme A</option><option value="B" ${s.ui.activeProgram==='B'?'selected':''}>Programme B</option></select>
        <select id="dayPick">
          <option value="1">Lundi</option><option value="2">Mardi</option><option value="3">Mercredi</option><option value="4">Jeudi</option><option value="5">Vendredi</option><option value="6">Samedi</option><option value="7">Dimanche</option>
        </select>
        <button id="btnNew" class="btn">Créer un exo</button>
      </div>
      <div class="list" id="list"></div>
    </div>
  `;
  view.appendChild(sec);

  const list=sec.querySelector('#list'); const q=sec.querySelector('#qExo'); const cat=sec.querySelector('#cat');
  const progPick=sec.querySelector('#progPick'); const dayPick=sec.querySelector('#dayPick');

  function infoText(e){
    return `${e.name_fr} (${e.name_en})
Catégories: ${(e.category||[]).join(', ')}
Cibles: ${(e.groups||[]).join(', ')}
Difficulté: ${e.difficulty||1}
Metrics: ${(e.metrics||[]).join(', ')}
Notes: ${e.notes||'-'}`;
  }
  function renderList(){
    const st=ensureState(); const qq=(q.value||'').toLowerCase().trim(); const c=cat.value||'';
    list.innerHTML='';
    st.exercises
      .filter(e=>{
        const txt=`${e.name_fr} ${e.name_en} ${(e.groups||[]).join(' ')}`.toLowerCase();
        const okQ=!qq||txt.includes(qq); const okC=!c||(e.category||[]).includes(c);
        return okQ&&okC;
      })
      .forEach(e=>{
        const card=document.createElement('div'); card.className='cardExo';
        card.innerHTML=`
          <div class="title">${e.name_fr} <span class="meta">(${e.name_en})</span></div>
          <div class="meta">${(e.category||[]).join(' / ')} — ${ (e.groups||[]).join(', ') } — diff ${e.difficulty||1}</div>
          <div class="buttons">
            <button class="btn" data-info>ℹ️</button>
            <button class="btn" data-fav>⭐</button>
            <button class="btn primary" data-add>➕ Ajouter au ${progPick.value} — ${dayLabel(Number(dayPick.value))}</button>
          </div>`;
        card.querySelector('[data-info]').onclick=()=> alert(infoText(e));
        card.querySelector('[data-fav]').onclick=()=>{ const st=ensureState(); if(!st.library.includes(e.id)) st.library.push(e.id); saveState(st); alert('Ajouté aux favoris ⭐'); };
        card.querySelector('[data-add]').onclick=()=>{
          const st=ensureState(); const prog=st['program'+progPick.value]; const day=Number(dayPick.value);
          prog[day].items.push({id:e.id, vals:{...e.defaults}});
          if((e.category||[]).includes('Cardio')) prog[day].type='cardio'; else if(prog[day].type==='off') prog[day].type='full';
          saveState(st); alert(`Ajouté à ${dayLabel(day)} du programme ${progPick.value} ✔`);
        };
        list.appendChild(card);
      });
  }
  q.oninput=renderList; cat.onchange=renderList; progPick.onchange=renderList; dayPick.onchange=renderList; renderList();

  sec.querySelector('#btnNew').onclick=()=>{
    const name = prompt('Nom FR de l’exercice ?'); if(!name) return;
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g,'_'); const st=ensureState();
    st.exercises.push({id, name_fr:name, name_en:name, category:['Muscu'], groups:[], difficulty:1, metrics:['sets','reps','tempo','rpe'], defaults:{sets:3,reps:12,tempo:'2-1-1',rpe:7}});
    saveState(st); renderList();
  };
}

/* ===========================
   LEXIQUE & RÉGLAGES
=========================== */
function renderLexique(){
  const sec=document.createElement('section'); sec.className='section';
  sec.innerHTML=`
    <div class="card"><h2>Lexique</h2>
      <p><strong>WU</strong>=Warm-Up (échauffement) • <strong>CD</strong>=Cool-Down (retour au calme)</p>
      <p><strong>RPE</strong>=intensité ressentie 0–10 • <strong>Tempo</strong>=cadence (ex: 2-1-1)</p>
      <p><strong>Zone 2</strong>=aérobie modérée • <strong>HIIT</strong>=intervalles haute intensité</p>
      <p>Abdos dynamiques → <em>Muscu</em> ; Core statique/dynamique → <em>Gainage</em>.</p>
    </div>`;
  view.appendChild(sec);
}
function renderSettings(){
  const s=ensureState(); const sec=document.createElement('section'); sec.className='section';
  sec.innerHTML=`
    <div class="card"><h2>Réglages</h2>
      <div class="row">
        <label>Repos muscu par défaut
          <select id="restDefault"><option value="60">60s</option><option value="90">90s</option><option value="120">120s</option></select>
        </label>
        <button id="saveSettings" class="btn primary">Enregistrer</button>
      </div>
      <p class="hint">Export/Import/Reset sont dans la topbar ↑</p>
    </div>`;
  view.appendChild(sec);
  const sel=sec.querySelector('#restDefault'); sel.value=s.ui.restMuscu||90;
  sec.querySelector('#saveSettings').onclick=()=>{ const st=ensureState(); st.ui.restMuscu=Number(sel.value); saveState(st); alert('OK'); };
}

/* ===========================
   SYNC GLOBALE (règles)
=========================== */
function applySync(programKey, scope, type, delta){
  const s=ensureState(); const prog=s['program'+programKey];
  const days = scope==='day' ? [s.ui.activeDay||1] : [1,2,3,4,5,6,7];
  days.forEach(d=>{
    prog[d].items.forEach(it=>{
      const ex = s.exercises.find(x=>x.id===it.id); if(!ex) return;
      const muscu = ex.category.includes('Muscu') && !ex.category.includes('Cardio') && !ex.category.includes('Gainage');
      const cardio = ex.category.includes('Cardio');
      const core   = ex.category.includes('Gainage');

      if(type!=='all' && (
        (type==='muscu'&&!muscu) || (type==='cardio'&&!cardio) || (type==='tibo'&&!(cardio&&ex.id.includes('tibo'))) || (type==='core'&&!core)
      )) return;

      it.vals = it.vals || {};
      if(muscu){
        const cap=15;
        it.vals.reps = Number(it.vals.reps??ex.defaults.reps??10) + delta;
        if(it.vals.reps>cap){ it.vals.sets = Number(it.vals.sets??ex.defaults.sets??3)+1; it.vals.reps = 9; }
        if(it.vals.reps<6) it.vals.reps = 6;
      } else if(cardio){
        it.vals.total = Math.max(10, Number(it.vals.total??ex.defaults.total??30) + delta*5);
        const wu=Math.round(it.vals.total*0.1), cd=Math.round(it.vals.total*0.1);
        it.vals.wu=wu; it.vals.cd=cd;
        if(ex.id.includes('tibo')){
          const cycles=Math.max(3, Math.round(it.vals.total/6));
          it.vals.bloc=`3’/3’ × ${cycles}`;
        } else {
          const cycles=Math.max(1, Math.floor((it.vals.total-wu-cd)/5));
          it.vals.bloc=`4’+1’ × ${cycles}`;
        }
      } else if(core){
        it.vals.sec = Math.max(20, Number(it.vals.sec??ex.defaults.sec??30) + delta*5);
        if(it.vals.sec>45){ it.vals.sets = Number(it.vals.sets??ex.defaults.sets??3)+1; it.vals.sec=30; }
      }
    });
  });
  saveState(s);
}

/* ===========================
   TOPBAR actions
=========================== */
document.getElementById('btnExport').onclick=()=>{
  const data=JSON.stringify(ensureState(),null,2);
  const url=URL.createObjectURL(new Blob([data],{type:'application/json'}));
  const a=document.createElement('a'); a.href=url; a.download='coach_v5_state.json'; a.click(); URL.revokeObjectURL(url);
};
document.getElementById('btnImport').onclick=()=> document.getElementById('fileImport').click();
document.getElementById('fileImport').addEventListener('change', async (e)=>{
  const f=e.target.files?.[0]; if(!f) return;
  try{ const txt=await f.text(); const st=JSON.parse(txt); saveState(st); alert('Import OK'); location.reload(); }
  catch{ alert('Fichier invalide'); }
});
document.getElementById('btnReset').onclick=()=>{
  if(!confirm('Tout réinitialiser ?')) return;
  localStorage.removeItem(KEY); location.reload();
};

/* Init stats */
ensureState(); updateMiniStats();

/* Anti-halo scroll */
let _t=null; window.addEventListener('scroll',()=>{ document.body.classList.add('scrolling'); clearTimeout(_t); _t=setTimeout(()=>document.body.classList.remove('scrolling'),120); },{passive:true});
