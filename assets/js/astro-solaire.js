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
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Position actuelle du soleil
  const pos = SunCalc.getPosition(now, lat, lng);
  const altitudeDeg = (pos.altitude * 180 / Math.PI).toFixed(1);
  const azimuthDeg = (pos.azimuth * 180 / Math.PI).toFixed(1);

  // Horaires d'aujourd'hui et de demain
  const todayTimes = SunCalc.getTimes(today, lat, lng);
  const tomorrowTimes = SunCalc.getTimes(tomorrow, lat, lng);
  
  const options = { hour: '2-digit', minute: '2-digit' };
  
  // Fonction pour formater la date comme "ven. 11 juillet"
  const formatDate = (date) => {
    const options = { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'long' 
    };
    return date.toLocaleDateString('fr-FR', options);
  };

  // Logique intelligente pour le lever du soleil
  let riseStr = "—";
  let riseDate = null;
  
  if (todayTimes.sunrise && now < todayTimes.sunrise) {
    // Le lever d'aujourd'hui n'est pas encore passé
    riseStr = todayTimes.sunrise.toLocaleTimeString('fr-FR', options);
    riseDate = today;
  } else if (tomorrowTimes.sunrise) {
    // Le lever d'aujourd'hui est passé, on prend celui de demain
    riseStr = tomorrowTimes.sunrise.toLocaleTimeString('fr-FR', options);
    riseDate = tomorrow;
  }
  
  // Logique intelligente pour le coucher du soleil
  let setStr = "—";
  let setDate = null;
  
  if (todayTimes.sunset && now < todayTimes.sunset) {
    // Le coucher d'aujourd'hui n'est pas encore passé
    setStr = todayTimes.sunset.toLocaleTimeString('fr-FR', options);
    setDate = today;
  } else if (tomorrowTimes.sunset) {
    // Le coucher d'aujourd'hui est passé, on prend celui de demain
    setStr = tomorrowTimes.sunset.toLocaleTimeString('fr-FR', options);
    setDate = tomorrow;
  }

  // Construction du message avec format de date complet
  const riseText = riseDate ? `${formatDate(riseDate)} – ${riseStr}` : riseStr;
  const setText = setDate ? `${formatDate(setDate)} – ${setStr}` : setStr;

  return `☀️ Le soleil est actuellement à ${altitudeDeg}° d'altitude et ${azimuthDeg}° d'azimut.
🌅 Prochain lever : ${riseText}
🌇 Prochain coucher : ${setText}`;
}
