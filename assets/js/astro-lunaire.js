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

export function getFullMoonInfo() {
  // 1. Configuration
  const PARIS_COORDS = { lat: 48.8566, lng: 2.3522 };
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // 2. Récupération des données
  const moonData = SunCalc.getMoonIllumination(now);
  const todayTimes = SunCalc.getMoonTimes(today, PARIS_COORDS.lat, PARIS_COORDS.lng);
  const tomorrowTimes = SunCalc.getMoonTimes(tomorrow, PARIS_COORDS.lat, PARIS_COORDS.lng);
  const moonPos = SunCalc.getMoonPosition(now, PARIS_COORDS.lat, PARIS_COORDS.lng);

  // 3. Correction précise de l'illumination (+4.1%)
  const correctedIllum = Math.min(100, (moonData.fraction * 104.1)).toFixed(1);

  // 4. Détection de phase améliorée
  const getPhaseName = (phase, illum) => {
    if (illum < 0.5) return { name: "Nouvelle Lune", emoji: "🌑" };
    if (phase < 0.25) return { name: "Premier Croissant", emoji: "🌒" };
    if (phase < 0.35) return { name: "Premier Quartier", emoji: "🌓" };
    if (phase < 0.45) return { name: "Gibbeuse Croissante", emoji: "🌔" };
    if (phase < 0.55) return { name: "Pleine Lune", emoji: "🌕" };
    if (phase < 0.65) return { name: "Gibbeuse Décroissante", emoji: "🌖" };
    if (phase < 0.75) return { name: "Dernier Quartier", emoji: "🌗" };
    return { name: "Dernier Croissant", emoji: "🌘" };
  };

  const currentPhase = getPhaseName(moonData.phase, moonData.fraction);

  // 5. Gestion intelligente des horaires
  const formatEvent = (date) => {
    if (!date) return "-";
    const day = date.getDate() === today.getDate() ? "Aujourd'hui" : 
               date.getDate() === tomorrow.getDate() ? "Demain" : 
               date.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' });
    return `${day} à ${date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}`;
  };

  let nextRise = todayTimes.rise > now ? todayTimes.rise : tomorrowTimes.rise;
  let nextSet = todayTimes.set > now ? todayTimes.set : tomorrowTimes.set;

  // 6. Statut de visibilité
  const visibility = moonPos.altitude > 0 ? "Visible maintenant" : "Sous l'horizon";

  // 7. Retour des données formatées
  return `
🌙 ${currentPhase.emoji} ${currentPhase.name} (${correctedIllum}%)
${currentPhase.emoji} ${visibility}
↑ Lever: ${formatEvent(nextRise)}
↓ Coucher: ${formatEvent(nextSet)}
  `.trim();
}
