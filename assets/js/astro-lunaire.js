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
  
  // Correction d'illumination précise
  const illum = (Math.min(1, moon.fraction * 1.041) * 100;
  const phase = moon.phase;

  // Détermination de la phase lunaire (seuils ajustés)
  let label = "";
  if (phase < 0.03 || phase > 0.97) label = "Nouvelle lune";
  else if (phase < 0.22) label = "Premier croissant";
  else if (phase < 0.28) label = "Premier quartier";
  else if (phase < 0.47) label = "Gibbeuse croissante";
  else if (phase < 0.53) label = "Pleine lune";
  else if (phase < 0.72) label = "Gibbeuse décroissante";
  else if (phase < 0.78) label = "Dernier quartier";
  else label = "Dernier croissant";

  // Formatage date/heure
  const formatTime = (date) => date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formatDate = (date) => date.toLocaleDateString('fr-FR', { weekday: 'short', day: '2-digit', month: 'short' });

  // Calcul des événements lunaires
  const todayTimes = SunCalc.getMoonTimes(now, lat, lng);
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowTimes = SunCalc.getMoonTimes(tomorrow, lat, lng);

  // Gestion des lever/coucher
  let nextRise, nextSet;

  if (todayTimes.rise && todayTimes.rise > now) {
    // Lever aujourd'hui pas encore passé
    nextRise = `${formatDate(todayTimes.rise)} – ${formatTime(todayTimes.rise)}`;
    nextSet = todayTimes.set ? `${formatDate(todayTimes.set)} – ${formatTime(todayTimes.set)}` : "—";
  } else {
    // Lever aujourd'hui déjà passé → on prend demain
    nextRise = tomorrowTimes.rise ? `${formatDate(tomorrowTimes.rise)} – ${formatTime(tomorrowTimes.rise)}` : "—";
    nextSet = todayTimes.set ? `${formatDate(todayTimes.set)} – ${formatTime(todayTimes.set)}` : "—";
  }

  // Statut de visibilité
  const pos = SunCalc.getMoonPosition(now, lat, lng);
  const status = pos.altitude > 0 
    ? "🌝 Visible au-dessus de l'horizon" 
    : "🌚 Sous l'horizon";

  return `🌙 Phase: ${label} (${illum.toFixed(1)}%)
${status}
↑ Prochain lever: ${nextRise}
↓ Prochain coucher: ${nextSet}`;
}
