// newmoon.js
import { moonphase } from './lib/astronomia/src/moonphase.js';

/**
 * Met à jour la lune SVG avec Astronomia
 */
export function updateNewMoonWidget() {
  const now = new Date();
  
  // Calcule l'âge de la lune en jours (0 = nouvelle lune, ~14,7 = pleine lune)
  const phaseDays = moonphase.phase(now);

  // Convertit l'âge en illumination approximative
  // Formule simplifiée : illum = 0.5 * (1 - cos(2π * phase / 29.5306))
  const phaseFraction = phaseDays / 29.5306;
  const illum = 0.5 * (1 - Math.cos(2 * Math.PI * phaseFraction));

  // Trouve le masque
  const ombre = document.getElementById('ombre');
  if (!ombre) return;

  // Croissante/décroissante selon la phase
  let cx;
  if (phaseDays <= 14.7653) {
    // Croissante
    cx = 50 - (1 - illum) * 50;
  } else {
    // Décroissante
    cx = 50 + (1 - illum) * 50;
  }

  ombre.setAttribute('cx', cx);

  console.log(`🌙 Astronomia: Illumination=${(illum*100).toFixed(1)}% / Phase Days=${phaseDays.toFixed(2)} / cx=${cx.toFixed(1)}`);
}
