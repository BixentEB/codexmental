// lune-phase.js
import SunCalc from 'https://cdn.jsdelivr.net/npm/suncalc/+esm';

/**
 * Retourne l'événement phase lunaire du jour.
 */
export function getLunarPhaseEvent() {
  const today = new Date();
  const moon = SunCalc.getMoonIllumination(today);
  const fraction = moon.phase;

  let phase = "";
  if (fraction < 0.03 || fraction > 0.97) {
    phase = "Nouvelle lune";
  } else if (fraction < 0.22) {
    phase = "Premier croissant";
  } else if (fraction < 0.28) {
    phase = "Premier quartier";
  } else if (fraction < 0.47) {
    phase = "Gibbeuse croissante";
  } else if (fraction < 0.53) {
    phase = "Pleine lune";
  } else if (fraction < 0.72) {
    phase = "Gibbeuse décroissante";
  } else if (fraction < 0.78) {
    phase = "Dernier quartier";
  } else {
    phase = "Dernier croissant";
  }

  return {
    date: today.toISOString().split("T")[0],
    type: "moon_phase",
    phase: phase,
    message: `🌕 Phase lunaire : ${phase}`,
    themeEffect: `moon_${phase.replace(/\s/g, "_").toLowerCase()}`
  };
}
