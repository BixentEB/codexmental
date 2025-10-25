(function(){
  const list = document.getElementById('list');
  const board = document.getElementById('board');
  const q = document.getElementById('qExo');
  const dayPick = document.getElementById('dayPick');

  function shortDay(i){ return ['','Lun','Mar','Mer','Jeu','Ven','Sam','Dim'][i]; }

  // récupère les exos déjà présents dans Programme A pour ne RIEN perdre
  function collectFromA(){
    const s = V5.getState(); const seen = new Map();
    if(s.programA){
      Object.values(s.programA).forEach(d=>{
        const arr = d?.exos || d?.items || [];
        arr.forEach(e=>{
          const name = e.name || e?.vals?.name || e?.id || '';
          if(!name) return;
          if(!seen.has(name)) seen.set(name, {
            id: name.toLowerCase().replace(/[^a-z0-9]+/g,'_'),
            name_fr: name, name_en: name,
            category: guessCategory(name),
            groups: [], difficulty: 1,
            metrics: guessMetrics(name),
            defaults: guessDefaults(name, e)
          });
        });
      });
    }
    return Array.from(seen.values());
  }
  function guessCategory(name){
    const n=name.toLowerCase();
    if(n.includes('run')||n.includes('marche')||n.includes('cardio')||n.includes('tibo')) return ['Cardio'];
    if(n.includes('planche')||n.includes('gainage')||n.includes('plank')) return ['Gainage'];
    return ['Muscu'];
  }
  function guessMetrics(name){
    const cat = guessCategory(name)[0];
    if(cat==='Cardio') return ['total','wu','cd','bloc'];
    if(cat==='Gainage')return ['sets','sec','rpe'];
    return ['sets','reps','tempo','rpe','load'];
  }
  function guessDefaults(name, e){
    const cat = guessCategory(name)[0];
    if(cat==='Cardio') return { total: 35, wu:5, cd:5, bloc:'4’+1’ × 5' };
    if(cat==='Gainage')return { sets:3, sec:40, rpe:6 };
    return { sets: e?.vals?.sets||3, reps: e?.vals?.reps||12, tempo: e?.vals?.tempo||'2-1-1', rpe: e?.vals?.rpe||7, load: e?.vals?.load||'' };
  }
  function seedIfEmpty(arr){
    if(arr.length) return arr;
    return [
      {id:'bench_bar', name_fr:'Développé couché barre', name_en:'Barbell Bench Press', category:['Muscu'], groups:['Pecs','Triceps'], difficulty:2, metrics:['sets','reps','tempo','rpe','load'], defaults:{sets:4,reps:10,tempo:'2-1-1',rpe:7.5,load:'10–20kg'}},
      {id:'goblet_squat', name_fr:'Goblet Squat', name_en:'Goblet Squat', category:['Muscu'], groups:['Cuisses','Fessiers'], difficulty:1, metrics:['sets','reps','tempo','rpe','load'], defaults:{sets:4,reps:15,tempo:'3-1-1',rpe:7,load:'5kg'}},
      {id:'walk_run', name_fr:'Marche + Run', name_en:'Walk/Run', category:['Cardio'], groups:['Aérobie'], difficulty:1, metrics:['total','wu','cd','bloc'], defaults:{total:35,wu:5,cd:5,bloc:'4’+1’ × 5'}},
      {id:'plank', name_fr:'Planche', name_en:'Plank', category:['Gainage'], groups:['Core'], difficulty:1, metrics:['sets','sec','rpe'], defaults:{sets:3,sec:40,rpe:6}},
      {id:'tibo_extrm', name_fr:'TIBO Extrm', name_en:'TIBO Extreme', category:['Cardio'], groups:['HIIT'], difficulty:2, metrics:['total','wu','cd','bloc'], defaults:{total:36,wu:5,cd:5,bloc:'3’/3’ × 5'}}
    ];
  }

  let catalog = seedIfEmpty(collectFromA());

  function renderCatalog(){
    const qq=(q.value||'').toLowerCase().trim();
    list.innerHTML='';
    catalog
      .filter(e=>!qq || `${e.name_fr} ${e.name_en}`.toLowerCase().includes(qq))
      .forEach(e=>{
        const card=document.createElement('div'); card.className='cardExo';
        card.innerHTML=`
          <div class="title">${e.name_fr} <span class="meta">(${e.name_en})</span></div>
          <div class="meta">${(e.category||[]).join('/')} — ${(e.groups||[]).join(', ')}</div>
          <div class="buttons">
            <button class="btn-sm" data-info>ℹ️</button>
            <button class="btn-sm primary" data-add>➕ Ajouter à B — ${shortDay(Number(dayPick.value))}</button>
          </div>
        `;
        card.querySelector('[data-info]').onclick=()=>{
          alert(`${e.name_fr} (${e.name_en})\nCat: ${(e.category||[]).join(', ')}\nGroups: ${(e.groups||[]).join(', ')}\nMetrics: ${e.metrics.join(', ')}`);
        };
        card.querySelector('[data-add]').onclick=()=> addToB(e, Number(dayPick.value));
        card.draggable=true;
        card.addEventListener('dragstart', ev=> ev.dataTransfer.setData('text/plain', e.id));
        list.appendChild(card);
      });
  }
  q?.addEventListener('input', renderCatalog);
  dayPick?.addEventListener('change', renderCatalog);
  renderCatalog();

  // board 7 colonnes (mini maquette B)
  const labels=['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  labels.forEach((lab,i)=>{
    const col=document.createElement('div'); col.className='col';
    col.innerHTML=`<h4>${lab}</h4><div class="drop" data-day="${i+1}"></div>`;
    const drop=col.querySelector('.drop');
    drop.addEventListener('dragover', e=> e.preventDefault());
    drop.addEventListener('drop', e=>{
      e.preventDefault();
      const id=e.dataTransfer.getData('text/plain');
      const ex=catalog.find(x=>x.id===id); if(!ex) return;
      addToB(ex, Number(drop.dataset.day));
      drawBoard();
    });
    board.appendChild(col);
  });

  function addToB(ex, day){
    const s=V5.ensureProgramB();
    const prog=s.programB || {};
    const d=prog[day] || (prog[day]={type:'full',items:[]});
    (d.items = d.items||[]).push({ id: ex.id, vals: {...ex.defaults}, name: ex.name_fr });
    if((ex.category||[]).includes('Cardio')) d.type='cardio';
    V5.setState(s);
    drawBoard();
  }

  function drawBoard(){
    const s=V5.getState(); const prog=s.programB||{};
    board.querySelectorAll('.drop').forEach(drop=>{
      const day=Number(drop.dataset.day); drop.innerHTML='';
      const d=prog[day]; (d?.items||[]).forEach(it=>{
        const ex = catalog.find(x=>x.id===it.id) || {name_fr: it.name||it.id};
        const chip=document.createElement('div'); chip.className='chip'; chip.textContent=ex.name_fr;
        drop.appendChild(chip);
      });
    });
  }
  drawBoard();

  document.getElementById('copyAtoB')?.addEventListener('click', ()=>{ V5.copyAtoB(); drawBoard(); });
  document.getElementById('copyBtoA')?.addEventListener('click', ()=>{ V5.copyBtoA(); alert('B → A copié'); });
  document.getElementById('validateB')?.addEventListener('click', ()=>{ alert('Programme B prêt. Tu peux revenir sur le Plan (A) et copier si besoin.'); });
})();
