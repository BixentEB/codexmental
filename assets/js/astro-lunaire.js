/**
 * ========================================================
 * Codex Mental – intro-astro.js
 * ========================================================
 *
 * 🧭 CONTEXTE
 * Script qui gère l'affichage dynamique des messages astronomiques.
 * 
 * ✨ FONCTIONNALITÉS
 * - Animation typewriter avec un seul intervalle actif.
 * - Affichage d'un message initial ("Connexion...") puis du message final.
 * - Détection du thème actif (lunaire, solaire, etc.).
 * - Délai variable selon la présence d'une vraie donnée.
 *
 * 🔧 CONTRAINTES
 * - Ne jamais avoir plusieurs typewriter() simultanés (évite les textes corrompus).
 * - Nettoyer les timers et intervalles au changement de thème.
 * - Pas de fond autour du bloc par défaut, juste un texte centré.
 * - Largeur max et line-height gérés par le CSS.
 *
 * 🛠 DERNIÈRE MISE À JOUR
 * - Ajout de clearInterval() pour éviter les chevauchements.
 * - Ajout de toLocaleString() si besoin pour afficher la date complète.
 * - Gestion propre du curseur clignotant.
 *
 * 🚀 REMARQUES
 * - Si des anomalies apparaissent en changeant rapidement de thème,
 *   vérifier que clearTimeout() et clearInterval() sont bien appelés.
 * - Voir aussi astro-lunaire.js pour la génération des messages.
 */


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

  const optionsDate = {
    weekday: 'short',
    day: '2-digit',
    month: 'long'
  };
  const optionsTime = {
    hour: '2-digit',
    minute: '2-digit'
  };

  const timesToday = SunCalc.getMoonTimes(date, lat, lng);
  const tomorrow = new Date(date);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const timesTomorrow = SunCalc.getMoonTimes(tomorrow, lat, lng);

  const events = [];

  if (timesToday.rise) events.push({ type: 'Lever', time: new Date(timesToday.rise) });
  if (timesToday.set) events.push({ type: 'Coucher', time: new Date(timesToday.set) });
  if (timesTomorrow.rise) events.push({ type: 'Lever', time: new Date(timesTomorrow.rise) });
  if (timesTomorrow.set) events.push({ type: 'Coucher', time: new Date(timesTomorrow.set) });

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
    ? `${emoji} La lune est visible au-dessus de l’horizon.`
    : `${emoji} La lune est sous l’horizon.`; // retiré le "actuellement"

  return `🌙 La lune est actuellement à ${illum}% (${label})
${status}
${emoji} Prochain lever : ${riseStr}
${emoji} Prochain coucher : ${setStr}`;
}


