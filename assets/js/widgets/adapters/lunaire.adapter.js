// LUNAIRE — illumination précise (Meeus simplifié) + terminator circulaire orienté Nord

const RAD = Math.PI/180;
const DEG = 180/Math.PI;

function toDays2000(date){
  // J2000.0 (2000-01-01 12:00 UT)
  const t = date.getTime();
  const j2000 = Date.UTC(2000,0,1,12,0,0);
  return (t - j2000) / 86400000; // jours
}

function moonIllumination(date){
  // Formules simplifiées (Meeus-ish) pour l’angle de phase
  const d = toDays2000(date);

  // Soleil (anomalie moyenne)
  const Ms = (357.5291 + 0.98560028 * d) * RAD;

  // Lune : longitude moyenne, anomalie moyenne, élongation
  const L  = (218.316 + 13.176396 * d) * RAD;     // long. moyenne
  const Mm = (134.963 + 13.064993 * d) * RAD;     // anom. moyenne
  const D  = (297.850 + 12.190749 * d) * RAD;     // élongation

  // Angle de phase (Sun-Earth-Moon)
  const phi = Math.acos(
    Math.cos(D) * Math.cos(Mm)
    - Math.sin(D) * Math.sin(Mm) * Math.cos(Ms)
  );

  // Fraction éclairée (0..1)
  const k = (1 - Math.cos(phi)) / 2;

  // Phase fraction 0..1 (0 = Nouvelle, 0.5 = Pleine)
  const f = (1 + Math.sin(D) * Math.sin(Mm) - Math.cos(D) * Math.cos(Mm) * Math.cos(Ms) >= 0)
    ? 0.5 - (phi/ (2*Math.PI))
    : 0.5 + (phi/ (2*Math.PI));

  // Normalise 0..1
  const frac = ((f % 1) + 1) % 1;
  return { fraction: k, phase: frac }; // k pour %, frac pour croissante/décroissante
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
  const { fraction, phase } = moonIllumination(now);
  const illum = Math.round(fraction * 100);
  return { now, f: phase, illum };
}

export function renderData(d){
  return `
    <div class="aw-head">
      <div>Phase lunaire</div>
      <div>${d.now.toLocaleString()}</div>
    </div>
    <div class="aw-title">Lunaire · Phase</div>
    <ul class="aw-list">
      <li class="aw-item">Nom : <strong>${phaseName(d.f)}</strong></li>
      <li class="aw-item">Illumination : <strong>${d.illum}%</strong></li>
      <li class="aw-item">Note : <strong>orientation précise via SunCalc à venir</strong></li>
    </ul>
  `;
}

export function renderViz(d){
  const w=360,h=140,cx=110,cy=76,R=32;

  // fraction éclairée (0..1) et offset pour le terminator circulaire
  const k = d.illum/100;                     // fraction éclairée
  const offset = (1 - Math.abs(2*k - 1)) * R; // 0 (pleine) .. R (nouvelle)

  // Orientation Nord :
  const waxing = d.f < 0.5; // croissante -> éclairée à droite => masque à gauche
  const maskX = cx + (waxing ? -offset : +offset);

  return `
<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Phase lunaire">
  <defs>
    <mask id="moonMask">
      <rect x="0" y="0" width="${w}" height="${h}" fill="black"/>
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="white"/>
      <circle cx="${maskX}" cy="${cy}" r="${R}" fill="black"/>
    </mask>
  </defs>
  <circle class="aw-moon-disk" cx="${cx}" cy="${cy}" r="${R}" mask="url(#moonMask)"></circle>
</svg>`;
}
