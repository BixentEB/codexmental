// init.js — bootstrap minimal : on charge les briques UI, point.
(function(){
  const base = '/dashb/modules/dashboard/ui/';
  const files = [
    'glue.texturepaths.js', // corrige les chemins textures SANS toucher tes modules
    'glue.blocks.js',       // ensure #info-* / miroirs / tuto piloté par contenu
    'glue.reset.js',        // bouton × global (intégré en haut-droite du cadre)
    'glue.shiplog.js',      // purge Missions -> mini-console intégrée bas-droite
    'glue.events.js',       // pont d’événements robuste (écoute+rebroadcast)
    'glue.viewers.js'       // couches viewer + hooks lune (sans refactor)
  ];
  const load = (i=0) => { if(i>=files.length) return;
    const s=document.createElement('script'); s.src=base+files[i]; s.onload=()=>load(i+1);
    document.head.appendChild(s);
  };
  load();
})();
