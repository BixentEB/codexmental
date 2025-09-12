function dayFraction(){
  const d = new Date();
  return (d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds())/(24*3600);
}

export async function getData(){
  const now = new Date();
  return {
    sunrise: '06:30',
    noon: '13:45',
    sunset: '20:50',
    altitude: 37.7,
    azimut: -41.8,
    frac: dayFraction(),
    now
  };
}

export function renderData(d){
  return `
    <div class="aw-title">Solaire · Aujourd’hui</div>
    <ul class="aw-list">
      <li class="aw-item">Lever : <strong>${d.sunrise}</strong></li>
      <li class="aw-item">Zénith : <strong>${d.noon}</strong></li>
      <li class="aw-item">Coucher : <strong>${d.sunset}</strong></li>
      <li class="aw-item">Altitude : <strong>${d.altitude.toFixed(1)}°</strong></li>
      <li class="aw-item">Azimut : <strong>${d.azimut.toFixed(1)}°</strong></li>
      <li class="aw-item">Heure locale : <strong>${d.now.toLocaleTimeString()}</strong></li>
    </ul>
  `;
}

export function renderViz(d){
  const w=360,h=140,r=118,cx=w/2,cy=h+42;
  const angle = Math.PI - Math.PI * d.frac;
  const x = cx + r*Math.cos(angle), y = cy - r*Math.sin(angle);
  return `
<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Course du Soleil">
  <path class="aw-arc" d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}"></path>
  <circle class="aw-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"></circle>
</svg>`;
}
