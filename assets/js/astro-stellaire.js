// astro-stellaire.js
// Dépendance: astronomy-engine (via esm.sh ou bundler)
import * as Astro from 'https://esm.sh/astronomy-engine';

const NAKED_EYE = new Set(['Mercury','Venus','Mars','Jupiter','Saturn']);

function toBody(name) {
  // Correspondance des constantes Astronomy Engine
  const map = {
    Mercury: Astro.Body.Mercury,
    Venus:   Astro.Body.Venus,
    Mars:    Astro.Body.Mars,
    Jupiter: Astro.Body.Jupiter,
    Saturn:  Astro.Body.Saturn
  };
  return map[name];
}

export async function getVisiblePlanets({lat, lon, date=new Date()}) {
  const observer = new Astro.Observer(lat, lon, 0);
  const now = date;

  // On définit la “nuit” simple: soleil < -6° (crépuscule civil)
  const sunHrz = Astro.Horizon(observer, now, Astro.Body.Sun, 'normal');
  const isNightish = (sunHrz.altitude < -6);

  const results = [];

  for (const name of NAKED_EYE) {
    const body = toBody(name);

    // Alt/Az + magnitude apparente
    const equ = Astro.Equator(body, now, observer, true, true);
    const hrz = Astro.Horizon(observer, now, equ.ra, equ.dec, 'normal');
    const mag = Astro.Illumination(body, now)?.mag ?? null;

    const above = hrz.altitude > 0;

    // Prochaine fenêtre de lever/coucher
    const nextRise = Astro.SearchRiseSet(body, observer, +1, now, 1);
    const nextSet  = Astro.SearchRiseSet(body, observer, -1, now, 1);

    results.push({
      name,
      altitude: +hrz.altitude.toFixed(1),
      azimuth: +hrz.azimuth.toFixed(1),
      magnitude: mag !== null ? +mag.toFixed(1) : null,
      visibleNow: isNightish && above,
      nextRise: nextRise?.date ?? null,
      nextSet: nextSet?.date ?? null
    });
  }

  // Classement: visibles d’abord, puis par magnitude (plus brillant en premier)
  results.sort((a,b)=>{
    if (a.visibleNow !== b.visibleNow) return a.visibleNow ? -1 : 1;
    return (a.magnitude ?? 99) - (b.magnitude ?? 99);
  });

  return results;
}

// Helper pour texte “intro-astro”
export function formatPlanetsNote(planets) {
  const nowVisible = planets.filter(p=>p.visibleNow);
  if (nowVisible.length) {
    const list = nowVisible.map(p=>`${p.name} (${p.magnitude ?? '—'})`).join(' • ');
    return `🔭 Visibles actuellement : ${list}.`;
  }
  // Sinon, prochaine fenêtre la plus proche
  const soonest = planets
    .map(p=>({name:p.name, at:p.nextRise || p.nextSet}))
    .filter(x=>!!x.at)
    .sort((a,b)=>a.at - b.at)[0];

  return soonest
    ? `🕑 Aucune planète visible maintenant. Prochaine : ${soonest.name} vers ${soonest.at.toLocaleTimeString('fr-FR', {hour:'2-digit',minute:'2-digit'})}.`
    : `🕑 Aucune fenêtre calculable aujourd'hui.`;
}
