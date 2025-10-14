/* ========= Training Load Engine ========= */
// dépend de EXOS (base d’exercices) + localStorage du journal

(function(){
  const KEY = 'journal_fullbody_v3'; // même schéma que ta page
  const $ = (q,root=document)=>root.querySelector(q);

  function loadJournal(){
    try{ return JSON.parse(localStorage.getItem(KEY)) || {items:[]} }
    catch{ return {items:[]} }
  }
  function saveJournal(data){
    localStorage.setItem(KEY, JSON.stringify(data));
  }

  // Volume “estimé” d’un exercice (base)
  function estVolume(ex){
    const b = ex.base || {};
    if(ex.mode==='reps'){
      const w = b.weight || 0;
      const r = b.reps || 10;
      const s = b.sets || 3;
      return w * r * s; // convention journale
    }else{ // time
      const t = b.time || 30;
      const s = b.sets || 3;
      // équivalence simple : 1s ≈ 1 rep @ poids 1 (ça marche bien pour composer une charge globale)
      return t * s;
    }
  }

  // Plans candidats par catégorie
  function poolFor(cat){
    if(cat==='Full'){
      // concat de toutes les cat pertinentes sauf étirements
      return [
        ...((EXOS['Échauffement']||[]).slice(0,2)),
        ...EXOS['Haut du corps']||[],
        ...EXOS['Bas du corps']||[],
        ...EXOS['Core/Abdos']||[]
      ];
    }
    if(cat==='Cardio doux'){
      return (EXOS['Échauffement']||[]).filter(e=>e.mode==='time');
    }
    return EXOS[cat]||[];
  }

  // Génération gloutonne : on ajoute des exos par volume moyen, puis on ajuste les séries
  function generatePlan(targetLoad, cat, globalRpe, tol=0.05){
    const src = poolFor(cat).map(e=>({ex:e, vol:estVolume(e)}))
                            .filter(x=>x.vol>0)
                            .sort((a,b)=>b.vol-a.vol); // du plus “productif” au moins

    const plan = [];
    let totalVol = 0;

    // 1) on empile tant qu’on n’a pas assez de volume pour approcher la charge
    let i=0;
    while(i<src.length && (totalVol*globalRpe/10) < targetLoad*(1-tol)){
      const {ex, vol} = src[i++];
      plan.push(structFromEx(ex, globalRpe));
      totalVol += estVolFromStruct(plan[plan.length-1]);
    }

    // 2) Ajustement fin en jouant sur les séries de 1 ou 2 exos
    function estVolFromStruct(s){
      return (s.mode==='reps') ? (s.weight*s.reps*s.sets) : (s.time*s.sets);
    }
    function structFromEx(ex, rpe){
      const b = ex.base||{};
      return {
        name: ex.name,
        cat: guessCatOf(ex.name),
        mode: ex.mode,
        weight: +b.weight||0,
        reps: +b.reps||0,
        time: +b.time||0,
        sets: +b.sets||3,
        rpe: +b.rpe||rpe
      };
    }
    function guessCatOf(name){
      for(const k of Object.keys(EXOS)){ if((EXOS[k]||[]).some(e=>e.name===name)) return k; }
      return cat==='Full' ? 'Full' : cat;
    }

    totalVol = plan.reduce((s,x)=>s+estVolFromStruct(x),0);
    let load = totalVol * (globalRpe/10);

    // ajuster sur le dernier élément
    const want = targetLoad;
    if(plan.length){
      const last = plan[plan.length-1];
      const factor = want / (load || 1);      // combien il faut multiplier la charge
      const setsAdj = Math.max(1, Math.round(last.sets * factor));
      const prevLoad = load;
      last.sets = Math.min(8, setsAdj);        // limite soft
      totalVol = plan.reduce((s,x)=>s+estVolFromStruct(x),0);
      load = totalVol * (globalRpe/10);

      // si encore trop loin, on retouche un 2e exo
      if(Math.abs(load - want) > want*tol && plan.length>1){
        const second = plan[plan.length-2];
        const factor2 = want / (load || 1);
        second.sets = Math.min(8, Math.max(1, Math.round(second.sets * factor2)));
        totalVol = plan.reduce((s,x)=>s+estVolFromStruct(x),0);
        load = totalVol * (globalRpe/10);
      }
    }

    return {plan, totalVol, load};
  }

  // Rendu
  function renderPlan(res, rpe){
    const tb = $('#tleTable tbody'); tb.innerHTML='';
    const fmt = n=>new Intl.NumberFormat('fr-FR').format(Math.round(n));
    res.plan.forEach(p=>{
      const tr=document.createElement('tr');
      tr.innerHTML = `<td>${p.name}</td><td>${p.cat}</td><td>${p.mode}</td>
        <td>${p.weight||0}</td><td>${p.reps||0}</td><td>${p.time||0}</td>
        <td>${p.sets||0}</td><td>${p.rpe||rpe}</td>
        <td>${fmt((p.mode==='reps')?p.weight*p.reps*p.sets:p.time*p.sets)}</td>`;
      tb.appendChild(tr);
    });
    $('#tleVol').textContent = fmt(res.totalVol);
    $('#tleLoad').textContent = fmt(res.load);
    $('#tleKcal').textContent = fmt(res.load/5.5);

    // meter
    const score = res.load;
    const max = Math.max(6500, score);
    const pos = Math.min(100, Math.max(0, (score/max)*100));
    $('#tleBar').style.setProperty('--pos', pos+'%');
    $('#tleBar').style.setProperty('position','relative');
    $('#tleBar').style.setProperty('--x', pos+'%');
    $('#tleBar').style.setProperty('clip-path', 'inset(0 0 0 0)');
    $('#tleBar').style.setProperty('box-shadow','inset 0 0 0 1px rgba(255,255,255,.05)');
    $('#tleBar').style.setProperty('--_x', pos+'%');
    $('#tleBar').style.setProperty('--_t','');

    // curseur (pseudo-élément via inline style)
    $('#tleBar').style.setProperty('--cursor-left', pos+'%');
    $('#tleBar').style.setProperty('backgroundPosition', '0 0');
    $('#tleBar').style.setProperty('backgroundSize', '100% 100%');
    $('#tleBar').style.setProperty('position','relative');
    $('#tleBar').innerHTML = `<div style="position:absolute;left:${pos}%;top:-6px;width:2px;height:24px;background:#fff;border-radius:2px;transform:translateX(-1px)"></div>`;

    // bouton save
    $('#tleSave').disabled = res.plan.length===0;
  }

  // Sauvegarde dans le journal
  function saveToJournal(res){
    const j = loadJournal();
    const todayStr = new Date().toISOString().slice(0,10);
    res.plan.forEach(p=>{
      const volume = (p.mode==='reps') ? (p.weight*p.reps*p.sets) : (p.time*p.sets);
      j.items.push({
        date: todayStr,
        cat: p.cat,
        name: p.name,
        mode: p.mode,
        weight: p.weight||0,
        reps: p.reps||0,
        time: p.time||0,
        sets: p.sets||0,
        rpe: p.rpe||7,
        feel: 'Moyen',
        volume
      });
    });
    saveJournal(j);
    alert('Séance enregistrée dans le journal ✅');
  }

  // Hook UI
  let lastPlan = null;
  $('#tleGen').addEventListener('click', ()=>{
    const target = +$('#tleScore').value||3000;
    const cat = $('#tleCat').value;
    const tol = +$('#tleTol').value;
    const rpe = +$('#tleRpe').value||7;
    const res = generatePlan(target, cat, rpe, tol);
    lastPlan = res;
    renderPlan(res, rpe);
  });
  $('#tleSave').addEventListener('click', ()=>{ if(lastPlan) saveToJournal(lastPlan); });

})();
