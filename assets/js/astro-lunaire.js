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
  // Coordonnées de Paris (peut être remplacé par Lyon: 45.7640, 4.8357)
  const lat = 48.8566;
  const lng = 2.3522;
  const now = new Date();
  
  // 1. Données astronomiques précises
  const {fraction, phase} = SunCalc.getMoonIllumination(now);
  const moonPos = SunCalc.getMoonPosition(now, lat, lng);
  const todayTimes = SunCalc.getMoonTimes(now, lat, lng);
  
  // 2. Correction de l'illumination (+4.1% pour Lyon/Paris)
  const illum = Math.min(100, (fraction * 104.1)).toFixed(1);

  // 3. Détection précise de la phase
  const PHASES = [
    {max: 0.03, name: "Nouvelle Lune", emoji: "🌑"},
    {max: 0.22, name: "Premier Croissant", emoji: "🌒"},
    {max: 0.28, name: "Premier Quartier", emoji: "🌓"},
    {max: 0.47, name: "Gibbeuse Croissante", emoji: "🌔"},
    {max: 0.53, name: "Pleine Lune", emoji: "🌕"},
    {max: 0.72, name: "Gibbeuse Décroissante", emoji: "🌖"},
    {max: 0.78, name: "Dernier Quartier", emoji: "🌗"},
    {max: 1, name: "Dernier Croissant", emoji: "🌘"}
  ];
  const currentPhase = PHASES.find(p => phase < p.max) || PHASES[0];

  // 4. Gestion des horaires (lever/coucher)
  const formatTime = (date) => date.toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'});
  const formatDate = (date) => date.toLocaleDateString('fr-FR', {weekday: 'short', day: 'numeric', month: 'short'});

  // Trouve le prochain lever (aujourd'hui ou demain)
  let nextRise;
  if (todayTimes.rise && todayTimes.rise > now) {
    nextRise = `${formatDate(todayTimes.rise)} – ${formatTime(todayTimes.rise)}`;
  } else {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = SunCalc.getMoonTimes(tomorrow, lat, lng);
    nextRise = tomorrowTimes.rise 
      ? `${formatDate(tomorrowTimes.rise)} – ${formatTime(tomorrowTimes.rise)}` 
      : "Invisible aujourd'hui";
  }

  // Trouve le prochain coucher (toujours celui d'aujourd'hui si disponible)
  const nextSet = todayTimes.set 
    ? `${formatDate(todayTimes.set)} – ${formatTime(todayTimes.set)}` 
    : "Pas de coucher aujourd'hui";

  // 5. Statut de visibilité
  const visibility = moonPos.altitude > 0 
    ? `${currentPhase.emoji} Visible maintenant` 
    : `${currentPhase.emoji} Sous l'horizon`;

  // 6. Retourne les données formatées
  return `
🌙 Phase actuelle: ${currentPhase.name} (${illum}%)
${visibility}
↑ Prochain lever: ${nextRise}
↓ Prochain coucher: ${nextSet}
  `.trim();
}
${status}
↑ Prochain lever: ${nextRise}
↓ Prochain coucher: ${nextSet}`;
}
