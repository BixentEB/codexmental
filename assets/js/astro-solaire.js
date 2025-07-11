import SunCalc from 'https://esm.sh/suncalc';

/**
 * Retourne un texte d'infos solaires
 * @param {Date} date
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */
export function getFullSunInfo(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const now = new Date();
  const pos = SunCalc.getPosition(now, lat, lng);
  const times = SunCalc.getTimes(date, lat, lng);

  const altitudeDeg = (pos.altitude * 180 / Math.PI).toFixed(1);
  const azimuthDeg = (pos.azimuth * 180 / Math.PI).toFixed(1);

  if (!times.sunrise || !times.sunset) {
    return `☀️ Aucune donnée solaire disponible.`;
  }

  const optionsDate = {
    weekday: 'short',
    day: '2-digit',
    month: 'long'
  };
  const optionsTime = {
    hour: '2-digit',
    minute: '2-digit'
  };

  const riseStr = `${new Date(times.sunrise).toLocaleDateString('fr-FR', optionsDate)} – ${new Date(times.sunrise).toLocaleTimeString('fr-FR', optionsTime)}`;
  const setStr = `${new Date(times.sunset).toLocaleDateString('fr-FR', optionsDate)} – ${new Date(times.sunset).toLocaleTimeString('fr-FR', optionsTime)}`;

  const status = pos.altitude > 0
    ? `☀️ Le soleil est visible au-dessus de l’horizon.`
    : `☀️ Le soleil est sous l’horizon.`;

  return `${status}
🌅 Lever : ${riseStr}
🌇 Coucher : ${setStr}`;
}
