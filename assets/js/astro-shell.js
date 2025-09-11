// /assets/js/astro-shell.js

// Registry d'adapters de thème (chargés plus bas)
const ADAPTERS = new Map();

/** helpers communs (optionnels pour les adapters) */
const helpers = {
  async geolocate(fallback = { name:'Paris, FR', latitude:48.8566, longitude:2.3522 }) {
    try {
      const pos = await new Promise((res, rej) => {
        if (!navigator.geolocation) return rej();
        navigator.geolocation.getCurrentPosition(res, rej, { timeout:8000, maximumAge:10*60*1000 });
      });
      return {
        name: 'Ma position',
        latitude: +pos.coords.latitude.toFixed(4),
        longitude: +pos.coords.longitude.toFixed(4),
      };
    } catch { return fallback; }
  }
};

function getEffectiveTheme() {
  const ds = document.body.dataset.effectiveTheme;
  if (ds && ds.startsWith('theme-')) return ds;
  const cls = [...document.body.classList].find(c => c.startsWith('theme-'));
  return cls || 'theme-sky';
}

function mountShell(themeKey, titles = { left:'', right:'' }) {
  const host = document.getElementById('astro-shell');
  if (!host) return null;

  host.className = `astro-shell ${themeKey.replace('theme-','')}`;
  host.innerHTML = `
    <div class="col data">
      ${titles.left ? `<h3>${titles.left}</h3>` : ''}
      <div class="slot" id="as-data"></div>
    </div>
    <div class="col viz">
      ${titles.right ? `<h3>${titles.right}</h3>` : ''}
      <div class="slot" id="as-viz"></div>
    </div>
  `;
  return {
    host,
    dataEl: host.querySelector('#as-data'),
    vizEl:  host.querySelector('#as-viz'),
  };
}

async function run() {
  const host = document.getElementById('astro-shell');
  if (!host) return;

  const theme = getEffectiveTheme();               // ex: "theme-sky"
  const adapter = ADAPTERS.get(theme);
  if (!adapter) { host.classList.remove('show'); host.innerHTML=''; return; }

  const ui = mountShell(theme, { left: adapter.titleLeft, right: adapter.titleRight });
  if (!ui) return;

  const ctx = { theme, root: ui.host, slots: { data: ui.dataEl, viz: ui.vizEl }, helpers };

  try {
    // Chaque adapter doit retourner true si au moins un des panes a été rempli.
    const okData = (await adapter.mountData?.(ui.dataEl, ctx)) === true;
    const okViz  = (await adapter.mountViz?.(ui.vizEl, ctx)) === true;

    if (okData || okViz) {
      host.classList.add('show');   // on affiche la coque
    } else {
      host.classList.remove('show'); // pas de données => laisse intro-astro vivre
      host.innerHTML = '';
    }
  } catch (e) {
    console.warn('[astro-shell] adapter error', adapter?.id, e);
    host.classList.remove('show');
    host.innerHTML = '';
  }
}

document.addEventListener('DOMContentLoaded', run);
new MutationObserver(run).observe(document.body, { attributes:true, attributeFilter:['data-effective-theme','class'] });

// ---- Import/registre des adapters fournis ----
import skyAdapter   from '/assets/js/widgets/sky.adapter.js';
import solarAdapter from '/assets/js/widgets/solaire.adapter.js';
// (tu en ajouteras d'autres librement : lunaire, stellaire, galactique, ...)

[skyAdapter, solarAdapter].forEach(a => a?.id && ADAPTERS.set(a.id, a));
