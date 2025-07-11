import SunCalc from 'https://esm.sh/suncalc';

/**
 * Retourne un texte d'infos solaires au format complet et lisible.
 * @param {Date} date
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */
export function getFullSunInfo(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const now = new Date();
  const pos = SunCalc.getPosition(now, lat, lng);

  const altitudeDeg = (pos.altitude * 180 / Math.PI).toFixed(1);
  const azimuthDeg = (pos.azimuth * 180 / Math.PI).toFixed(1);

  const optionsDate = {
    weekday: 'short',
    day: '2-digit',
    month: 'long'
  };
  const optionsTime = {
    hour: '2-digit',
    minute: '2-digit'
  };

  const timesToday = SunCalc.getTimes(date, lat, lng);
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const timesTomorrow = SunCalc.getTimes(tomorrow, lat, lng);

  const events = [];

  if (timesToday.sunrise) events.push({ type: 'Lever', time: new Date(timesToday.sunrise) });
  if (timesToday.sunset) events.push({ type: 'Coucher', time: new Date(timesToday.sunset) });
  if (timesTomorrow.sunrise) events.push({ type: 'Lever', time: new Date(timesTomorrow.sunrise) });
  if (timesTomorrow.sunset) events.push({ type: 'Coucher', time: new Date(timesTomorrow.sunset) });

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
    ? `☀️ Le soleil est visible au-dessus de l’horizon.`
    : `☀️ Le soleil est sous l’horizon.`;

  return `${status}
☀️ Altitude : ${altitudeDeg}°, Azimut : ${azimuthDeg}°
🌅 Prochain lever : ${riseStr}
🌇 Prochain coucher : ${setStr}`;
}
