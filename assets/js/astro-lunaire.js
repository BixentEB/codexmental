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

  // Cas toujours visible ou absente
  if (times.alwaysUp) {
    return `🌙 La lune est actuellement à ${illum}% (${label}) 🌕 Toujours visible.`;
  }
  if (times.alwaysDown) {
    return `🌙 La lune est actuellement à ${illum}% (${label}) 🌑 Pas de lever aujourd'hui.`;
  }

  // Cas déjà couchée
  if (set && now > set) {
    const tomorrow = new Date(date);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const t = SunCalc.getMoonTimes(tomorrow, lat, lng);
    const riseTomorrow = t.rise ? new Date(t.rise) : null;
    const setTomorrow = t.set ? new Date(t.set) : null;

    return `🌙 La lune est actuellement à ${illum}% (${label}) 🌑 Prochain lever : ${
      riseTomorrow ? riseTomorrow.toLocaleTimeString('fr-FR', options) : "—"
    } • Prochain coucher : ${
      setTomorrow ? setTomorrow.toLocaleTimeString('fr-FR', options) : "—"
    }`;
  }

  // Cas pas encore levée
  if (rise && now < rise) {
    return `🌙 La lune est actuellement à ${illum}% (${label}) 🌙 Lever à ${rise.toLocaleTimeString('fr-FR', options)} • Coucher à ${
      set ? set.toLocaleTimeString('fr-FR', options) : "—"
    }`;
  }

  // Cas levée maintenant
  if (rise && set && rise <= now && now < set) {
    return `🌙 La lune est actuellement à ${illum}% (${label}) 🌙 Levée depuis ${
      rise.toLocaleTimeString('fr-FR', options)
    } • Coucher à ${
      set ? set.toLocaleTimeString('fr-FR', options) : "—"
    }`;
  }

  // Fallback
  return `🌙 La lune est actuellement à ${illum}% (${label}).`;
}
