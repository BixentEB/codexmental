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

  const options = { hour: '2-digit', minute: '2-digit' };

  let times = SunCalc.getMoonTimes(date, lat, lng);

  // Si toujours visible ou absente
  if (times.alwaysUp) {
    return `🌙 La lune est actuellement à ${illum}% (${label}) 🌕 Toujours visible.`;
  }
  if (times.alwaysDown) {
    return `🌙 La lune est actuellement à ${illum}% (${label}) 🌑 Pas de lever aujourd'hui.`;
  }

  let rise = times.rise ? new Date(times.rise) : null;
  let set = times.set ? new Date(times.set) : null;

  let riseStr = "—";
  let setStr = "—";

  // Cas 1 : La lune est levée maintenant
  if (rise && set && rise <= now && now < set) {
    riseStr = `${rise.toLocaleTimeString('fr-FR', options)} (déjà levée)`;
    setStr = `${set.toLocaleTimeString('fr-FR', options)} (à venir)`;
  }
  // Cas 2 : La lune n'est pas encore levée
  else if (rise && now < rise) {
    riseStr = `${rise.toLocaleTimeString('fr-FR', options)} (à venir)`;
    setStr = set
      ? `${set.toLocaleTimeString('fr-FR', options)}`
      : "—";
  }
  // Cas 3 : La lune est déjà couchée
  else if (set && now >= set) {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const t = SunCalc.getMoonTimes(tomorrow, lat, lng);
    const riseTomorrow = t.rise ? new Date(t.rise) : null;
    const setTomorrow = t.set ? new Date(t.set) : null;

    riseStr = riseTomorrow
      ? `${riseTomorrow.toLocaleTimeString('fr-FR', options)} (demain)`
      : "Pas de lever";
    setStr = setTomorrow
      ? `${setTomorrow.toLocaleTimeString('fr-FR', options)} (demain)`
      : "Pas de coucher";
  }

  return `🌙 La lune est actuellement à ${illum}% (${label}) 🌕 Lever : ${riseStr} 🌕 Coucher : ${setStr}`;
}
