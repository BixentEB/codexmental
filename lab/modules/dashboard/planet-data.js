// planet-data.js – Mise à jour des blocs planétaires + affichage des lunes enrichies

import { displayMoons } from './display-moons.js';

export function updatePlanetUI(data = {}, planetKey = null) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  };

  set('planet-name', data.name);
  set('planet-distance', data.distance);
  set('planet-size', data.radius);
  set('planet-temp', data.temp);

  set('planet-colonized', data.colonized);
  set('planet-bases', Array.isArray(data.bases) && data.bases.length
    ? data.bases.join(', ')
    : '—');

  set('planet-mission', Array.isArray(data.missions) && data.missions.length
    ? data.missions.join(', ')
    : '—');

  if (planetKey) displayMoons(planetKey);
}
