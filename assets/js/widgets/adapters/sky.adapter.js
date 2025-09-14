// SKY — ville + heure, soleil toujours présent, nuages propres et scénarios

async function reverseGeocode(lat, lon){
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;
  try{
    const r = await fetch(url); if(!r.ok) throw 0;
    const j = await r.json();
    const city = (j.city || j.locality || j.principalSubdivision || '').trim();
    const country = String(j.countryName || j.countryCode || '').replace(/\s*\([^)]*\)\s*$/,'').trim();
    return [city, country].filter(Boolean).join(', ') || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }catch{ return `${lat.toFixed(3)}, ${lon.toFixed(3)}`; }
}

function conditionGuess(){
  const h = new Date().getHours();
  if(h >= 6 && h <= 10) return 'clear';
  if(h >= 11 && h <= 16) return 'cloudy';
  if(h >= 17 && h <= 19) return 'rain';
  return 'cloudy';
}

export async function getData(){
  const now = new Date();
  let label = 'Local';
  try{
    if(navigator.geolocation){
      const pos = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res,rej,{timeout:8000}));
      label = await reverseGeocode(pos.coords.latitude, pos.coords.longitude);
    }
  }catch{}
  return {
    location: label,
    now,
    tempC: Math.round(12 + 10*Math.sin(now.getHours()/24*2*Math.PI)),
    windKmh: Math.round(3 + Math.random()*30),
    humidity: Math.round(45 + Math.random()*45),
    condition: conditionGuess()
  };
}

export function renderData(d){
  const icon = {clear:'☀️', cloudy:'⛅', rain:'🌧️'}[d.condition] || 'ℹ️';
  return `
    <div class="aw-head"><div>${d.location}</div><div>${d.now.toLocaleString()}</div></div>
    <div class="aw-title"><span class="tag">${icon}</span> Météo</div>
    <ul class="aw-list">
      <li class="aw-item">Température : <strong>${d.tempC} °C</strong></li>
      <li class="aw-item">Temps : <strong>${label(d.condition)}</strong></li>
      <li class="aw-item">Vent : <strong>${d.windKmh} km/h</strong></li>
      <li class="aw-item">Humidité : <strong>${d.humidity}%</strong></li>
    </ul>`;
}

export function renderViz(d){
  // mapping vitesse -> durée de balayage
  const v = Math.max(0, Math.min(60, d.windKmh));
  let dur = 26 - (v/60)*(26-10);
  if(v < 8) dur = 34;

  if(d.condition === 'clear') return svgSky({mode:'clear', dur});
  if(d.condition === 'cloudy') return svgSky({mode:'cloudy', dur});
  if(d.condition === 'rain') return svgSky({mode:'rain', dur});
  return svgSky({mode:'cloudy', dur});
}

function label(c){ return {clear:'Ciel clair', cloudy:'Nuageux', rain:'Pluie'}[c] || c; }

/* Nuage “propre” (une seule path) */
function cloudPath(cx, cy, s){
  const r1=12*s, r2=10*s, r3=14*s;
  const w = (r1+r2+r3)+6*s, h = 14*s;
  const x = cx - w/2, y = cy - h/2;
  return `
    M ${x+ r1} ${y}
    a ${r1} ${r1} 0 0 1 ${r1} ${r1}
    a ${r2} ${r2} 0 0 1 ${r2} ${r2}
    a ${r3} ${r3} 0 0 1 ${r3} ${r3}
    h ${- (r1+r2+r3)}
    a ${h/2} ${h/2} 0 0 1 0 ${-h}
    z`;
}

function svgSky({mode, dur}){
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Ciel ${mode}" style="--windDur:${dur}s">
  <defs>
    <radialGradient id="sunHalo" cx="0.22" cy="0.35">
      <stop offset="0%" stop-color="var(--sky-halo)" stop-opacity=".5"/>
      <stop offset="100%" stop-color="var(--sky-halo)" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="cloudClip">
      <rect x="0" y="0" width="360" height="140" rx="12" ry="12"/>
    </clipPath>
  </defs>

  <!-- soleil toujours présent -->
  <circle class="aw-sun-halo" cx="76" cy="52" r="40" fill="url(#sunHalo)"></circle>
  <circle class="aw-sun anim" cx="76" cy="52" r="16"></circle>

  <!-- nuages -->
  ${mode !== 'rain' ? cloudsLayers(mode) : rainLayer()}
</svg>`;
}

function cloudsLayers(mode){
  const front = (cx,cy,s,dx=0) =>
    `<path class="aw-cloud" d="${cloudPath(cx,cy,s)}" transform="translate(${dx},0)"></path>`;
  const back  = (cx,cy,s,dx=0) =>
    `<path class="aw-cloud--dark" d="${cloudPath(cx,cy,s)}" transform="translate(${dx},0)"></path>`;

  if(mode==='clear'){
    return `
    <g class="aw-layer aw-bob" clip-path="url(#cloudClip)">
      ${back(240, 88, 1.2, -160)}
    </g>
    <g class="aw-layer aw-bob" style="animation-duration:calc(var(--windDur)*.9)" clip-path="url(#cloudClip)">
      ${front(190, 96, 1.0, -120)}
    </g>`;
  }

  // cloudy : gris + blanc qui passent devant le soleil (occlusion naturelle)
  return `
  <g class="aw-layer aw-bob" clip-path="url(#cloudClip)">
    ${back(120, 90, 1.5, -160)}
    ${back(300, 84, 1.3, -320)}
  </g>
  <g class="aw-layer aw-bob" style="animation-duration:calc(var(--windDur)*.85)" clip-path="url(#cloudClip)">
    ${front(180, 96, 1.3, -200)}
    ${front(320, 100, 1.1, -360)}
  </g>`;
}

function rainLayer(){
  const drops = Array.from({length:20}).map(()=>{
    const x = 24 + Math.random()*312;
    const delay = Math.round(Math.random()*900);
    const d = 900 + Math.round(Math.random()*700);
    return `<line class="anim" x1="${x}" y1="66" x2="${x}" y2="116" style="--delay:${delay}ms;--d:${d}ms"></line>`;
  }).join('');
  return `
  <g class="aw-layer aw-bob" clip-path="url(#cloudClip)">
    <path class="aw-cloud--dark" d="${cloudPath(190,86,1.8)}" transform="translate(-150,0)"></path>
    <path class="aw-cloud--dark" d="${cloudPath(300,90,1.5)}" transform="translate(-300,0)"></path>
  </g>
  <g class="aw-rain">${drops}</g>`;
}
