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
  // Utilisons directement la date actuelle pour les calculs
  const today = new Date(now);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  // Position actuelle du soleil
  const pos = SunCalc.getPosition(now, lat, lng);
  const altitudeDeg = (pos.altitude * 180 / Math.PI).toFixed(1);
  const azimuthDeg = (pos.azimuth * 180 / Math.PI).toFixed(1);

  // Horaires d'aujourd'hui et de demain
  const todayTimes = SunCalc.getTimes(now, lat, lng);
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

  // Logique intelligente : priorité au cycle jour/nuit
  let riseStr = "—";
  let riseDate = null;
  let setStr = "—";
  let setDate = null;
  
  // Debug : affichons l'heure actuelle et les heures de lever/coucher
  console.log("Heure actuelle:", now.toLocaleTimeString('fr-FR'));
  console.log("Coucher aujourd'hui:", todayTimes.sunset ? todayTimes.sunset.toLocaleTimeString('fr-FR') : "N/A");
  console.log("Lever demain:", tomorrowTimes.sunrise ? tomorrowTimes.sunrise.toLocaleTimeString('fr-FR') : "N/A");
  
    if (todayTimes.sunset && now < todayTimes.sunset) {
      // Le coucher d'aujourd'hui n'est pas encore passé
      // → Afficher le coucher d'aujourd'hui + le lever de demain
      console.log("Cas 1: Coucher d'aujourd'hui pas encore passé");
      setStr = todayTimes.sunset.toLocaleTimeString('fr-FR', options);
      setDate = today;
      
      if (tomorrowTimes.sunrise) {
        riseStr = tomorrowTimes.sunrise.toLocaleTimeString('fr-FR', options);
        riseDate = tomorrow;
      }
    } else {
      // Le coucher d'aujourd'hui est passé
      // → Afficher le lever de demain + le coucher de demain
      console.log("Cas 2: Coucher d'aujourd'hui déjà passé");
      if (tomorrowTimes.sunrise) {
        riseStr = tomorrowTimes.sunrise.toLocaleTimeString('fr-FR', options);
        riseDate = tomorrow;
      }
      
      if (tomorrowTimes.sunset) {
        setStr = tomorrowTimes.sunset.toLocaleTimeString('fr-FR', options);
        setDate = tomorrow;
      }
    }

  // Construction du message avec format de date complet
  const riseText = riseDate ? `${formatDate(riseDate)} – ${riseStr}` : riseStr;
  const setText = setDate ? `${formatDate(setDate)} – ${setStr}` : setStr;

  // Ordre logique selon le moment de la journée
  if (todayTimes.sunset && now < todayTimes.sunset) {
    // Avant le coucher : Coucher puis Lever
    return `☀️ Le soleil est actuellement à ${altitudeDeg}° d'altitude et ${azimuthDeg}° d'azimut.
🌇 Prochain coucher : ${setText}
🌅 Prochain lever : ${riseText}`;
  } else {
    // Après le coucher : Lever puis Coucher
    return `☀️ Le soleil est actuellement à ${altitudeDeg}° d'altitude et ${azimuthDeg}° d'azimut.
🌅 Prochain lever : ${riseText}
🌇 Prochain coucher : ${setText}`;
  }
}
