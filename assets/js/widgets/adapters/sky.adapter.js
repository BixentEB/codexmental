// SKY — ville via géoloc, en-tête compacte, nuages + grands et vitesse réaliste

function conditionGuess(){
  const h = new Date().getHours();
  if([6,7,8,9,10].includes(h)) return 'clear';
  if([11,12,13,14].includes(h)) return 'cloudy';
  if([15,16,17].includes(h)) return 'rain';
  if([18,19].includes(h)) return 'storm';
  if([3,4,5,20,21,22].includes(h)) return 'cloudy';
  return Math.random() < .1 ? 'snow' : 'clear';
}

async function reverseGeocode(lat, lon){
  const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=fr`;
  try{
    const r = await fetch(url);
    if(!r.ok) throw new Error('geocode http');
    const j = await r.json();

    const rawCity = j.city || j.locality || j.principalSubdivision || '';
    const rawCountry = j.countryName || j.countryCode || '';

    // supprime les articles entre parenthèses : "France (la)" → "France"
    const country = String(rawCountry).replace(/\s*\([^)]*\)\s*$/, '').trim();
    const city = String(rawCity).trim();

    // si pas de ville, affiche juste le pays
    const label = [city, country].filter(Boolean).join(', ');
    return label || `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }catch{
    return `${lat.toFixed(3)}, ${lon.toFixed(3)}`;
  }
}


export async function getData(shell){
  const now = new Date();
  const cond = conditionGuess();

  let label = 'Local';
  try{
    if(navigator.geolocation){
      const pos = await new Promise((res,rej)=>navigator.geolocation.getCurrentPosition(res, rej, {timeout:8000}));
      const {latitude, longitude} = pos.coords;
      label = await reverseGeocode(latitude, longitude);
    }
  }catch{/* refus/erreur -> Local */}

  return {
    location: label,
    now,
    tempC: Math.round(12 + 10*Math.sin(now.getHours()/24*2*Math.PI)),
    windKmh: Math.round(3 + Math.random()*30),   // 3..33
    humidity: Math.round(45 + Math.random()*45),
    condition: cond
  };
}

export function renderData(d){
  const icon = {clear:'☀️', cloudy:'⛅', rain:'🌧️', snow:'❄️', storm:'⛈️'}[d.condition] || 'ℹ️';
  return `
    <div class="aw-head">
      <div class="aw-where">${d.location}</div>
      <div class="aw-when">${d.now.toLocaleString()}</div>
    </div>
    <div class="aw-title"><span class="tag">${icon}</span> Météo</div>
    <ul class="aw-list">
      <li class="aw-item">Température : <strong>${d.tempC} °C</strong></li>
      <li class="aw-item">Temps : <strong>${label(d.condition)}</strong></li>
      <li class="aw-item">Vent : <strong>${d.windKmh} km/h</strong></li>
      <li class="aw-item">Humidité : <strong>${d.humidity}%</strong></li>
    </ul>
  `;
}

export function renderViz(d){
  // 0–60 km/h -> 28s..9s ; <8 km/h -> quasi stationnaire
  const wind = Math.max(0, Math.min(60, d.windKmh));
  let dur = 28 - (wind/60)*(28-9); // s
  if (wind < 8) dur = 38;          // presque immobile, petit “bob” visible

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

/* --- SVG (nuages + gros, balayage pleine largeur) --- */
function svgClear(dur){
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Ciel clair" style="--windDur:${dur}s">
  <defs>
    <radialGradient id="sunHalo" cx="50%" cy="50%">
      <stop offset="0%" stop-color="var(--sky-halo)" stop-opacity=".5"/>
      <stop offset="100%" stop-color="var(--sky-halo)" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <circle class="aw-sun-halo" cx="72" cy="58" r="36" fill="url(#sunHalo)"></circle>
  <circle class="aw-sun anim" cx="72" cy="58" r="16"></circle>

  <g class="aw-layer aw-bob">
    <g transform="translate(-160,0)">
      <ellipse class="aw-cloud--dark" cx="120" cy="96" rx="96" ry="22"></ellipse>
      <circle class="aw-cloud--dark" cx="66" cy="92" r="28"></circle>
      <circle class="aw-cloud--dark" cx="174" cy="92" r="28"></circle>
    </g>
  </g>
  <g class="aw-layer aw-bob" style="animation-duration:calc(var(--windDur) * .85)">
    <g transform="translate(-120,-6)">
      <ellipse class="aw-cloud" cx="120" cy="100" rx="84" ry="20"></ellipse>
      <circle class="aw-cloud" cx="76" cy="96" r="26"></circle>
      <circle class="aw-cloud" cx="164" cy="96" r="26"></circle>
    </g>
  </g>
</svg>`;
}

function svgCloudy(dur){
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Nuageux" style="--windDur:${dur}s">
  <g class="aw-layer aw-bob">
    <g transform="translate(-160,0)">
      <ellipse class="aw-cloud--dark" cx="150" cy="96" rx="110" ry="24"></ellipse>
      <circle class="aw-cloud--dark" cx="84" cy="92" r="30"></circle>
      <circle class="aw-cloud--dark" cx="216" cy="92" r="30"></circle>
    </g>
  </g>
  <g class="aw-layer aw-bob" style="animation-duration:calc(var(--windDur) * .85)">
    <g transform="translate(-120,-4)">
      <ellipse class="aw-cloud" cx="150" cy="100" rx="98" ry="22"></ellipse>
      <circle class="aw-cloud" cx="102" cy="96" r="26"></circle>
      <circle class="aw-cloud" cx="198" cy="96" r="26"></circle>
    </g>
  </g>
</svg>`;
}

function svgRain(dur){
  const drops = Array.from({length:18}).map(()=>{
    const x = 18 + Math.random()*324;
    const delay = Math.round(Math.random()*900);
    const d = 850 + Math.round(Math.random()*750);
    return `<line class="anim" x1="${x}" y1="62" x2="${x}" y2="110" style="--delay:${delay}ms;--d:${d}ms"></line>`;
  }).join('');
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Pluie" style="--windDur:${dur}s">
  <g class="aw-layer aw-bob">
    <g transform="translate(-140,0)">
      <ellipse class="aw-cloud--dark" cx="150" cy="94" rx="114" ry="24"></ellipse>
      <circle class="aw-cloud--dark" cx="100" cy="90" r="30"></circle>
      <circle class="aw-cloud--dark" cx="200" cy="90" r="30"></circle>
    </g>
  </g>
  <g class="aw-rain">${drops}</g>
</svg>`;
}

function svgSnow(dur){
  const flakes = Array.from({length:16}).map(()=>{
    const x = 18 + Math.random()*324;
    const delay = Math.round(Math.random()*1400);
    const d = 1700 + Math.round(Math.random()*1300);
    const r = 1.7 + Math.random()*2.1;
    return `<circle class="anim" cx="${x}" cy="60" r="${r}" style="--delay:${delay}ms;--d:${d}ms"></circle>`;
  }).join('');
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Neige" style="--windDur:${dur}s">
  <g class="aw-layer aw-bob">
    <g transform="translate(-120,-2)">
      <ellipse class="aw-cloud" cx="150" cy="96" rx="106" ry="22"></ellipse>
      <circle class="aw-cloud" cx="104" cy="92" r="28"></circle>
      <circle class="aw-cloud" cx="196" cy="92" r="28"></circle>
    </g>
  </g>
  <g class="aw-snow">${flakes}</g>
</svg>`;
}

function svgStorm(dur){
  return `
<svg viewBox="0 0 360 140" role="img" aria-label="Orage" style="--windDur:${dur}s">
  <g class="aw-layer aw-bob">
    <g transform="translate(-150,0)">
      <ellipse class="aw-cloud--dark" cx="150" cy="94" rx="120" ry="26"></ellipse>
      <circle class="aw-cloud--dark" cx="96" cy="90" r="32"></circle>
      <circle class="aw-cloud--dark" cx="204" cy="90" r="32"></circle>
    </g>
  </g>
  <g class="aw-rain">
    <line class="anim" x1="230" y1="68" x2="230" y2="116"></line>
    <line class="anim" x1="258" y1="68" x2="258" y2="116" style="--delay:220ms"></line>
    <line class="anim" x1="286" y1="68" x2="286" y2="116" style="--delay:440ms"></line>
  </g>
  <polygon class="aw-bolt anim" points="228,70 246,70 236,100 250,100 216,136 226,104 212,104"></polygon>
</svg>`;
}
