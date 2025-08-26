(function(){
  const q = (s)=>document.querySelector(s);

  // Placeholders techniques (jamais visibles) + ensure #info-* attendus par tes modules
  const ensure = (host, sel, mk) => { let el = host?.querySelector(sel); if (!el && host) { el = mk(); host.appendChild(el); } return el; };
  const ensureSectionContent = (host)=>ensure(host, ':scope > .section-content', ()=>{ const d=document.createElement('div'); d.className='section-content'; return d; });

  const mountInfo = (blocSel, infoId, dataSection, opts) => {
    const host = q(blocSel); if (!host) return null;
    let info = host.querySelector('#'+infoId); if(!info){ info=document.createElement('div'); info.id=infoId; host.appendChild(info); }
    let select = info.querySelector('select[data-section]');
    if(!select){ select=document.createElement('select'); select.className='codex-select'; select.setAttribute('data-section', dataSection);
      select.innerHTML = opts.map(o=>`<option value="${o.value}" ${o.selected?'selected':''}>${o.label}</option>`).join('');
      const h3=document.createElement('h3'); h3.appendChild(select); info.appendChild(h3);
    }
    let target = info.querySelector('.section-content');
    if(!target){ target = ensureSectionContent(host); info.appendChild(target); }
    if(!target.textContent.trim()){ const ph=document.createElement('div'); ph.className='placeholder'; ph.textContent='— vide —'; target.appendChild(ph); }
    return {host, info, select, target};
  };

  mountInfo('#bloc-g2','info-data','informations',[
    {value:'basic',label:'Données principales',selected:true},
    {value:'composition',label:'Composition'},
    {value:'climat',label:'Climat'}
  ]);
  mountInfo('#bloc-g3','info-colony','colony',[
    {value:'summary',label:'Résumé',selected:true},
    {value:'explanation',label:'Explications'}
  ]);
  mountInfo('#bloc-d1','info-missions','missions',[
    {value:'summary',label:'Exploration',selected:true}
  ]);
  mountInfo('#bloc-d2','info-moons','moons',[
    {value:'summary',label:'Résumé',selected:true},
    {value:'details',label:'Détails'}
  ]);
  ensureSectionContent(q('#bloc-d3'));

  // Placeholders techniques sur les 6 blocs
  ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].forEach(sel=>{
    const p=q(sel); if(!p) return;
    if(!p.querySelector(':scope > .placeholder')){
      const ph=document.createElement('div'); ph.className='placeholder'; ph.textContent='— vide —'; p.appendChild(ph);
    }
  });

  const chips = {
    tutorial: q('.chip.tutorial'),
    g1:q('.chip.g1'), g2:q('.chip.g2'), g3:q('.chip.g3'),
    d1:q('.chip.d1'), d2:q('.chip.d2'), d3:q('.chip.d3'),
  };
  let hasUserSelection=false; chips.tutorial?.classList.add('on');

  const hasMeaning = (host)=>{
    if(!host) return false;
    const sc = host.querySelector(':scope > .section-content') || host;
    const t = (sc.textContent||'').trim();
    if(!t || /^—+$/.test(t) || t==='— vide —') return false;
    return true;
  };

  const cleanCloneHTML = (src) => {
    const node = src.cloneNode(true);
    node.querySelectorAll('.placeholder, .viewer-controls, #planet-main-viewer, #moon-viewer').forEach(n=>n.remove());
    return node.innerHTML.trim();
  };

  const mirrors = [
    {from:'#bloc-g1',to:'.chip.g1 .hud-text'},
    {from:'#bloc-g2',to:'.chip.g2 .hud-text'},
    {from:'#bloc-g3',to:'.chip.g3 .hud-text'},
    {from:'#bloc-d1',to:'.chip.d1 .hud-text'},
    {from:'#bloc-d2',to:'.chip.d2 .hud-text'},
    {from:'#bloc-d3',to:'.chip.d3 .hud-text'},
  ];
  const applyMirror=(srcSel,dstSel)=>{
    const src=q(srcSel),dst=q(dstSel); if(!src||!dst)return;
    const sc=src.querySelector(':scope > .section-content')||src;
    dst.innerHTML=cleanCloneHTML(sc);
    const chip=dst.closest('.chip');
    if (chip) chip.classList.toggle('on',hasUserSelection&&hasMeaning(src));
    if (chips.tutorial) chips.tutorial.classList.toggle('on',!hasUserSelection);
  };

  const panels = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3'].map(q).filter(Boolean);
  const onAnyChange=()=>{
    const any = panels.some(p=>hasMeaning(p));
    hasUserSelection = any;
    // affiche/masque la croix + tuto
    window.DASH?.setCloseVisible?.(any);
    if (chips.tutorial) chips.tutorial.classList.toggle('on', !any);
    mirrors.forEach(mi=>applyMirror(mi.from,mi.to));
  };
  const mo = new MutationObserver(onAnyChange);
  panels.forEach(p=>mo.observe(p,{childList:true,subtree:true,characterData:true}));
  onAnyChange();

  // expose pour reset
  window.__DASH__ = window.__DASH__ || {};
  window.__DASH__.forceUpdateHUD = onAnyChange;
})();

// glue.blocks.js – évite de polluer les titres décoratifs
(function(){
  const hasMeaning = (el)=>{
    if (!el) return false;
    const sc = el.querySelector('.section-content')||el;
    const txt=(sc.textContent||'').trim();
    return !!txt && txt!=='— vide —';
  };

  const panels = ['#bloc-g1','#bloc-g2','#bloc-g3','#bloc-d1','#bloc-d2','#bloc-d3']
    .map(s=>document.querySelector(s)).filter(Boolean);

  const obs = new MutationObserver(()=>{
    panels.forEach(p=>{
      p.classList.toggle('on', hasMeaning(p));
    });
  });
  panels.forEach(p=>obs.observe(p,{childList:true,subtree:true,characterData:true}));

  // pas de création de <h3> ou titres → on respecte index.html
})();

