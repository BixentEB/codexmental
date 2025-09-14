// LUNAIRE — réutilise legacy si dispo, sinon calcule ; orientation Nord

function readLegacyLunar(){
  const src = (window.IntroAstro && window.IntroAstro.lunar) || (window.__astro && window.__astro.lunar);
  if(!src) return null;
  const { fraction, phase } = src; // fraction (0..1 éclairée), phase (0..1 âge/phase)
  if(typeof fraction === 'number' && typeof phase === 'number') {
    return { illum: Math.round(fraction*100), f: phase };
  }
  return null;
}

const RAD = Math.PI/180;
function toDays2000(date){ return (date.getTime() - Date.UTC(2000,0,1,12)) / 86400000; }
function computeLunar(date){
  const d = toDays2000(date);
  const Ms = (357.5291 + 0.98560028 * d) * RAD;
  const L  = (218.316 + 13.176396 * d) * RAD;
  const Mm = (134.963 + 13.064993 * d) * RAD;
  const D  = (297.850 + 12.190749 * d) * RAD;
  const phi = Math.acos( Math.cos(D)*Math.cos(Mm) - Math.sin(D)*Math.sin(Mm)*Math.cos(Ms) );
  const k = (1 - Math.cos(phi)) / 2;                // fraction éclairée
  // signe pour croissante/décroissante
  const waxing = Math.sin(Mm + D) * Math.sin(Ms) - Math.cos(Mm + D) * Math.cos(Ms) < 0;
  const phase = waxing ? (0.5 - phi/(2*Math.PI)) : (0.5 + phi/(2*Math.PI));
  const f = ((phase % 1) + 1) % 1;
  return { illum: Math.round(k*100), f };
}

function phaseName(frac){
  if(frac < 0.02 || frac > 0.98) return 'Nouvelle Lune';
  if(frac < 0.24) return 'Premier croissant';
  if(frac < 0.26) return 'Premier quartier';
  if(frac < 0.49) return 'Gibbeuse croissante';
  if(frac < 0.51) return 'Pleine Lune';
  if(frac < 0.74) return 'Gibbeuse décroissante';
  if(frac < 0.76) return 'Dernier quartier';
  return 'Dernier croissant';
}

export async function getData(){
  const now = new Date();
  const legacy = readLegacyLunar();
  const base = legacy || computeLunar(now);
  return { now, ...base };
}

export function renderData(d){
  return `
    <div class="aw-head"><div>Phase lunaire</div><div>${d.now.toLocaleTimeString()}</div></div>
    <div class="aw-title">Lunaire · Phase</div>
    <ul class="aw-list">
      <li class="aw-item">Nom : <strong>${phaseName(d.f)}</strong></li>
      <li class="aw-item">Illumination : <strong>${d.illum}%</strong></li>
      <li class="aw-item">Note : <strong>orientation précise via SunCalc à venir</strong></li>
    </ul>`;
}

export function renderViz(d){
  const w=360,h=140,cx=110,cy=76,R=32;
  const k = d.illum/100;
  const offset = (1 - Math.abs(2*k - 1)) * R;
  const waxing = d.f < 0.5;
  const maskX = cx + (waxing ? -offset : +offset);
  return `
<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Phase lunaire">
  <defs>
    <mask id="moonMask"><rect width="${w}" height="${h}" fill="#000"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff"/><circle cx="${maskX}" cy="${cy}" r="${R}" fill="#000"/></mask>
  </defs>
  <circle class="aw-moon-disk" cx="${cx}" cy="${cy}" r="${R}" mask="url(#moonMask)"/>
</svg>`;
}
