// /assets/js/widgets/adapters/solaire.adapter.js
function dayFraction(){
  const d = new Date();
  return (d.getHours()*3600 + d.getMinutes()*60 + d.getSeconds())/(24*3600);
}

export async function getData(){
  const now = new Date();
  return {
    sunrise: '06:30', noon: '13:45', sunset: '20:50',
    frac: dayFraction(), now
  };
}

export function renderData(d){
  return `
    <div>Lever <strong>${d.sunrise}</strong> · Zénith <strong>${d.noon}</strong> · Coucher <strong>${d.sunset}</strong></div>
    <div style="opacity:.8">Heure locale : ${d.now.toLocaleTimeString()}</div>
  `;
}

export function renderViz(d){
  const w=360,h=150,r=120,cx=w/2,cy=h+40;
  const angle = Math.PI - Math.PI * d.frac;
  const x = cx + r*Math.cos(angle), y = cy - r*Math.sin(angle);
  return `
<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Course du Soleil">
  <path class="aw-arc" d="M ${cx-r} ${cy} A ${r} ${r} 0 0 1 ${cx+r} ${cy}"></path>
  <circle class="aw-dot" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="6"></circle>
</svg>`;
}
