// Palette physique ; affichage multi-lignes ; nuages adoucis (moins cartoon)

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
    windKmh: Math.round(6 + Math.random()*18),
    humidity: Math.round(45 + Math.random()*40),
    condition: cond
  };
}

export function renderData(d){
  const icon = {clear:'☀️', cloudy:'⛅', rain:'🌧️', snow:'❄️', storm:'⛈️'}[d.condition] || 'ℹ️';
  return `
    <div class="aw-row">
      <div class="aw-title"><span style="opacity:.9">${icon}</span> Météo · ${d.location}</div>
      <div class="aw-kv">
        <span class="kv">Temp. <strong>${d.tempC} °C</strong></span>
        <span class="kv">Vent <strong>${d.windKmh} km/h</strong></span>
        <span class="kv">Humidité <strong>${d.humidity}%</strong></span>
        <span class="kv">État <strong>${label(d.condition)}</strong></span>
      </div>
    </div>
  `;
}

export function renderViz(d){
  switch(d.condition){
    case 'clear':  return svgClear();
    case 'cloudy': return svgCloudy();
    case 'rain':   return svgRain();
    case 'snow':   return svgSnow();
    case 'storm':  return svgStorm();
    default:       return svgCloudy();
  }
}

function label(c){
  return {clear:'Ciel clair', cloudy:'Nuageux', rain:'Pluie', snow:'Neige', storm:'Orage'}[c] || c;
}

/* --- SVGs (nuages adoucis ; couche arrière gris, avant blanche) --- */
function svgClear(){
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Ciel clair">
  <defs>
    <radialGradient id="sunHalo" cx="50%" cy="50%">
      <stop offset="0%" stop-color="var(--sky-halo)" stop-opacity=".5"/>
      <stop offset="100%" stop-color="var(--sky-halo)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle class="aw-sun-halo" cx="84" cy="64" r="36" fill="url(#sunHalo)"></circle>
  <circle class="aw-sun anim" cx="84" cy="64" r="16"></circle>

  <!-- arrière-plan gris, + léger flou -->
  <g class="aw-layer aw-layer--back" transform="translate(150,8)">
    <circle class="aw-cloud--dark aw-bob" cx="30" cy="70" r="18"></circle>
    <circle class="aw-cloud--dark aw-bob" cx="60" cy="66" r="22"></circle>
    <circle class="aw-cloud--dark aw-bob" cx="90" cy="70" r="18"></circle>
    <ellipse class="aw-cloud--dark" cx="60" cy="70" rx="50" ry="14"></ellipse>
  </g>

  <!-- couche avant blanche (passe au-dessus, moins “cartoon”) -->
  <g class="aw-layer aw-layer--front" transform="translate(190,0)">
    <circle class="aw-cloud aw-bob" cx="0" cy="70" r="16"></circle>
    <circle class="aw-cloud aw-bob" cx="26" cy="66" r="20"></circle>
    <circle class="aw-cloud aw-bob" cx="52" cy="70" r="16"></circle>
    <ellipse class="aw-cloud" cx="26" cy="70" rx="42" ry="12"></ellipse>
  </g>
</svg>`;
}

function svgCloudy(){
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Nuageux">
  <g class="aw-layer aw-layer--back" transform="translate(40,6)">
    <circle class="aw-cloud--dark aw-bob" cx="80" cy="64" r="22"></circle>
    <circle class="aw-cloud--dark aw-bob" cx="116" cy="60" r="24"></circle>
    <circle class="aw-cloud--dark aw-bob" cx="150" cy="66" r="20"></circle>
    <ellipse class="aw-cloud--dark" cx="112" cy="68" rx="70" ry="16"></ellipse>
  </g>
  <g class="aw-layer aw-layer--front" transform="translate(98,0)">
    <circle class="aw-cloud aw-bob" cx="60" cy="68" r="20"></circle>
    <circle class="aw-cloud aw-bob" cx="92" cy="64" r="22"></circle>
    <circle class="aw-cloud aw-bob" cx="124" cy="70" r="18"></circle>
    <ellipse class="aw-cloud" cx="92" cy="72" rx="62" ry="14"></ellipse>
  </g>
</svg>`;
}

function svgRain(){
  const drops = Array.from({length:16}).map(()=>{
    const x = 36 + Math.random()*288;
    const delay = Math.round(Math.random()*900);
    const d = 800 + Math.round(Math.random()*700);
    return `<line class="anim" x1="${x}" y1="52" x2="${x}" y2="92" style="--delay:${delay}ms;--d:${d}ms"></line>`;
  }).join('');
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Pluie">
  <g class="aw-layer aw-layer--back" transform="translate(44,6)">
    <circle class="aw-cloud--dark aw-bob" cx="96" cy="62" r="26"></circle>
    <circle class="aw-cloud--dark aw-bob" cx="136" cy="60" r="24"></circle>
    <ellipse class="aw-cloud--dark" cx="116" cy="68" rx="80" ry="16"></ellipse>
  </g>
  <g class="aw-rain">${drops}</g>
</svg>`;
}

function svgSnow(){
  const flakes = Array.from({length:14}).map(()=>{
    const x = 36 + Math.random()*288;
    const delay = Math.round(Math.random()*1400);
    const d = 1600 + Math.round(Math.random()*1200);
    const r = 1.7 + Math.random()*1.9;
    return `<circle class="anim" cx="${x}" cy="50" r="${r}" style="--delay:${delay}ms;--d:${d}ms"></circle>`;
  }).join('');
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Neige">
  <g class="aw-layer aw-layer--front" transform="translate(48,2)">
    <circle class="aw-cloud aw-bob" cx="92" cy="62" r="24"></circle>
    <circle class="aw-cloud aw-bob" cx="132" cy="60" r="22"></circle>
    <ellipse class="aw-cloud" cx="112" cy="70" rx="76" ry="16"></ellipse>
  </g>
  <g class="aw-snow">${flakes}</g>
</svg>`;
}

function svgStorm(){
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Orage">
  <g class="aw-layer aw-layer--back" transform="translate(36,6)">
    <circle class="aw-cloud--dark aw-bob" cx="104" cy="64" r="28"></circle>
    <circle class="aw-cloud--dark aw-bob" cx="152" cy="60" r="26"></circle>
    <ellipse class="aw-cloud--dark" cx="126" cy="70" rx="88" ry="18"></ellipse>
  </g>
  <g class="aw-rain">
    <line class="anim" x1="220" y1="54" x2="220" y2="94"></line>
    <line class="anim" x1="248" y1="54" x2="248" y2="94" style="--delay:220ms"></line>
    <line class="anim" x1="276" y1="54" x2="276" y2="94" style="--delay:440ms"></line>
  </g>
  <polygon class="aw-bolt anim" points="212,56 230,56 220,86 234,86 202,124 212,92 198,92"></polygon>
</svg>`;
}
