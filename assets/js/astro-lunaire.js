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

  let times = SunCalc.getMoonTimes(date, lat, lng);
  let rise = times.rise ? new Date(times.rise) : null;
  let set = times.set ? new Date(times.set) : null;

  let riseStr = "";
  let setStr = "";
  let statusStr = "";

  // Cas toujours visible ou absente
  if (times.alwaysUp) {
    statusStr = `${emoji} La lune est visible en continu.`;
    riseStr = "—";
    setStr = "—";
  } else if (times.alwaysDown) {
    statusStr = `${emoji} La lune ne se lève pas aujourd'hui.`;
    riseStr = "—";
    setStr = "—";
  } else {
    // Vérifier si déjà couchée
    if (set && now > set) {
      const tomorrow = new Date(date);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const t = SunCalc.getMoonTimes(tomorrow, lat, lng);
      const riseTomorrow = t.rise ? new Date(t.rise) : null;
      const setTomorrow = t.set ? new Date(t.set) : null;

      statusStr = `${emoji} La lune est actuellement sous l’horizon.`;
      riseStr = riseTomorrow
        ? `${riseTomorrow.toLocaleTimeString('fr-FR', options)} (demain)`
        : "Pas de lever";
      setStr = setTomorrow
        ? `${setTomorrow.toLocaleTimeString('fr-FR', options)} (demain)`
        : "Pas de coucher";
    }
    // Pas encore levée
    else if (rise && now < rise) {
      statusStr = `${emoji} La lune n’est pas encore levée.`;
      riseStr = `${rise.toLocaleTimeString('fr-FR', options)} (à venir)`;
      setStr = set
        ? `${set.toLocaleTimeString('fr-FR', options)}`
        : "—";
    }
    // Actuellement levée
    else if (rise && set && rise <= now && now < set) {
      statusStr = `${emoji} La lune est visible actuellement au-dessus de l’horizon.`;
      riseStr = `${rise.toLocaleTimeString('fr-FR', options)} (déjà levée)`;
      setStr = `${set.toLocaleTimeString('fr-FR', options)} (à venir)`;
    }
  }

  return `🌙 La lune est actuellement à ${illum}% (${label})
${statusStr}
${emoji} Lever : ${riseStr} ${emoji} Coucher : ${setStr}`;
}
