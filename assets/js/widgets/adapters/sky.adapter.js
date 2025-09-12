// SKY — liste d’infos + viz avec nuages plus grands et vitesse liée au vent

function conditionGuess(){
  const h = new Date().getHours();
  if([6,7,8,9,10].includes(h)) return 'clear';
  if([11,12,13,14].includes(h)) return 'cloudy';
  if([15,16,17].includes(h)) return 'rain';
  if([18,19].includes(h)) return 'storm';
  if([3,4,5,20,21,22].includes(h)) return 'cloudy';
  return Math.random() < .12 ? 'snow' : 'clear';
}

export async function getData(){
  const now = new Date();
  const cond = conditionGuess();
  return {
    location: 'Local',
    tempC: Math.round(12 + 10*Math.sin(now.getHours()/24*2*Math.PI)),
    windKmh: Math.round(6 + Math.random()*28),
    humidity: Math.round(45 + Math.random()*40),
    condition: cond
  };
}

export function renderData(d){
  const icon = {clear:'☀️', cloudy:'⛅', rain:'🌧️', snow:'❄️', storm:'⛈️'}[d.condition] || 'ℹ️';
  return `
    <div class="aw-title"><span class="tag">${icon}</span> Météo · ${d.location}</div>
    <ul class="aw-list">
      <li class="aw-item">Température : <strong>${d.tempC} °C</strong></li>
      <li class="aw-item">Vent : <strong>${d.windKmh} km/h</strong></li>
      <li class="aw-item">Humidité : <strong>${d.humidity}%</strong></li>
      <li class="aw-item">État : <strong>${label(d.condition)}</strong></li>
    </ul>
  `;
}

export function renderViz(d){
  // map vent → durée (plus de vent = plus rapide)
  // 0–60 km/h → 16s .. 7s
  const dur = Math.max(7, 16 - (d.windKmh/60)*9).toFixed(1);

  switch(d.condition){
    case 'clear':  return svgClear(dur);
    case 'cloudy': return svgCloudy(dur);
    case 'rain':   return svgRain(dur);
    case 'snow':   return svgSnow(dur);
    case 'storm':  return svgStorm(dur);
    default:       return svgCloudy(dur);
  }
}

function label(c){ return {clear:'Ciel clair', cloudy:'Nuageux', rain:'Pluie', snow:'Neige', storm:'Orage'}[c] || c; }

/* --- SVGs --- */
function svgClear(dur){
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Ciel clair" style="--windDur:${dur}s">
  <defs>
    <radialGradient id="sunHalo" cx="50%" cy="50%">
      <stop offset="0%" stop-color="var(--sky-halo)" stop-opacity=".5"/>
      <stop offset="100%" stop-color="var(--sky-halo)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle class="aw-sun-halo" cx="76" cy="62" r="34" fill="url(#sunHalo)"></circle>
  <circle class="aw-sun anim" cx="76" cy="62" r="15"></circle>

  <g class="aw-layer aw-bob">
    <!-- couche arrière (grise) qui balaie tout le panneau -->
    <g class="aw-cloud--dark" transform="translate(-120,0)">
      <ellipse class="aw-cloud--dark" cx="60" cy="88" rx="70" ry="18"></ellipse>
      <circle class="aw-cloud--dark" cx="30" cy="84" r="22"></circle>
      <circle class="aw-cloud--dark" cx="90" cy="84" r="22"></circle>
    </g>
  </g>

  <g class="aw-layer aw-front aw-bob">
    <!-- couche avant (blanche) plus compacte -->
    <g class="aw-cloud" transform="translate(-80,-6)">
      <ellipse class="aw-cloud" cx="60" cy="92" rx="62" ry="16"></ellipse>
      <circle class="aw-cloud" cx="30" cy="88" r="20"></circle>
      <circle class="aw-cloud" cx="90" cy="88" r="20"></circle>
    </g>
  </g>
</svg>`;
}

function svgCloudy(dur){
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Nuageux" style="--windDur:${dur}s">
  <g class="aw-layer aw-bob">
    <g class="aw-cloud--dark" transform="translate(-120,0)">
      <ellipse class="aw-cloud--dark" cx="120" cy="86" rx="84" ry="20"></ellipse>
      <circle class="aw-cloud--dark" cx="70"  cy="82" r="26"></circle>
      <circle class="aw-cloud--dark" cx="164" cy="82" r="26"></circle>
    </g>
  </g>
  <g class="aw-layer aw-front aw-bob">
    <g class="aw-cloud" transform="translate(-80,-4)">
      <ellipse class="aw-cloud" cx="120" cy="90" rx="74" ry="18"></ellipse>
      <circle class="aw-cloud" cx="78" cy="86" r="22"></circle>
      <circle class="aw-cloud" cx="156" cy="86" r="22"></circle>
    </g>
  </g>
</svg>`;
}

function svgRain(dur){
  const drops = Array.from({length:16}).map(()=>{
    const x = 24 + Math.random()*312;
    const delay = Math.round(Math.random()*900);
    const d = 800 + Math.round(Math.random()*700);
    return `<line class="anim" x1="${x}" y1="56" x2="${x}" y2="102" style="--delay:${delay}ms;--d:${d}ms"></line>`;
  }).join('');
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Pluie" style="--windDur:${dur}s">
  <g class="aw-layer aw-bob">
    <g class="aw-cloud--dark" transform="translate(-100,0)">
      <ellipse class="aw-cloud--dark" cx="120" cy="84" rx="88" ry="20"></ellipse>
      <circle class="aw-cloud--dark" cx="74" cy="80" r="26"></circle>
      <circle class="aw-cloud--dark" cx="164" cy="80" r="26"></circle>
    </g>
  </g>
  <g class="aw-rain">${drops}</g>
</svg>`;
}

function svgSnow(dur){
  const flakes = Array.from({length:14}).map(()=>{
    const x = 24 + Math.random()*312;
    const delay = Math.round(Math.random()*1400);
    const d = 1600 + Math.round(Math.random()*1200);
    const r = 1.7 + Math.random()*1.9;
    return `<circle class="anim" cx="${x}" cy="52" r="${r}" style="--delay:${delay}ms;--d:${d}ms"></circle>`;
  }).join('');
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Neige" style="--windDur:${dur}s">
  <g class="aw-layer aw-front aw-bob">
    <g class="aw-cloud" transform="translate(-80,-2)">
      <ellipse class="aw-cloud" cx="120" cy="86" rx="74" ry="18"></ellipse>
      <circle class="aw-cloud" cx="78" cy="82" r="22"></circle>
      <circle class="aw-cloud" cx="156" cy="82" r="22"></circle>
    </g>
  </g>
  <g class="aw-snow">${flakes}</g>
</svg>`;
}

function svgStorm(dur){
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Orage" style="--windDur:${dur}s">
  <g class="aw-layer aw-bob">
    <g class="aw-cloud--dark" transform="translate(-110,0)">
      <ellipse class="aw-cloud--dark" cx="120" cy="84" rx="92" ry="22"></ellipse>
      <circle class="aw-cloud--dark" cx="72" cy="80" r="28"></circle>
      <circle class="aw-cloud--dark" cx="168" cy="80" r="28"></circle>
    </g>
  </g>
  <g class="aw-rain">
    <line class="anim" x1="220" y1="60" x2="220" y2="104"></line>
    <line class="anim" x1="248" y1="60" x2="248" y2="104" style="--delay:220ms"></line>
    <line class="anim" x1="276" y1="60" x2="276" y2="104" style="--delay:440ms"></line>
  </g>
  <polygon class="aw-bolt anim" points="212,62 230,62 220,92 234,92 202,128 212,96 198,96"></polygon>
</svg>`;
}
