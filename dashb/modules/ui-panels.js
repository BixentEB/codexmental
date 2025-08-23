// /dashb/modules/ui-panels.js
// Génère 2 rangées × 3 panneaux HUD à partir d'images ON/OFF.
// Les images sont dans : /dashb/modules/dashboard/assets/ui/
// Exemple de fichiers attendus :
// - dashbblock_1a.png (ON) / dashbblock_1b.png (OFF)
// - dashbblock_3a.png (ON) / dashbblock_3b.png (OFF)
// - dashbblock_4a.png (ON) / dashbblock_4b.png (OFF)


const resolveAsset = (rel) => new URL(rel, import.meta.url).href;


// IMPORTANT : comme ce fichier est dans /dashb/modules/, on monte d'un cran vers
// /dashb/modules/dashboard/assets/ui/ via le chemin relatif "./dashboard/assets/ui/..."
const PANELS = [
// Rangée 1
{ id:'A1', title:'Panel A1', on:'./dashboard/assets/ui/dashbblock_1a.png', off:'./dashboard/assets/ui/dashbblock_1b.png', onByDefault:true },
{ id:'A2', title:'Panel A2', on:'./dashboard/assets/ui/dashbblock_3a.png', off:'./dashboard/assets/ui/dashbblock_3b.png', onByDefault:false },
{ id:'A3', title:'Panel A3', on:'./dashboard/assets/ui/dashbblock_4a.png', off:'./dashboard/assets/ui/dashbblock_4b.png', onByDefault:true },
// Rangée 2
{ id:'B1', title:'Panel B1', on:'./dashboard/assets/ui/dashbblock_3a.png', off:'./dashboard/assets/ui/dashbblock_3b.png', onByDefault:false },
{ id:'B2', title:'Panel B2', on:'./dashboard/assets/ui/dashbblock_4a.png', off:'./dashboard/assets/ui/dashbblock_4b.png', onByDefault:false },
{ id:'B3', title:'Panel B3', on:'./dashboard/assets/ui/dashbblock_1a.png', off:'./dashboard/assets/ui/dashbblock_1b.png', onByDefault:true }
];


function makePanel(cfg){
const el = document.createElement('button');
el.type = 'button';
el.className = `hud-panel ${cfg.onByDefault ? 'is-on' : 'is-off'}`;
el.dataset.panelId = cfg.id;
el.setAttribute('aria-pressed', cfg.onByDefault ? 'true' : 'false');
el.innerHTML = `\n <span class="hud-title">${cfg.title}</span>\n <span class="hud-led" aria-hidden="true"></span>\n `;


// Injecte les URLs ON/OFF en variables CSS sur le bouton
el.style.setProperty('--img-on', `url("${resolveAsset(cfg.on)}")`);
el.style.setProperty('--img-off', `url("${resolveAsset(cfg.off)}")`);


el.addEventListener('click', () => {
const on = el.classList.toggle('is-on');
el.classList.toggle('is-off', !on);
el.setAttribute('aria-pressed', on ? 'true' : 'false');


// Événement global pour brancher des actions (filtres, couches, etc.)
window.dispatchEvent(new CustomEvent('hud:toggle', { detail: { id: cfg.id, on } }));
});


return el;
}


export function mountHudRows(row1Host, row2Host){
if(row1Host){
row1Host.textContent = '';
PANELS.slice(0,3).forEach(cfg => row1Host.appendChild(makePanel(cfg)));
}
if(row2Host){
row2Host.textContent = '';
PANELS.slice(3,6).forEach(cfg => row2Host.appendChild(makePanel(cfg)));
}
}
