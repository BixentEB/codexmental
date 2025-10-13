<!-- =============================
FICHIERS DU PROJET — JOURNAL FULL BODY (version corrigée)
1) index.html
2) journal.css
3) journal.js

Copie/colle chaque section dans un fichier séparé
et mets-les dans le même dossier. Les noms peuvent être
changés si tu modifies aussi les liens dans l'HTML.
============================= -->

<!-- =============================
= 1) index.html
============================= -->
<!doctype html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Journal d'entraînement — Full Body</title>
  <link rel="stylesheet" href="journal.css" />
</head>
<body>
  <header>
    <div class="wrap">
      <div class="h1">Journal d'entraînement — Full Body</div>
      <div class="sub">Catalogue par catégories (repliables) à gauche • Journal à droite. Sélectionne un exercice, choisis <b>Rép/Séries</b> ou <b>Temps/Séries</b>, <b>Poids</b>, <b>RPE</b>, <b>Ressenti</b>, puis <b>Valider</b>. Sauvegarde locale + export/import JSON.</div>
    </div>
  </header>

  <div class="wrap">
    <main>
      <!-- LEFT: CATALOGUE -->
      <section class="panel catalogue">
        <div class="sectionHead"><h2>Exercices</h2><span class="badge"><span class="dot c1"></span>Catégories repliables</span></div>
        <div class="search"><input id="q" class="input" placeholder="Rechercher (nom, muscles, matériel)…"></div>
        <div class="catList" id="catList"></div>
      </section>

      <!-- RIGHT: JOURNAL -->
      <section class="panel">
        <div class="sectionHead"><h2>Journal</h2>
          <div class="toolbar">
            <button id="exp" class="btn ghost">Exporter JSON</button>
            <label class="btn ghost" for="impFile">Importer JSON</label>
            <input id="impFile" type="file" accept="application/json" style="display:none">
            <button id="clear" class="btn warn">Réinitialiser</button>
          </div>
        </div>

        <div class="card">
          <div class="formGrid">
            <div>
              <div class="lbl">Exercice sélectionné</div>
              <input id="fxName" class="inputBox" placeholder="Clique un exercice dans la liste de gauche" readonly>
            </div>
            <div>
              <div class="lbl">Mode</div>
              <select id="fxMode" class="select">
                <option value="reps">Répétitions</option>
                <option value="time">Chrono (secondes)</option>
              </select>
            </div>
            <div>
              <div class="lbl">Poids (kg)</div>
              <input id="fxWeight" class="inputBox" type="number" min="0" value="0">
            </div>
            <div>
              <div class="lbl">Répétitions</div>
              <input id="fxReps" class="inputBox" type="number" min="0" value="10">
            </div>
            <div>
              <div class="lbl">Temps (sec)</div>
              <input id="fxTime" class="inputBox" type="number" min="0" value="0">
            </div>
            <div>
              <div class="lbl">Séries</div>
              <input id="fxSets" class="inputBox" type="number" min="1" value="3">
            </div>
            <div>
              <div class="lbl">RPE (1–10)</div>
              <input id="fxRpe" class="inputBox" type="number" min="1" max="10" value="7">
            </div>
            <div>
              <div class="lbl">Ressenti</div>
              <select id="fxFeel" class="select">
                <option>Facile</option>
                <option selected>Moyen</option>
                <option>Difficile</option>
              </select>
            </div>
            <div style="align-self:end">
              <button id="add" class="btn ok">Valider → Ajouter au journal</button>
            </div>
          </div>
          <div class="help">Légende : Poids (kg) • Répétitions/Séries <i>ou</i> Temps(s)/Séries • RPE (effort perçu) • Ressenti (facile/moyen/difficile). Le champ inutile (Rép. vs Temps) peut rester à 0 selon le mode.</div>
        </div>

        <div class="card">
          <table class="table" id="logTable">
            <thead>
              <tr><th>Date</th><th>Catégorie</th><th>Exercice</th><th>Mode</th><th>Poids</th><th>Rép.</th><th>Temps</th><th>Séries</th><th>RPE</th><th>Ressenti</th><th>Volume</th><th></th></tr>
            </thead>
            <tbody></tbody>
            <tfoot>
              <tr><th colspan="10">Volume total</th><th id="volTot">0</th><th></th></tr>
            </tfoot>
          </table>
        </div>
      </section>
    </main>
  </div>

  <script src="journal.js" defer></script>
</body>
</html>


<!-- =============================
= 2) journal.css
============================= -->
:root{
  --bg:#0f1115; --text:#eaf0ff; --muted:#a7b1c8; --panel:#12182a; --card:#161e31; --line:#26324a; --accent:#7bd6ff; --ok:#6ee7a7; --warn:#ffd166;
  --c1:#3b82f6; --c2:#22c55e; --c3:#f59e0b; --c4:#ef4444; --c5:#a855f7;
}
*{box-sizing:border-box}
html,body{margin:0;height:100%;background:var(--bg);color:var(--text);font-family:Inter,system-ui,Segoe UI,Roboto,Arial,sans-serif}
.wrap{max-width:1400px;margin:0 auto;padding:20px}
header{position:sticky;top:0;z-index:10;background:#0f1115e6;backdrop-filter:blur(6px);border-bottom:1px solid #0b1220}
.h1{font-size:1.5rem;margin:0 0 6px}
.sub{color:var(--muted)}

main{display:grid;grid-template-columns:400px 1fr;gap:18px;margin-top:16px}
@media(max-width:1100px){main{grid-template-columns:1fr}}
.panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;overflow:hidden}
.sectionHead{display:flex;align-items:center;justify-content:space-between;padding:12px 14px;border-bottom:1px solid var(--line)}
.sectionHead h2{margin:0;font-size:1.05rem}

/* LEFT: catalogue */
.catalogue{display:grid;grid-template-rows:auto 1fr}
.search{padding:12px;border-bottom:1px solid var(--line)}
.input{width:100%;padding:9px 10px;border-radius:10px;border:1px solid var(--line);background:#0f1525;color:var(--text)}
.catList{overflow:auto;max-height:70vh;padding:8px}
.cat{border:1px solid var(--line);border-radius:12px;margin:8px 0;background:var(--card)}
.cat summary{list-style:none;cursor:pointer;padding:10px 12px;display:flex;align-items:center;gap:10px}
.cat summary::-webkit-details-marker{display:none}
.badge{display:inline-flex;align-items:center;gap:6px;padding:2px 8px;border-radius:999px;border:1px solid var(--line);background:#0f1628;color:#cfe1ff;font-size:.8rem}
.dot{width:10px;height:10px;border-radius:50%}
.dot.c1{background:var(--c1)} .dot.c2{background:var(--c2)} .dot.c3{background:var(--c3)} .dot.c4{background:var(--c4)} .dot.c5{background:var(--c5)}
.items{padding:6px 10px 12px}
.item{border-top:1px dashed #2a3a58;padding:10px 4px}
.item:first-child{border-top:none}
.itemHead{display:flex;align-items:center;justify-content:space-between;gap:8px}
.itemHead button{padding:6px 10px;border-radius:9px;border:1px solid var(--line);background:#12203a;color:var(--text);cursor:pointer}
.item h4{margin:0;font-size:1rem}
.item small{color:var(--muted)}
.item details{margin-top:8px}
.item details summary{cursor:pointer;color:#cfe1ff}

/* RIGHT: journal */
.card{background:var(--card);border:1px solid var(--line);border-radius:14px;margin:12px;padding:14px}
.formGrid{display:grid;grid-template-columns:1.3fr repeat(5, 140px) 1fr;gap:10px;align-items:end}
@media(max-width:1250px){.formGrid{grid-template-columns:1fr 1fr 1fr}}
.lbl{font-size:.85rem;color:var(--muted);margin-bottom:4px}
.select,.inputBox{width:100%;padding:8px 10px;border-radius:10px;border:1px solid var(--line);background:#0f1525;color:var(--text)}
.help{font-size:.82rem;color:#cdd9f6;font-style:italic;margin-top:6px}
.btn{padding:9px 12px;border-radius:10px;border:1px solid var(--line);background:#15243f;color:var(--text);cursor:pointer}
.btn.ok{background:#0f2a21;border-color:#1f5f47;color:#bdf7da}
.btn.warn{background:#2a1f0f;border-color:#6d5b2e;color:#ffebb5}
.btn.ghost{background:#0f1525}

.table{width:100%;border-collapse:collapse}
.table th,.table td{border-bottom:1px solid var(--line);padding:8px;text-align:left}
.table tfoot th{color:#cfe1ff}
.rowActions button{margin-right:6px}

.toolbar{display:flex;gap:8px;flex-wrap:wrap}


<!-- =============================
= 3) journal.js
============================= -->
// ===== Données d'exercices =====
const CATS = [
  {name:'Échauffement', color:'c1'},
  {name:'Haut du corps', color:'c2'},
  {name:'Bas du corps', color:'c3'},
  {name:'Core/Abdos', color:'c4'},
  {name:'Étirements', color:'c5'}
];
const EXOS = {
  'Échauffement': [
    {name:'Jumping jacks', gear:'PDC', muscles:'Cardio, épaules, hanches', desc:"Ouverture dynamique corps entier.", mode:'time', base:{time:45, sets:2}},
    {name:'Corde à sauter (ou simulée)', gear:'PDC', muscles:'Mollets, cardio', desc:"Sauts rythmés, pieds légers.", mode:'time', base:{time:60, sets:2}},
    {name:'Mobilité épaules (bâton/serviette)', gear:'Bâton/Serviette', muscles:'Épaules, poitrine', desc:"Amplitude sans douleur.", mode:'reps', base:{reps:12, sets:2}},
    {name:'Squats PDC (pré‑activation)', gear:'PDC', muscles:'Quadriceps, fessiers', desc:"Squat profond, talons au sol.", mode:'reps', base:{reps:12, sets:2}}
  ],
  'Haut du corps': [
    {name:'Développé couché — barre', gear:'Barre + banc', muscles:'Pecs, triceps, épaules', desc:'Pieds ancrés, trajectoire en J.', mode:'reps', base:{weight:10,reps:8,sets:3,rpe:7}},
    {name:'Développé haltères — banc', gear:'Haltères + banc', muscles:'Pecs, triceps', desc:'Poignets neutres, amplitude contrôlée.', mode:'reps', base:{weight:6,reps:10,sets:3,rpe:7}},
    {name:'Écartés haltères — banc', gear:'Haltères + banc', muscles:'Pectoraux (ouverture)', desc:'Coudes souples, grand étirement.', mode:'reps', base:{weight:4,reps:12,sets:3,rpe:7}},
    {name:'Rowing barre penché', gear:'Barre', muscles:'Dos, biceps, lombaires', desc:'Dos à 45°, tirage nombril.', mode:'reps', base:{weight:10,reps:10,sets:3,rpe:7}},
    {name:'Développé militaire — assis', gear:'Barre/Haltères + banc', muscles:'Épaules, triceps', desc:'Trajectoire verticale.', mode:'reps', base:{weight:6,reps:8,sets:3,rpe:7}},
    {name:'Curl biceps (haltères) / marteau', gear:'Haltères', muscles:'Biceps, brachial', desc:'Coudes fixes, montée contrôlée.', mode:'reps', base:{weight:6,reps:10,sets:3,rpe:7}},
    {name:'Triceps — barre front', gear:'Barre', muscles:'Triceps', desc:'Coudes serrés, descente au front.', mode:'reps', base:{weight:0,reps:12,sets:3,rpe:7}},
    {name:'Pompes au sol', gear:'PDC', muscles:'Pecs, triceps, core', desc:'Poitrine proche du sol.', mode:'reps', base:{reps:12,sets:3,rpe:6}}
  ],
  'Bas du corps': [
    {name:'Squat (barre ou PDC)', gear:'Barre / PDC', muscles:'Quadriceps, fessiers', desc:'Genoux suivent orteils, dos neutre.', mode:'reps', base:{weight:8,reps:10,sets:3,rpe:7}},
    {name:'Goblet squat — haltère', gear:'Haltère', muscles:'Quadriceps, fessiers', desc:'Haltère contre poitrine, buste droit.', mode:'reps', base:{weight:8,reps:10,sets:3,rpe:7}},
    {name:'Soulevé de terre jambes tendues', gear:'Barre', muscles:'Ischios, fessiers, lombaires', desc:"Hanches en arrière, étirement ischios.", mode:'reps', base:{weight:12,reps:8,sets:3,rpe:7}},
    {name:'Pont fessier au sol', gear:'PDC', muscles:'Fessiers', desc:'Rétroversion, contraction en haut.', mode:'reps', base:{reps:15,sets:3,rpe:7}},
    {name:'Chaise au mur (isométrique)', gear:'Mur', muscles:'Quadriceps', desc:'Cuisses // au sol, dos plaqué.', mode:'time', base:{time:40,sets:3,rpe:7}},
    {name:'Fentes avant — haltères', gear:'Haltères', muscles:'Quadriceps, fessiers', desc:'Grand pas, contrôle redescente.', mode:'reps', base:{weight:6,reps:10,sets:3,rpe:7}}
  ],
  'Core/Abdos': [
    {name:'Planche sur genoux', gear:'Tapis', muscles:'Transverse, grand droit', desc:'Gainage neutre, respiration basse.', mode:'time', base:{time:20,sets:3}},
    {name:'Gainage planche', gear:'Tapis', muscles:'Tronc', desc:'Progresser par paliers de 5s.', mode:'time', base:{time:20,sets:3}},
    {name:'Crunch contrôlé', gear:'Tapis', muscles:'Grand droit', desc:'Regard plafond, montée courte.', mode:'reps', base:{reps:15,sets:3}},
    {name:'Hollow hold (banane)', gear:'Tapis', muscles:'Transverse', desc:'Bas du dos plaqué.', mode:'time', base:{time:12,sets:3}}
  ],
  'Étirements': [
    {name:'Étirement pectoraux au mur', gear:'Mur', muscles:'Pectoraux', desc:'Bras à 90°, pivoter doucement.', mode:'time', base:{time:30,sets:1}},
    {name:'Étirement ischios — assis', gear:'Tapis', muscles:'Ischios', desc:'Dos droit, flexion hanche.', mode:'time', base:{time:30,sets:1}},
    {name:'Étirement quadriceps — debout', gear:'—', muscles:'Quadriceps', desc:'Attraper cheville, genou sous hanche.', mode:'time', base:{time:30,sets:1}},
    {name:'Étirement fléchisseurs de hanches', gear:'Tapis', muscles:'Psoas', desc:'Fente genou au sol, rétroversion.', mode:'time', base:{time:30,sets:1}}
  ]
};

// ===== Utilitaires =====
const $ = (q,root=document)=>root.querySelector(q);
const $$ = (q,root=document)=>[...root.querySelectorAll(q)];
const today = ()=> new Date().toISOString().slice(0,10);
const KEY = 'journal_fullbody_v1';

function save(data){localStorage.setItem(KEY, JSON.stringify(data));}
function load(){try{return JSON.parse(localStorage.getItem(KEY))||{items:[]}}catch{return {items:[]}}}
const journal = load();

// ===== Construire le catalogue (avec accordéon auto) =====
function buildCatalogue(){
  const host = $('#catList'); host.innerHTML='';
  const q = ($('#q').value||'').toLowerCase();

  CATS.forEach((c,i)=>{
    const det=document.createElement('details'); det.className='cat'; det.open = i===0; // première ouverte
    det.innerHTML = `<summary><span class="badge"><span class="dot ${c.color}"></span>${c.name}</span></summary>`;

    const items=document.createElement('div'); items.className='items';
    (EXOS[c.name]||[]).forEach(ex=>{
      if(q && ![ex.name, ex.muscles, ex.gear].join(' ').toLowerCase().includes(q)) return;
      const div=document.createElement('div'); div.className='item';
      div.innerHTML = `
        <div class="itemHead">
          <div>
            <h4>${ex.name}</h4>
            <small>${ex.gear} • Muscles : ${ex.muscles}</small>
          </div>
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
