import SunCalc from 'https://esm.sh/suncalc';

/**
 * Retourne un texte complet d'infos lunaires avec indication des heures futures
 * @param {Date} date
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */

export function getFullMoonInfo(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const now = new Date();
  const moon = SunCalc.getMoonIllumination(date);
  const illum = (moon.fraction * 100).toFixed(1);
  const phase = moon.phase;

  let label = "Nouvelle lune";
  let emoji = "🌑";

  if (phase < 0.03 || phase > 0.97) {
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

  const times = SunCalc.getMoonTimes(date, lat, lng);

  let timeInfo = "";

  if (times.alwaysUp) {
    timeInfo = "La lune est visible toute la journée.";
  } else if (times.alwaysDown) {
    timeInfo = "La lune reste sous l’horizon aujourd’hui.";
  } else {
    const riseTime = times.rise ? new Date(times.rise) : null;
    const setTime = times.set ? new Date(times.set) : null;

    const options = { hour: '2-digit', minute: '2-digit' };

    const riseStr = riseTime
      ? `${riseTime.toLocaleTimeString('fr-FR', options)} (${riseTime > now ? 'à venir' : 'déjà levée'})`
      : "Pas de lever";

    const setStr = setTime
      ? `${setTime.toLocaleTimeString('fr-FR', options)} (${setTime > now ? 'à venir' : 'déjà couchée'})`
      : "Pas de coucher";

    // Séparateurs dynamiques avec l'emoji lunaire
    timeInfo = `${emoji} Lever : ${riseStr} ${emoji} Coucher : ${setStr}`;
  }

  return `🌙 La lune est actuellement à ${illum}% (${label}) ${timeInfo}`;
}
