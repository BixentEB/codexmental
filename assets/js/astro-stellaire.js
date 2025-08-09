// ========================================================
// astro-stellaire.js – Planètes visibles + note stellaire
// Dépendance: Astronomy Engine (calculs alt/az, magnitude, rise/set)
// ========================================================

import * as Astro from 'https://esm.sh/astronomy-engine@2';

// —————————————— Utils
const NAKED_EYE = [
  { name: 'Mercure', body: Astro.Body.Mercury },
  { name: 'Vénus',   body: Astro.Body.Venus   },
  { name: 'Mars',    body: Astro.Body.Mars    },
  { name: 'Jupiter', body: Astro.Body.Jupiter },
  { name: 'Saturne', body: Astro.Body.Saturn  },
];

function round1(x) { return Math.round(x * 10) / 10; }

function formatTime(d) {
  return d ? d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : '—';
}

async function getObserver() {
  // 1) tente geoloc navigateur
  const fromGeo = await new Promise(resolve => {
    if (!('geolocation' in navigator)) return resolve(null);
    const opts = { enableHighAccuracy: false, timeout: 3500, maximumAge: 60_000 };
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      ()  => resolve(null),
      opts
    );
  });

  // 2) fallback (Paris) si pas dispo
  const { lat, lon } = fromGeo ?? { lat: 48.8566, lon: 2.3522 };
  return new Astro.Observer(lat, lon, 0);
}

function sunAltitudeDeg(observer, date) {
  const hrz = Astro.Horizon(observer, date, Astro.Body.Sun, 'normal');
  return hrz.altitude;
}

function isNightish(observer, date) {
  // nuit “simple” : soleil < -6°
  return sunAltitudeDeg(observer, date) < -6;
}

async function computeVisiblePlanets(date = new Date()) {
  const observer = await getObserver();

  const results = [];
  const night = isNightish(observer, date);

  for (const p of NAKED_EYE) {
    // Position apparente
    const equ = Astro.Equator(p.body, date, observer, true, true);
    const hrz = Astro.Horizon(observer, date, equ.ra, equ.dec, 'normal');

    // Magnitude & événements lever/coucher
    const ill = Astro.Illumination(p.body, date);
    const mag = ill?.mag ?? null;

    let nextRise = null;
    let nextSet  = null;
    try {
      nextRise = Astro.SearchRiseSet(p.body, observer, +1, date, 1)?.date ?? null;
    } catch {}
    try {
      nextSet  = Astro.SearchRiseSet(p.body, observer, -1, date, 1)?.date ?? null;
    } catch {}

    results.push({
      name: p.name,
      altitude: round1(hrz.altitude),
      azimuth:  round1(hrz.azimuth),
      magnitude: mag !== null ? Math.round(mag * 10) / 10 : null,
      visibleNow: night && hrz.altitude > 0,
      nextRise, nextSet
    });
  }

  // visibles d’abord, puis + brillant (mag plus petite)
  results.sort((a,b)=>{
    if (a.visibleNow !== b.visibleNow) return a.visibleNow ? -1 : 1;
    return (a.magnitude ?? 99) - (b.magnitude ?? 99);
  });

  return { observer, results, date };
}

function composePlanetLine(p) {
  const alt = `${p.altitude}°`;
  const mag = p.magnitude !== null ? `mag ${p.magnitude}` : 'mag —';
  if (p.visibleNow) {
    return `• ${p.name} – ${alt}, ${mag}`;
  }
  // sinon prochaine fenêtre la plus proche
  const when = p.nextRise || p.nextSet;
  const tag  = p.nextRise ? 'lever' : (p.nextSet ? 'coucher' : null);
  return when
    ? `• ${p.name} – ${mag}, prochain ${tag} vers ${formatTime(when)}`
    : `• ${p.name} – ${mag}, fenêtre indisponible`;
}

// (optionnel) charge un JSON local des pluies de météores si présent
async function loadMeteorShowers() {
  try {
    const year = new Date().getFullYear();
    const res = await fetch(`/arc/meteors-${year}.json`, { cache: 'no-store' });
    if (!res.ok) return [];
    const data = await res.json();
    const today = new Date();
    const y = today.getFullYear(), m = today.getMonth(), d = today.getDate();

    return data.filter(ev => {
      const start = new Date(ev.start);
      const end   = new Date(ev.end);
      const t0 = new Date(y, m, d, 0, 0, 0);
      const t1 = new Date(y, m, d, 23, 59, 59);
      return end >= t0 && start <= t1; // actif aujourd'hui
    });
  } catch {
    return [];
  }
}

// —————————————— API exportée
export async function getStellarInfo() {
  const { results } = await computeVisiblePlanets(new Date());

  const visibles = results.filter(p => p.visibleNow);
  const lines = (visibles.length ? visibles : results.slice(0, 3)).map(composePlanetLine);

  // Pluies de météores du jour (si fichier dispo)
  const showers = await loadMeteorShowers();
  const showersLine = showers.length
    ? '\n☄️ ' + showers.map(s => `${s.name} – pic ${s.peakLocal ?? s.peakUTC ?? 'bientôt'}`).join(' • ')
    : '';

  if (visibles.length) {
    return `🔭 Visibles maintenant :\n${lines.join('\n')}${showersLine}`;
  }
  return `🕑 Aucune planète visible à l’instant.\n${lines.join('\n')}${showersLine}`;
}
