// /assets/js/widgets/adapters/lunaire.adapter.js
function lunarPhaseFraction(date){
  const epoch = Date.UTC(2000,0,6,18,14,0);
  const synodic = 29.530588853 * 86400000;
  const t = date.getTime() - epoch;
  const phase = (t % synodic + synodic) % synodic;
  return phase / synodic; // 0..1
}
function phaseName(frac){
  if(frac < 0.03 || frac > 0.97) return 'Nouvelle Lune';
  if(frac < 0.22) return 'Premier croissant';
  if(frac < 0.28) return 'Premier quartier';
  if(frac < 0.47) return 'Gibbeuse croissante';
  if(frac < 0.53) return 'Pleine Lune';
  if(frac < 0.72) return 'Gibbeuse décroissante';
  if(frac < 0.78) return 'Dernier quartier';
  return 'Dernier croissant';
}

export async function getData(){
  const now = new Date();
  const frac = lunarPhaseFraction(now);
  const illum = Math.round(frac<=.5 ? frac*2*100 : (1-frac)*2*100);
  return { now, phaseFrac: frac, illuminationPct: illum };
}

export function renderData(d){
  return `
    <div>Phase : <strong>${phaseName(d.phaseFrac)}</strong> · Illumination : <strong>${d.illuminationPct}%</strong></div>
    <div style="opacity:.8">Calcul rapide (orientation fine à venir)</div>
  `;
}

export function renderViz(d){
  const w=360,h=150,cx=100,cy=76,R=32, f=d.phaseFrac, waxing=f<=.5;
  const k = waxing ? (1 - f*2) : ((f-0.5)*2);
  const rx = Math.max(0.001, R * k);
  return `
<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Phase lunaire">
  <defs>
    <mask id="moonMask">
      <rect x="0" y="0" width="${w}" height="${h}" fill="black"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="white"/>
      <ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${R}" fill="black"/>
    </mask>
  </defs>
  <circle class="aw-moon-disk" cx="${cx}" cy="${cy}" r="${R}" mask="url(#moonMask)"></circle>
  <text x="170" y="70" font-size="14" opacity=".9">Illum. ${d.illuminationPct}%</text>
  <text x="170" y="92" font-size="12" opacity=".7">${phaseName(d.phaseFrac)}</text>
</svg>`;
}
