// ========================================================
// astro-stellaire.js — Codex Mental
// Planètes visibles (œil nu) + pluies de météores (optionnel)
// Dépendance: Astronomy Engine (ESM)
// ========================================================

import * as Astro from 'https://esm.sh/astronomy-engine@2';

// ———— Planètes visibles à l’œil nu
const NAKED_EYE = [
  { name: 'Mercure',  body: Astro.Body.Mercury },
  { name: 'Vénus',    body: Astro.Body.Venus   },
  { name: 'Mars',     body: Astro.Body.Mars    },
  { name: 'Jupiter',  body: Astro.Body.Jupiter },
  { name: 'Saturne',  body: Astro.Body.Saturn  },
];

// ———— Planètes nécessitant un instrument (pour teaser)
const SCOPE_ONLY = [
  { name: 'Uranus',   body: Astro.Body.Uranus  }, // limite œil nu
  { name: 'Neptune',  body: Astro.Body.Neptune }, // invisible à l’œil nu
  { name: 'Pluton',   body: Astro.Body.Pluto   }, // fun
];

function r1(x){ return Math.round(x*10)/10; }
function fmtTime(d){ return d ? d.toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'}) : '—'; }

// ————— Localisation (géoloc → fallback Paris)
async function getObserver(){
  const pos = await new Promise(res=>{
    if(!('geolocation' in navigator)) return res(null);
    navigator.geolocation.getCurrentPosition(
      p=>res({lat:p.coords.latitude, lon:p.coords.longitude}),
      ()=>res(null),
      { enableHighAccuracy:false, timeout:3500, maximumAge:60000 }
    );
  });
  const {lat,lon} = pos ?? {lat:48.8566, lon:2.3522};
  return new Astro.Observer(lat, lon, 0);
}

// ————— Nuit simple: Soleil sous -6°  (FIX RA/Dec → Horizon)
function isNightish(observer, date){
  const sunEq = Astro.Equator(Astro.Body.Sun, date, observer, true, true);
  const hrz   = Astro.Horizon(observer, date, sunEq.ra, sunEq.dec, 'normal');
  return hrz.altitude < -6;
}

// ————— Calcul des planètes (maintenant)
async function computePlanets(now = new Date()){
  const observer = await getObserver();
  const night = isNightish(observer, now);
  const out = [];

  for(const p of NAKED_EYE){
    const equ = Astro.Equator(p.body, now, observer, true, true);
    const hrz = Astro.Horizon(observer, now, equ.ra, equ.dec, 'normal');
    const ill = Astro.Illumination(p.body, now);
    const mag = ill?.mag ?? null;

    let nextRise=null, nextSet=null;
    try{ nextRise = Astro.SearchRiseSet(p.body, observer, +1, now, 1)?.date ?? null; }catch{}
    try{ nextSet  = Astro.SearchRiseSet(p.body, observer, -1, now, 1)?.date ?? null; }catch{}

    out.push({
      name:p.name,
      alt:r1(hrz.altitude),
      az:r1(hrz.azimuth),
      mag: mag!=null ? r1(mag) : null,
      visible: night && hrz.altitude>0,
      nextRise, nextSet
    });
  }

  // visibles d’abord puis magnitude croissante (plus brillant)
  out.sort((a,b)=>{
    if(a.visible!==b.visible) return a.visible?-1:1;
    return (a.mag??99)-(b.mag??99);
  });

  return out;
}

// ————— Prochaines planètes visibles (inclut SCOPE_ONLY pour teaser)
async function loadUpcomingPlanets(windowDays = 30, maxItems = 2){
  const observer = await getObserver();
  const now = new Date();
  const maxDate = new Date(now); maxDate.setDate(maxDate.getDate() + windowDays);

  const items = [];

  async function scanList(list, tagOpt=''){
    for (const p of list) {
      let nextRise = null, nextSet = null;
      try { nextRise = Astro.SearchRiseSet(p.body, observer, +1, now, windowDays)?.date ?? null; } catch {}
      try { nextSet  = Astro.SearchRiseSet(p.body, observer, -1, now, windowDays)?.date ?? null; } catch {}

      const candidates = [
        nextRise ? {at: nextRise, tag: 'lever'} : null,
        nextSet  ? {at: nextSet,  tag: 'coucher'} : null
      ].filter(Boolean).filter(ev => ev.at > now && ev.at <= maxDate);

      if (!candidates.length) continue;
      const soonest = candidates.sort((a,b)=>a.at - b.at)[0];

      let mag = null;
      try { const ill = Astro.Illumination(p.body, soonest.at); mag = ill?.mag ?? null; } catch {}

      items.push({
        name: p.name + tagOpt,
        at: soonest.at,
        tag: soonest.tag,
        mag
      });
    }
  }

  await scanList(NAKED_EYE, '');
  await scanList(SCOPE_ONLY, ' (télescope)');

  items.sort((a,b)=> a.at - b.at);
  return items.slice(0, maxItems).map(ev=>{
    const jour  = ev.at.toLocaleDateString('fr-FR', { day:'2-digit', month:'short' });
    const heure = ev.at.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
    const mag   = (ev.mag==null) ? '—' : Math.round(ev.mag*10)/10;
    return `${ev.name} — ${ev.tag} ${jour} ${heure}${mag!==null?` • mag ${mag}`:''}`;
  });
}

// ————— Util: parser de dates “souples” (ISO, " UT", espaces…)
function parseISOish(s){
  if(!s || typeof s !== 'string') return null;
  const t = s.trim()
    .replace(' UT','Z')
    .replace('UTC','Z')
    .replace(' ', 'T');
  const d = new Date(t);
  return isNaN(d) ? null : d;
}

// ————— Pluies de météores (format meteors-YYYY.json enrichi)
async function loadMeteorShowers(){
  try{
    const y = new Date().getFullYear();
    const res = await fetch(`/arc/meteors-${y}.json`, { cache:'no-store' });
    if(!res.ok) return [];

    const data = await res.json();
    const today = new Date();
    const t0 = new Date(today); t0.setHours(0,0,0,0);
    const t1 = new Date(today); t1.setHours(23,59,59,999);

    // garde celles actives aujourd'hui (via activity.start/end)
    const todays = (Array.isArray(data) ? data : []).filter(ev=>{
      const start = ev?.activity?.start ? new Date(ev.activity.start) : null;
      const end   = ev?.activity?.end   ? new Date(ev.activity.end)   : null;
      if(!start || !end) return false;
      return end >= t0 && start <= t1;
    });

    // map -> format court attendu par le widget
    return todays.map(ev=>{
      const name = ev.name_fr || ev.name_en || ev.iau_code || 'Pluie';
      const peak = parseISOish(ev?.maximum?.date);
      const peakStr = peak
        ? peak.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})
        : 'bientôt';
      const zhr = (ev.zhr === 0 || ev.zhr) ? ev.zhr : '—';
      return { name, peak: peakStr, zhr };
    });
  }catch{
    return [];
  }
}

// ————— Prochains pics dans X jours (teaser météores)
async function loadUpcomingShowers(windowDays = 30){
  try{
    const y = new Date().getFullYear();
    const res = await fetch(`/arc/meteors-${y}.json`, { cache:'no-store' });
    if(!res.ok) return [];
    const data = await res.json();

    const now = new Date();
    const maxDate = new Date(now); maxDate.setDate(maxDate.getDate() + windowDays);

    const upcoming = (Array.isArray(data)?data:[])
      .filter(ev => ev?.maximum?.date)
      .map(ev => ({ ev, peak: parseISOish(ev.maximum.date) }))
      .filter(x => x.peak && x.peak >= now && x.peak <= maxDate)
      // Optionnel: ne garder que ZHR ≥ 5 :
      // .filter(x => (typeof x.ev.zhr === 'number' ? x.ev.zhr >= 5 : true))
      .sort((a,b)=> a.peak - b.peak)
      .slice(0, 3)
      .map(x => {
        const {ev, peak} = x;
        const name = ev.name_fr || ev.name_en || ev.iau_code || 'Pluie';
        const jour  = peak.toLocaleDateString('fr-FR', { day:'2-digit', month:'short' });
        const heure = peak.toLocaleTimeString('fr-FR', { hour:'2-digit', minute:'2-digit' });
        const zhr = (ev.zhr === 0 || ev.zhr) ? ev.zhr : '—';
        return `${name} — pic ${jour} ${heure} • ZHR~${zhr}`;
      });

    return upcoming;
  }catch{
    return [];
  }
}

// ————— Helpers d’affichage courts
function compactPlanetsLine(planets){
  const visibles = planets.filter(p=>p.visible);
  if(visibles.length){
    const list = visibles
      .map(p=>`${p.name}${p.mag!=null?` (${p.mag})`:''}`)
      .join(', ');
    return `🔭 Visibles : ${list}`;
  }
  // sinon annonce la plus proche fenêtre
  const soon = planets
    .map(p=>({name:p.name, at:p.nextRise||p.nextSet, tag:p.nextRise?'lever':(p.nextSet?'coucher':null)}))
    .filter(x=>!!x.at)
    .sort((a,b)=>a.at-b.at)[0];
  return soon ? `🕑 Prochaine : ${soon.name} ${soon.tag} vers ${fmtTime(soon.at)}` : `🕑 Aucune fenêtre aujourd’hui`;
}

function compactMeteorsLine(showers){
  if(!showers.length) return '';
  const s = showers.map(x=>`${x.name} — pic ${x.peak} • ZHR~${x.zhr}`).join(' • ');
  return `\n☄️ ${s}`;
}

// ————— API publique
export async function getStellarInfo(){
  try{
    const planets = await computePlanets(new Date());
    const lineP = compactPlanetsLine(planets);

    // ☄️ aujourd'hui
    const meteors = await loadMeteorShowers();
    const lineM = compactMeteorsLine(meteors);

    let text = `${lineP}${lineM}`.trim();
    if (text && !text.includes('Aucune')) return text; // on a de la matière, go

    // 📅 Teaser du mois (planètes + showers) si rien aujourd’hui
    const [soonPlanets, upcomingShowers] = await Promise.all([
      loadUpcomingPlanets(30, 2),  // 1–2 planètes
      loadUpcomingShowers(30)      // 1–3 showers
    ]);

    const parts = [];
    if (soonPlanets.length) parts.push(soonPlanets.join(' • '));
    if (upcomingShowers.length) parts.push(upcomingShowers.join(' • '));

    if (parts.length){
      return `📅 À surveiller ce mois-ci : ${parts.join(' • ')}`;
    }
    return '🪐 Ciel calme pour l’instant — rien d’important à signaler.';
  }catch(err){
    console.error('astro-stellaire/getStellarInfo error:', err);
    return '🪐 Ciel calme pour l’instant — rien d’important à signaler.';
  }
}
