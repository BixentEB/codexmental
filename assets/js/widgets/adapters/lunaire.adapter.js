// Terminator circulaire (fini les ellipses) ; orientation fine à venir (SunCalc)

function lunarPhaseFraction(date){
  const epoch = Date.UTC(2000,0,6,18,14,0);
  const synodic = 29.530588853 * 86400000;
  const t = date.getTime() - epoch;
  const phase = (t % synodic + synodic) % synodic;
  return phase / synodic; // 0..1  (0 = Nouvelle, 0.5 = Pleine)
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
  const f = lunarPhaseFraction(now);
  const illumPct = Math.round((1 - Math.abs(1 - 2*f)) * 100);
  return { now, f, illumPct };
}

export function renderData(d){
  return `
    <div class="aw-row">
      <div class="aw-title">Lunaire · Phase</div>
      <div class="aw-kv">
        <span class="kv">Nom <strong>${phaseName(d.f)}</strong></span>
        <span class="kv">Illumination <strong>${d.illumPct}%</strong></span>
      </div>
      <div class="aw-line">Calcul rapide. Orientation précise SunCalc à venir.</div>
    </div>
  `;
}

export function renderViz(d){
  // Disque + masque par cercle décalé (terminateur circulaire)
  const w=360,h=150,cx=110,cy=78,R=30;
  const waxing = d.f <= .5;         // croissant si f<.5
  const k = 1 - Math.abs(1 - 2*d.f); // 0..1 fraction illuminée
  const dx = (1 - k*2) * R;         // décalage du “masque” (cercle) en X
  const maskX = cx + (waxing ? dx : -dx);

  return `
<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Phase lunaire">
  <defs>
    <mask id="m">
      <!-- fond noir (rien) -->
      <rect x="0" y="0" width="${w}" height="${h}" fill="black"/>
      <!-- disque de la lune (base visible) -->
      <circle cx="${cx}" cy="${cy}" r="${R}" fill="white"/>
      <!-- cercle sombre décalé : crée un terminator CIRCULAIRE -->
      <circle cx="${maskX}" cy="${cy}" r="${R}" fill="black"/>
    </mask>
  </defs>

  <circle class="aw-moon-disk" cx="${cx}" cy="${cy}" r="${R}" mask="url(#m)"></circle>

  <!-- Légende -->
  <text x="168" y="72" font-size="14" opacity=".9">Illum. ${d.illumPct}%</text>
  <text x="168" y="94" font-size="12" opacity=".7">${phaseName(d.f)}</text>
</svg>`;
}
