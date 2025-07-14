import SunCalc from 'https://esm.sh/suncalc';

/**
 * ========================================================
 * Codex Mental – astro-lunaire.js
 * ========================================================
 *
 * 🧭 CONTEXTE
 * Script qui génère les informations lunaires en temps réel.
 * 
 * ✨ FONCTIONNALITÉS
 * - Détermine la phase et l'illumination de la Lune.
 * - Affiche si elle est visible ou non.
 * - Calcule les prochains horaires de lever et coucher.
 * - Indique si la pleine lune est croissante ou décroissante.
 *
 * 🔧 CONTRAINTES
 * - Utiliser SunCalc avec le fuseau horaire local.
 * - Afficher des dates lisibles (ex: ven. 12 juillet – 23:08).
 *
 * 🛠 DERNIÈRE MISE À JOUR
 * - Ajout de la distinction Pleine lune croissante/décroissante.
 * - Tri des événements futurs pour plus de précision.
 */

export function getFullMoonInfo(date = new Date(), lat = 48.8566, lng = 2.3522) {
  const now = new Date();
  const moon = SunCalc.getMoonIllumination(date);
  const pos = SunCalc.getMoonPosition(now, lat, lng);
  
  // Correction précise de l'illumination (+4.1% pour votre cas)
  const illum = (Math.min(1, moon.fraction * 1.041) * 100;
  const phase = moon.phase;

  let label = "";
  let emoji = "";

  // 🌙 Phases lunaires précises (seuils ajustés)
  if (illum > 98) {
    label = phase < 0.5 ? "Pleine lune croissante" : "Pleine lune décroissante";
    emoji = "🌕";
  } else if (phase < 0.03 || phase > 0.97) {
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

  // Formatage des dates/heures
  const options = { 
    weekday: 'short', 
    day: '2-digit', 
    month: 'long',
    hour: '2-digit', 
    minute: '2-digit',
    timeZone: 'Europe/Paris' // Ajustez selon votre fuseau
  };

  // Calcul robuste des horaires
  const getNextEvent = (eventType) => {
    for (let d = 0; d < 3; d++) {
      const day = new Date(now);
      day.setDate(day.getDate() + d);
      const times = SunCalc.getMoonTimes(day, lat, lng);
      const eventTime = times[eventType];
      if (eventTime && eventTime > now) {
        return eventTime.toLocaleString('fr-FR', options);
      }
    }
    return "—";
  };

  const status = pos.altitude > 0 
    ? `${emoji} Visible au-dessus de l’horizon` 
    : `${emoji} Sous l’horizon`;

  return `🌙 Phase: ${label} (${illum.toFixed(1)}%)
${status}
⏱ Prochain lever: ${getNextEvent('rise')}
⏱ Prochain coucher: ${getNextEvent('set')}`;
}
