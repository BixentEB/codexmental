// ===== Données d'exercices =====
<div>
<button class="pick">Sélectionner</button>
</div>
</div>
<details class="inner">
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


// Accordéon catégorie : n'en garder qu'une ouverte
host.addEventListener('toggle', (e)=>{
const el = e.target;
if(!(el instanceof HTMLDetailsElement)) return;
// Ferme autres catégories
if(el.classList.contains('cat') && el.open){
host.querySelectorAll('details.cat').forEach(d=>{ if(d!==el) d.open=false; });
}
// Dans une catégorie, garde une seule fiche 'inner' ouverte
if(el.classList.contains('inner') && el.open){
const box = el.closest('.items');
if(box) box.querySelectorAll('details.inner').forEach(d=>{ if(d!==el) d.open=false; });
}
});
}


document.addEventListener('input', (e)=>{ if(e.target.id==='q') buildCatalogue(); });


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
