// Habillage HUD sur 6 blocs existants (2 colonnes × 3).
// Images attendues dans: /dashb/modules/dashboard/assets/ui/

const R = (rel) => new URL(rel, import.meta.url).href;

// Choix du set (1,3,4) -> fichiers a/b (on/off)
const IMG = (set) => ({
  on:  R(`./dashboard/assets/ui/dashbblock_${set}a.png`),
  off: R(`./dashboard/assets/ui/dashbblock_${set}b.png`)
});

// Mapping: quel cadre pour chaque bloc + titre optionnel
const MAP = [
  { sel: '#bloc-g1', title: 'Surface',              set: 1, on: true  },
  { sel: '#bloc-g2', title: 'Données principales',  set: 3, on: true  },
  { sel: '#bloc-g3', title: 'État de terraformation', set: 4, on: true  },
  { sel: '#bloc-d1', title: 'Exploration',          set: 4, on: true  },
  { sel: '#bloc-d2', title: 'Lunes',                set: 3, on: true  },
  { sel: '#bloc-d3', title: '',                     set: 1, on: true  } // viewer 2, si besoin
];

function wrapContentAsScreen(host){
  // Crée un wrapper .hud-content et y déplace le contenu actuel
  const content = document.createElement('div');
  content.className = 'hud-content';
  while (host.firstChild) content.appendChild(host.firstChild);
  host.appendChild(content);
  return content;
}

function addLed(host){
  const led = document.createElement('span');
  led.className = 'hud-led'; led.setAttribute('aria-hidden', 'true');
  host.appendChild(led);
}

function addTitle(host, text){
  if (!text) return;
  const t = document.createElement('span');
  t.className = 'hud-title';
  t.textContent = text;
  host.appendChild(t);
}

export function applyHudToSixBlocks(customMap){
  (customMap || MAP).forEach(cfg => {
    const el = document.querySelector(cfg.sel);
    if (!el) return;

    el.classList.add('hud-panel');
    if (cfg.on) el.classList.add('is-on'); else el.classList.add('is-off');

    // images ON/OFF en variables CSS
    const { on, off } = IMG(cfg.set);
    el.style.setProperty('--img-on',  `url("${on}")`);
    el.style.setProperty('--img-off', `url("${off}")`);

    // zone écran interne (wrap du contenu existant)
    wrapContentAsScreen(el);

    // décor LED + petit titre flottant (optionnel)
    addLed(el);
    addTitle(el, cfg.title);

    // toggle ON/OFF au clic (si tu veux désactiver, retire l'event)
    el.addEventListener('click', (e) => {
      // évite de casser les liens/boutons internes: clique sur bord/LED/titre pour toggle
      if (e.target.closest('a,button,input,select,textarea')) return;
      const onState = el.classList.toggle('is-on');
      el.classList.toggle('is-off', !onState);
      el.setAttribute('aria-pressed', onState ? 'true' : 'false');
      window.dispatchEvent(new CustomEvent('hud:toggle', {
        detail: { id: cfg.sel.replace('#',''), on: onState }
      }));
    });
  });
}

// Auto-run si inclus directement comme <script type="module" src="...">
applyHudToSixBlocks();
