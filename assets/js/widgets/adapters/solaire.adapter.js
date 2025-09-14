// SOLAIRE — réutilise les données existantes si dispo (pas de duplication)

function nowLocal() { return new Date(); }

// essaie de lire tes anciens scripts (ex: intro-astro)
function readLegacySolar() {
  const src = (window.IntroAstro && window.IntroAstro.solar) || (window.__astro && window.__astro.solar);
  if (!src) return null;
  const { sunrise, solarNoon, sunset, altitude, azimut } = src;
  return {
    sunrise: sunrise || null,
    noon: solarNoon || null,
    sunset: sunset || null,
    altitude: typeof altitude === 'number' ? altitude : null,
    azimut: typeof azimut === 'number' ? azimut : null,
  };
}

// fallback raisonnable si pas de source legacy
function fallbackSolar() {
  const now = nowLocal();
  const sunrise = '06:30', noon = '13:45', sunset = '20:50';
  const alt = 15 + 35 * Math.sin((now.getHours()+now.getMinutes()/60)/24 * Math.PI);
  const azi = -60 + 120 * Math.cos((now.getHours()+now.getMinutes()/60)/24 * Math.PI);
  return { sunrise, noon, sunset, altitude: +alt.toFixed(1), azimut: +azi.toFixed(1) };
}

export async function getData() {
  const legacy = readLegacySolar();
  const base = legacy && legacy.sunrise && legacy.sunset ? legacy : fallbackSolar();
  return { ...base, now: nowLocal() };
}

export function renderData(d){
  return `
    <div class="aw-head">
      <div>Solaire · Aujourd’hui</div>
      <div>${d.now.toLocaleTimeString()}</div>
    </div>
    <div class="aw-title">Positions</div>
    <ul class="aw-list">
      <li class="aw-item">Lever : <strong>${d.sunrise || '—'}</strong></li>
      <li class="aw-item">Zénith : <strong>${d.noon || '—'}</strong></li>
      <li class="aw-item">Coucher : <strong>${d.sunset || '—'}</strong></li>
      <li class="aw-item">Altitude : <strong>${(d.altitude ?? 0).toFixed(1)}°</strong></li>
      <li class="aw-item">Azimut : <strong>${(d.azimut ?? 0).toFixed(1)}°</strong></li>
    </ul>
  `;
}

export function renderViz(d){
  // place le point entre lever/coucher (sinon 24h)
  const w=360,h=140,r=118,cx=w/2,cy=h+42;
  // fraction du jour entre lever/coucher (fallback si non parseable)
  const frac = (() => {
    const parse = t => {
      if(!t) return null;
      const [H,M] = String(t).split(':').map(n=>+n||0);
      const dt = new Date(d.now); dt.setHours(H,M,0,0);
      return dt.getTime();
    };
    const s=parse(d.sunrise), n=parse(d.noon), e=parse(d.sunset), x=d.now.getTime();
    if(s && e && x>=s && x<=e) return (x - s) / (e - s);
    // hors plage: approx 24h
    const day = d.now.getHours()/24 + d.now.getMinutes()/(24*60);
    return day;
  })();

  const angle = Math.PI - Math.PI * Math.min(Math.max(frac,0),1);
  const x = cx + r*Math.cos(angle), y = cy - r*Math.sin(angle);

  return `
<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Course du Soleil">
  <path class="aw-arc" d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}"></path>
  <circle class="aw-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"></circle>
</svg>`;
}
