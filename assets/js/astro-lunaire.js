import SunCalc from 'https://esm.sh/suncalc';

/**
 * Retourne un texte complet d'infos lunaires
 * @param {Date} date
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */
export function getFullMoonInfo(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const now = new Date();
  const moon = SunCalc.getMoonIllumination(date);
  const pos = SunCalc.getMoonPosition(now, lat, lng);
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

  const options = { hour: '2-digit', minute: '2-digit' };

  const timesToday = SunCalc.getMoonTimes(date, lat, lng);
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const timesTomorrow = SunCalc.getMoonTimes(tomorrow, lat, lng);

  let riseTime = timesToday.rise ? new Date(timesToday.rise) : null;
  let setTime = timesToday.set ? new Date(timesToday.set) : null;

  let riseStr = "";
  let setStr = "";

  if (timesToday.alwaysUp) {
    riseStr = "Toujours visible";
    setStr = "—";
  } else if (timesToday.alwaysDown) {
    riseStr = "Pas de lever aujourd'hui";
    setStr = "—";
  } else {
    if (setTime && now > setTime) {
      riseTime = timesTomorrow.rise ? new Date(timesTomorrow.rise) : null;
      setTime = timesTomorrow.set ? new Date(timesTomorrow.set) : null;
      riseStr = riseTime
        ? `${riseTime.toLocaleTimeString('fr-FR', options)} (demain)`
        : "—";
      setStr = setTime
        ? `${setTime.toLocaleTimeString('fr-FR', options)} (demain)`
        : "—";
    } else {
      riseStr = riseTime
        ? `${riseTime.toLocaleTimeString('fr-FR', options)}`
        : "—";
      setStr = setTime
        ? `${setTime.toLocaleTimeString('fr-FR', options)}`
        : "—";
    }
  }

  const status = pos.altitude > 0
    ? `${emoji} La lune est visible actuellement au-dessus de l’horizon.`
    : `${emoji} La lune est actuellement sous l’horizon.`;

  return `🌙 La lune est actuellement à ${illum}% (${label})
${status}
${emoji} Prochain lever : ${riseStr} ${emoji} Prochain coucher : ${setStr}`;
}
