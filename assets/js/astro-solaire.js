// ========================================================
// astro-solaire.js – Données solaires avec SunCalc
// ========================================================

import SunCalc from 'https://esm.sh/suncalc';

/**
 * Retourne un texte d'infos solaires intelligentes
 * @param {Date} date
 * @param {number} lat
 * @param {number} lng
 * @returns {string}
 */
export function getSunInfo(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
  
  // Position actuelle du soleil
  const pos = SunCalc.getPosition(now, lat, lng);
  const altitudeDeg = (pos.altitude * 180 / Math.PI).toFixed(1);
  const azimuthDeg = (pos.azimuth * 180 / Math.PI).toFixed(1);

  // Horaires d'aujourd'hui et de demain
  const todayTimes = SunCalc.getTimes(today, lat, lng);
  const tomorrowTimes = SunCalc.getTimes(tomorrow, lat, lng);
  
  const options = { hour: '2-digit', minute: '2-digit' };
  
  // Logique intelligente pour le lever du soleil
  let riseStr = "—";
  let riseDate = "aujourd'hui";
  
  if (todayTimes.sunrise && now < todayTimes.sunrise) {
    // Le lever d'aujourd'hui n'est pas encore passé
    riseStr = todayTimes.sunrise.toLocaleTimeString('fr-FR', options);
    riseDate = "aujourd'hui";
  } else if (tomorrowTimes.sunrise) {
    // Le lever d'aujourd'hui est passé, on prend celui de demain
    riseStr = tomorrowTimes.sunrise.toLocaleTimeString('fr-FR', options);
    riseDate = "demain";
  }
  
  // Logique intelligente pour le coucher du soleil
  let setStr = "—";
  let setDate = "aujourd'hui";
  
  if (todayTimes.sunset && now < todayTimes.sunset) {
    // Le coucher d'aujourd'hui n'est pas encore passé
    setStr = todayTimes.sunset.toLocaleTimeString('fr-FR', options);
    setDate = "aujourd'hui";
  } else if (tomorrowTimes.sunset) {
    // Le coucher d'aujourd'hui est passé, on prend celui de demain
    setStr = tomorrowTimes.sunset.toLocaleTimeString('fr-FR', options);
    setDate = "demain";
  }

  // Construction du message avec indication du jour si nécessaire
  const riseText = riseDate === "demain" ? `${riseStr} (demain)` : riseStr;
  const setText = setDate === "demain" ? `${setStr} (demain)` : setStr;

  return `☀️ Le soleil est actuellement à ${altitudeDeg}° d'altitude et ${azimuthDeg}° d'azimut.
🌅 Lever : ${riseText} • 🌇 Coucher : ${setText}`;
}
