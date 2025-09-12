// Arc affiné + point propre ; infos multi-lignes

function dayFraction(){
  const d = new Date();
  return (d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds())/(24*3600);
}

export async function getData(){
  const now = new Date();
  return {
    sunrise: '06:30', noon: '13:45', sunset: '20:50',
    frac: dayFraction(), now,
    // alt/az placeholder lisible (on mettra SunCalc ensuite)
    altitude: 37.7, azimut: -41.8
  };
}

export function renderData(d){
  return `
    <div class="aw-row">
      <div class="aw-title">Solaire · Aujourd’hui</div>
      <div class="aw-kv">
        <span class="kv">Lever <strong>${d.sunrise}</strong></span>
        <span class="kv">Zénith <strong>${d.noon}</strong></span>
        <span class="kv">Coucher <strong>${d.sunset}</strong></span>
        <span class="kv">Altitude <strong>${d.altitude.toFixed(1)}°</strong></span>
        <span class="kv">Azimut <strong>${d.azimut.toFixed(1)}°</strong></span>
      </div>
      <div class="aw-line">Heure locale : ${d.now.toLocaleTimeString()}</div>
    </div>
  `;
}

export function renderViz(d){
  const w=360,h=150,r=118,cx=w/2,cy=h+42;
  const angle = Math.PI - Math.PI * d.frac;
  const x = cx + r*Math.cos(angle), y = cy - r*Math.sin(angle);
  return `
<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Course du Soleil">
  <path class="aw-arc" d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}"></path>
  <circle class="aw-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"></circle>
</svg>`;
}
