// planet-data.js – Mise à jour des blocs planétaires + affichage des lunes enrichies

import { displayMoons } from './display-moons.js';
import { COLONIZATION_STATUS } from './colonization-status.js';

export function updatePlanetUI(data = {}, planetKey = null) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  };

  set('planet-name', data.name);
  set('planet-distance', data.distance);
  set('planet-size', data.radius);
  set('planet-temp', data.temp);

  // 💡 Colonisation enrichie
  if (data.colonization?.status) {
    const statusKey = data.colonization.status;
    const status = COLONIZATION_STATUS[statusKey];
    set('planet-colonized', status?.label || "—");

    const baseList = Array.isArray(data.colonization.bases) && data.colonization.bases.length
      ? data.colonization.bases.join(', ')
      : '—';
    set('planet-bases', baseList);

    // Injection de la raison (si bloc dédié ou tooltip plus tard)
    const reasonEl = document.getElementById('colonization-reason');
    if (reasonEl && status?.reason) {
      reasonEl.textContent = status.reason;
    }
  } else {
    set('planet-colonized', '—');
    set('planet-bases', '—');
  }

  // 🛰️ Missions
  set('planet-mission', Array.isArray(data.missions) && data.missions.length
    ? data.missions.join(', ')
    : '—');

  // 🌙 Lunes enrichies
  if (planetKey) displayMoons(planetKey);
}
