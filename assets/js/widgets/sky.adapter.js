// /assets/js/widgets/sky.adapter.js
export default {
  id: 'theme-sky',
  titleLeft: 'Météo locale',
  titleRight: 'Ciel',

  async mountData(el, ctx) {
    const loc = await ctx.helpers.geolocate();

    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude',  loc.latitude);
    url.searchParams.set('longitude', loc.longitude);
    url.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m');
    url.searchParams.set('daily',   'sunrise,sunset');
    url.searchParams.set('timezone','auto');

    const res = await fetch(url);
    if (!res.ok) return false;
    const data = await res.json();
    const cur = data.current, daily = data.daily;
    if (!cur) return false;

    const wcToText = code => ({
      0:'Ciel clair',1:'Principalement clair',2:'Partiellement nuageux',3:'Couvert',
      45:'Brouillard',48:'Brouillard givrant',51:'Bruine faible',53:'Bruine',55:'Bruine forte',
      61:'Pluie faible',63:'Pluie',65:'Pluie forte',66:'Pluie verglaçante faible',67:'Pluie verglaçante',
      71:'Neige faible',73:'Neige',75:'Neige forte',77:'Grains de neige',
      80:'Averses faibles',81:'Averses',82:'Averses fortes',85:'Averses de neige faibles',
      86:'Averses de neige fortes',95:'Orage',96:'Orage grêle',99:'Orage grêle fort'
    }[code] || '—');

    const html = `
      <div class="astro-kv">
        <div class="k">Lieu</div><div class="v">${loc.name}</div>
        <div class="k">Temp.</div><div class="v">${Math.round(cur.temperature_2m)}°</div>
        <div class="k">Ressenti</div><div class="v">${Math.round(cur.apparent_temperature)}°</div>
        <div class="k">Humidité</div><div class="v">${Math.round(cur.relative_humidity_2m)}%</div>
        <div class="k">Vent</div><div class="v">${Math.round(cur.wind_speed_10m)} km/h</div>
        <div class="k">Précip.</div><div class="v">${cur.precipitation ? `${cur.precipitation} mm` : '—'}</div>
        <div class="k">Ciel</div><div class="v">${wcToText(cur.weather_code)}</div>
      </div>
      <div style="opacity:.7;margin-top:.35rem;">
        MAJ ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
      </div>
    `;
    el.innerHTML = html;

    // garde pour la viz
    ctx._sky = { cur, daily };
    return true; // ← indique à la coque qu’on a des données
  },

  async mountViz(el, ctx) {
    const cur = ctx._sky?.cur, daily = ctx._sky?.daily;
    if (!cur || !daily) return false;

    const isNight = (() => {
      const t = +new Date(cur.time), sr = daily.sunrise?.[0] ? +new Date(daily.sunrise[0]) : 0, ss = daily.sunset?.[0] ? +new Date(daily.sunset[0]) : 0;
      return (sr && ss) ? (t < sr || t > ss) : false;
    })();

    const iconFor = (code, night=false) => {
      const sun = `<svg viewBox="0 0 120 120" style="width:120px;height:120px"><circle cx="60" cy="60" r="26" fill="currentColor"/><g stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".9"><line x1="60" y1="6" x2="60" y2="22"/><line x1="60" y1="98" x2="60" y2="114"/><line x1="6" y1="60" x2="22" y2="60"/><line x1="98" y1="60" x2="114" y2="60"/><line x1="24" y1="24" x2="34" y2="34"/><line x1="86" y1="86" x2="96" y2="96"/><line x1="86" y1="34" x2="96" y2="24"/><line x1="24" y1="96" x2="34" y2="86"/></g></svg>`;
      const moon = `<svg viewBox="0 0 120 120" style="width:120px;height:120px"><path d="M100 70c-9 18-31 25-49 16A38 38 0 0 1 36 30 39 39 0 0 0 60 108c20 0 37-13 40-38z" fill="currentColor"/></svg>`;
      const cloud = `<svg viewBox="0 0 160 120" style="width:160px;height:120px"><path d="M48 92c-20 0-36-14-36-32 0-16 12-29 28-31a40 40 0 0 1 78 8h4c16 0 28 12 28 26s-14 29-30 29H48z" fill="currentColor" opacity=".9"/></svg>`;
      const rain = `<svg viewBox="0 0 160 140" style="width:160px;height:120px"><path d="M48 80c-20 0-36-14-36-32 0-16 12-29 28-31a40 40 0 0 1 78 8h4c16 0 28 12 28 26s-14 29-30 29H48z" fill="currentColor" opacity=".9"/><g fill="currentColor" opacity=".95"><path d="M60 100 l-6 18"/><path d="M90 100 l-6 18"/><path d="M120 100 l-6 18"/></g></svg>`;
      const snow = `<svg viewBox="0 0 160 140" style="width:160px;height:120px"><path d="M48 80c-20 0-36-14-36-32 0-16 12-29 28-31a40 40 0 0 1 78 8h4c16 0 28 12 28 26s-14 29-30 29H48z" fill="currentColor" opacity=".9"/><g fill="currentColor" opacity=".95"><circle cx="72" cy="106" r="4"/><circle cx="96" cy="112" r="4"/><circle cx="120" cy="106" r="4"/></g></svg>`;
      const storm = `<svg viewBox="0 0 160 140" style="width:160px;height:120px"><path d="M48 80c-20 0-36-14-36-32 0-16 12-29 28-31a40 40 0 0 1 78 8h4c16 0 28 12 28 26s-14 29-30 29H48z" fill="currentColor" opacity=".9"/><path d="M92 96l-12 20h12l-6 20 18-26h-12l10-14z" fill="currentColor"/></svg>`;
      if (night && code===0) return moon;
      if ([0].includes(code)) return sun;
      if ([1,2,3,45,48].includes(code)) return cloud;
      if ([51,53,55,61,63,65,66,67,80,81,82].includes(code)) return rain;
      if ([71,73,75,77,85,86].includes(code)) return snow;
      if ([95,96,99].includes(code)) return storm;
      return cloud;
    };

    el.innerHTML = iconFor(cur.weather_code, isNight);
    return true;
  }
};
