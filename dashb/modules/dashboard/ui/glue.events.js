(function(){
  const rebroadcast = (norm) => {
    const names = [
      'object:selected','planet:selected','dashboard:select:planet',
      'simul:planet:click','radar:object:selected','system:body:clicked',
      'body:selected','celestial:selected'
    ];
    names.forEach(n=>{
      document.dispatchEvent(new CustomEvent(n,{detail:norm}));
      window.dispatchEvent(new CustomEvent(n,{detail:norm}));
    });
  };

  const normalize = (detail) => {
    const id = detail?.id || detail?.name || detail?.key || detail?.planet || detail?.body || null;
    const type = (detail?.type || (/moon/i.test(String(detail?.name||'')) ? 'moon' : 'planet')).toLowerCase();
    return { id: id ? String(id).toLowerCase() : null, type, raw: detail||null, ts: Date.now() };
  };

  // Interception douce de tout CustomEvent dispatché (si ça ressemble à une sélection -> on rebroadcast)
  const ORIG = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function(ev){
    try{
      if (ev && ev instanceof CustomEvent) {
        const tn = String(ev.type||'');
        const d  = ev.detail;
        const looks = /planet|body|object|celestial|selected|click|picked/i.test(tn) ||
                      (d && (d.id||d.name||d.key||d.planet||d.body));
        if (looks) {
          const norm = normalize(d);
          if (norm.id) {
            window.DASH?.setCloseVisible?.(true);
            rebroadcast(norm);
            window.__DASH__?.forceUpdateHUD?.();
          }
        }
      }
    }catch(e){}
    return ORIG.call(this, ev);
  };

  // Fallback : si certains modules émettent déjà ces noms
  ['object:selected','planet:selected','dashboard:select:planet',
   'simul:planet:click','radar:object:selected','system:body:clicked',
   'body:selected','celestial:selected'
  ].forEach(n=>{
    const on=()=>{ window.DASH?.setCloseVisible?.(true); window.__DASH__?.forceUpdateHUD?.(); };
    document.addEventListener(n,on,{passive:true});
    window.addEventListener(n,on,{passive:true});
  });
})();
