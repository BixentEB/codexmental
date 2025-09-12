// /assets/js/widgets/adapters/sky.adapter.js
function conditionGuess(){
  const h = new Date().getHours();
  if([6,7,8,9,10].includes(h)) return 'clear';
  if([11,12,13,14].includes(h)) return 'cloudy';
  if([15,16,17].includes(h)) return 'rain';
  if([18,19].includes(h)) return 'storm';
  if([3,4,5,20,21,22].includes(h)) return 'cloudy';
  return Math.random() < .15 ? 'snow' : 'clear';
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
    <div><span style="opacity:.8">${icon}</span> ${d.location} · <strong>${d.tempC} °C</strong> · Vent ${d.windKmh} km/h · Humidité ${d.humidity}%</div>
  `;
}

export function renderViz(d){
  if(d.condition==='clear')  return svgClear();
  if(d.condition==='cloudy') return svgCloudy();
  if(d.condition==='rain')   return svgRain();
  if(d.condition==='snow')   return svgSnow();
  if(d.condition==='storm')  return svgStorm();
  return svgCloudy();
}

/* --- SVGs --- */
function svgClear(){
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Ciel clair">
  <defs>
    <radialGradient id="sunHalo" cx="50%" cy="50%">
      <stop offset="0%" stop-color="var(--sky-halo)" stop-opacity=".5"/>
      <stop offset="100%" stop-color="var(--sky-halo)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle class="aw-sun-halo" cx="80" cy="65" r="34" fill="url(#sunHalo)"></circle>
  <circle class="aw-sun anim" cx="80" cy="65" r="15"></circle>
  <g transform="translate(190,32)">
    <ellipse class="aw-cloud" cx="0" cy="38" rx="46" ry="18"></ellipse>
    <ellipse class="aw-cloud" cx="-28" cy="32" rx="28" ry="12"></ellipse>
    <ellipse class="aw-cloud" cx="28" cy="32" rx="28" ry="12"></ellipse>
  </g>
</svg>`;
}
function svgCloudy(){
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Nuageux">
  <g class="anim" transform="translate(40,6)">
    <ellipse class="aw-cloud" cx="80" cy="60" rx="56" ry="20"></ellipse>
    <ellipse class="aw-cloud" cx="130" cy="54" rx="36" ry="16"></ellipse>
    <ellipse class="aw-cloud" cx="40" cy="54" rx="36" ry="16"></ellipse>
  </g>
  <g class="anim" style="animation-duration:10s" transform="translate(160,0)">
    <ellipse class="aw-cloud--dark" cx="80" cy="60" rx="56" ry="20"></ellipse>
    <ellipse class="aw-cloud--dark" cx="130" cy="54" rx="36" ry="16"></ellipse>
    <ellipse class="aw-cloud--dark" cx="40" cy="54" rx="36" ry="16"></ellipse>
  </g>
</svg>`;
}
function svgRain(){
  const drops = Array.from({length:14}).map(()=>{
    const x = 40 + Math.random()*280;
    const delay = Math.round(Math.random()*900);
    const d = 700 + Math.round(Math.random()*700);
    return `<line class="anim" x1="${x}" y1="44" x2="${x}" y2="78" style="--delay:${delay}ms;--d:${d}ms"></line>`;
  }).join('');
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Pluie">
  <g class="anim" transform="translate(50,4)">
    <ellipse class="aw-cloud--dark" cx="100" cy="56" rx="64" ry="22"></ellipse>
    <ellipse class="aw-cloud--dark" cx="150" cy="50" rx="40" ry="18"></ellipse>
    <ellipse class="aw-cloud--dark" cx="60" cy="50" rx="40" ry="18"></ellipse>
  </g>
  <g class="aw-rain">${drops}</g>
</svg>`;
}
function svgSnow(){
  const flakes = Array.from({length:12}).map(()=>{
    const x = 40 + Math.random()*280;
    const delay = Math.round(Math.random()*1400);
    const d = 1400 + Math.round(Math.random()*1200);
    const r = 1.8 + Math.random()*1.8;
    return `<circle class="anim" cx="${x}" cy="44" r="${r}" style="--delay:${delay}ms;--d:${d}ms"></circle>`;
  }).join('');
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Neige">
  <g class="anim" transform="translate(50,4)">
    <ellipse class="aw-cloud" cx="100" cy="56" rx="64" ry="22"></ellipse>
    <ellipse class="aw-cloud" cx="150" cy="50" rx="40" ry="18"></ellipse>
    <ellipse class="aw-cloud" cx="60" cy="50" rx="40" ry="18"></ellipse>
  </g>
  <g class="aw-snow">${flakes}</g>
</svg>`;
}
function svgStorm(){
  return `
<svg viewBox="0 0 360 150" role="img" aria-label="Orage">
  <g class="anim" transform="translate(40,6)">
    <ellipse class="aw-cloud--dark" cx="100" cy="60" rx="70" ry="24"></ellipse>
    <ellipse class="aw-cloud--dark" cx="150" cy="54" rx="46" ry="20"></ellipse>
    <ellipse class="aw-cloud--dark" cx="60" cy="54" rx="46" ry="20"></ellipse>
  </g>
  <g class="aw-rain">
    <line class="anim" x1="220" y1="46" x2="220" y2="82"></line>
    <line class="anim" x1="250" y1="46" x2="250" y2="82" style="--delay:220ms"></line>
    <line class="anim" x1="280" y1="46" x2="280" y2="82" style="--delay:440ms"></line>
  </g>
  <polygon class="aw-bolt anim" points="210,52 228,52 216,84 232,84 200,124 212,90 196,90"></polygon>
</svg>`;
}
