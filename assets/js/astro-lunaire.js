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

  // Première estimation avec la date actuelle
  let times = SunCalc.getMoonTimes(date, lat, lng);

  // Si lever ou coucher sont passés, recalculer avec +1 jour
  const riseTime = times.rise ? new Date(times.rise) : null;
  const setTime = times.set ? new Date(times.set) : null;

  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Options pour affichage
  const options = { hour: '2-digit', minute: '2-digit' };

  let riseStr = "—";
  let setStr = "—";

  if (times.alwaysUp) {
    riseStr = "Toujours visible";
    setStr = "—";
  } else if (times.alwaysDown) {
    riseStr = "Pas de lever aujourd'hui";
    setStr = "—";
  } else {
    // Si le lever est passé, recalculer pour le prochain lever
    let riseToDisplay = riseTime;
    if (riseTime && riseTime < now) {
      const t = SunCalc.getMoonTimes(tomorrow, lat, lng);
      riseToDisplay = t.rise ? new Date(t.rise) : null;
    }
    // Si le coucher est passé, recalculer pour le prochain coucher
    let setToDisplay = setTime;
    if (setTime && setTime < now) {
      const t = SunCalc.getMoonTimes(tomorrow, lat, lng);
      setToDisplay = t.set ? new Date(t.set) : null;
    }

    riseStr = riseToDisplay
      ? `${riseToDisplay.toLocaleTimeString('fr-FR', options)} (${riseToDisplay > now ? 'à venir' : 'déjà levée'})`
      : "Pas de lever";

    setStr = setToDisplay
      ? `${setToDisplay.toLocaleTimeString('fr-FR', options)} (${setToDisplay > now ? 'à venir' : 'déjà couchée'})`
      : "Pas de coucher";
  }

  return `🌙 La lune est actuellement à ${illum}% (${label}) ${emoji} Lever : ${riseStr} ${emoji} Coucher : ${setStr}`;
}
