import SunCalc from 'https://esm.sh/suncalc';

/**
 * ========================================================
 * Codex Mental – astro-lunaire.js
 * ========================================================
 *
 * 🧭 CONTEXTE
 * Script qui génère les informations lunaires en temps réel.
 * 
 * ✨ FONCTIONNALITÉS
 * - Détermine la phase et l'illumination de la Lune.
 * - Affiche si elle est visible ou non.
 * - Calcule les prochains horaires de lever et coucher.
 * - Indique si la pleine lune est croissante ou décroissante.
 *
 * 🔧 CONTRAINTES
 * - Utiliser SunCalc avec le fuseau horaire local.
 * - Afficher des dates lisibles (ex: ven. 12 juillet – 23:08).
 *
 * 🛠 DERNIÈRE MISE À JOUR
 * - Ajout de la distinction Pleine lune croissante/décroissante.
 * - Tri des événements futurs pour plus de précision.
 */

export function getFullMoonInfo(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const now = new Date();
  const moon = SunCalc.getMoonIllumination(date);
  const pos = SunCalc.getMoonPosition(now, lat, lng);
  const illum = (moon.fraction * 100).toFixed(1);
  const phase = moon.phase;

  let label = "";
  let emoji = "";

  // 🌙 Phase avec distinction croissante/décroissante
  if (illum > 98) {
    if (phase < 0.48) {
      label = "Pleine lune, croissante";
    } else if (phase > 0.52) {
      label = "Pleine lune, décroissante";
    } else {
      label = "Pleine lune";
    }
    emoji = "🌕";
  } else if (phase < 0.03 || phase > 0.97) {
    label = "Nouvelle lune";
    emoji = "🌑";
  } else if (phase < 0.22) {
    label = "Premier croissant";
    emoji = "🌒";
  } else if (phase < 0.28) {
    label = "Premier quartier";
    emoji = "🌓";
  } else if (phase < 0.47) {
    label = "Gibbeuse croissante";
    emoji = "🌔";
  } else if (phase < 0.53) {
    label = "Pleine lune";
    emoji = "🌕";
  } else if (phase < 0.72) {
    label = "Gibbeuse décroissante";
    emoji = "🌖";
  } else if (phase < 0.78) {
    label = "Dernier quartier";
    emoji = "🌗";
  } else {
    label = "Dernier croissant";
    emoji = "🌘";
  }

  const optionsDate = {
    weekday: 'short',
    day: '2-digit',
    month: 'long'
  };
  const optionsTime = {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Paris'
  };

  const timesToday = SunCalc.getMoonTimes(date, lat, lng);
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const timesTomorrow = SunCalc.getMoonTimes(tomorrow, lat, lng);

  const events = [];

  if (timesToday.rise) events.push({ type: 'Lever', time: new Date(timesToday.rise) });
  if (timesToday.set) events.push({ type: 'Coucher', time: new Date(timesToday.set) });
  if (timesTomorrow.rise) events.push({ type: 'Lever', time: new Date(timesTomorrow.rise) });
  if (timesTomorrow.set) events.push({ type: 'Coucher', time: new Date(timesTomorrow.set) });

  const futureEvents = events.filter(e => e.time > now).sort((a, b) => a.time - b.time);

  const nextRise = futureEvents.find(e => e.type === 'Lever');
  const nextSet = futureEvents.find(e => e.type === 'Coucher');

  const riseStr = nextRise
    ? `${nextRise.time.toLocaleDateString('fr-FR', optionsDate)} – ${nextRise.time.toLocaleTimeString('fr-FR', optionsTime)}`
    : "—";

  const setStr = nextSet
    ? `${nextSet.time.toLocaleDateString('fr-FR', optionsDate)} – ${nextSet.time.toLocaleTimeString('fr-FR', optionsTime)}`
    : "—";

  const status = pos.altitude > 0
    ? `${emoji} La lune est visible au-dessus de l’horizon.`
    : `${emoji} La lune est sous l’horizon.`;

  return `🌙 La lune est actuellement à ${illum}% (${label})
${status}
${emoji} Prochain lever : ${riseStr}
${emoji} Prochain coucher : ${setStr}`;
}
