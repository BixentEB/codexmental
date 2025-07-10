// ========================================================
// astro-solaire.js – Données solaires avec SunCalc
// ========================================================

import SunCalc from 'https://esm.sh/suncalc';

/**
 * Retourne un texte d'infos solaires
 * @param {Date} date
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */
export function getSunInfo(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const now = new Date();
  const pos = SunCalc.getPosition(date, lat, lng);
  const times = SunCalc.getTimes(date, lat, lng);

  const altitudeDeg = (pos.altitude * 180 / Math.PI).toFixed(1);
  const azimuthDeg = (pos.azimuth * 180 / Math.PI).toFixed(1);

  const options = { hour: '2-digit', minute: '2-digit' };

  const riseStr = times.sunrise
    ? `${new Date(times.sunrise).toLocaleTimeString('fr-FR', options)}`
    : "—";

  const setStr = times.sunset
    ? `${new Date(times.sunset).toLocaleTimeString('fr-FR', options)}`
    : "—";

  return `☀️ Le soleil est actuellement à ${altitudeDeg}° d'altitude et ${azimuthDeg}° d'azimut.
🌅 Lever : ${riseStr} • 🌇 Coucher : ${setStr}`;
}
