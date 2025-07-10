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

  let times = SunCalc.getMoonTimes(date, lat, lng);
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);

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
    let riseTime = times.rise ? new Date(times.rise) : null;
    let setTime = times.set ? new Date(times.set) : null;

    // Si les deux sont passés, aller chercher demain
    if (setTime && setTime < now && riseTime && riseTime < now) {
      const t = SunCalc.getMoonTimes(tomorrow, lat, lng);
      riseTime = t.rise ? new Date(t.rise) : null;
      setTime = t.set ? new Date(t.set) : null;

      riseStr = riseTime
        ? `${riseTime.toLocaleTimeString('fr-FR', options)} (à venir)`
        : "Pas de lever";
      setStr = setTime
        ? `${setTime.toLocaleTimeString('fr-FR', options)} (à venir)`
        : "Pas de coucher";
    } else {
      // Cas: lever est passé mais pas coucher = actuellement levée
      if (riseTime && setTime && riseTime <= now && setTime > now) {
        riseStr = `${riseTime.toLocaleTimeString('fr-FR', options)} (déjà levée)`;
        setStr = `${setTime.toLocaleTimeString('fr-FR', options)} (à venir)`;
      }
      // Cas: pas encore levée
      else if (riseTime && riseTime > now) {
        riseStr = `${riseTime.toLocaleTimeString('fr-FR', options)} (à venir)`;
        setStr = setTime
          ? `${setTime.toLocaleTimeString('fr-FR', options)}`
          : "—";
      }
      // Cas: déjà couchée
      else if (setTime && setTime < now) {
        const t = SunCalc.getMoonTimes(tomorrow, lat, lng);
        riseStr = t.rise
          ? `${new Date(t.rise).toLocaleTimeString('fr-FR', options)} (à venir)`
          : "Pas de lever";
        setStr = t.set
          ? `${new Date(t.set).toLocaleTimeString('fr-FR', options)} (à venir)`
          : "Pas de coucher";
      }
    }
  }

  return `🌙 La lune est actuellement à ${illum}% (${label}) ${emoji} Lever : ${riseStr} ${emoji} Coucher : ${setStr}`;
}
