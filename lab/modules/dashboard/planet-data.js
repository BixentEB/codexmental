// planet-data.js – Données centralisées + mise à jour UI des blocs planétaires

export function updatePlanetUI(data = {}) {
  const set = (id, val) => {
    const el = document.getElementById(id);
    if (el) el.textContent = val || '—';
  };

  set('planet-name', data.name);
  set('planet-distance', data.distance);
  set('planet-size', data.radius);
  set('planet-temp', data.temp);

  set('planet-moons', Array.isArray(data.moons) && data.moons.length
    ? data.moons.join(', ')
    : '—');

  set('planet-colonized', data.colonized);
  set('planet-bases', Array.isArray(data.bases) && data.bases.length
    ? data.bases.join(', ')
    : '—');

  set('planet-mission', Array.isArray(data.missions) && data.missions.length
    ? data.missions.join(', ')
    : '—');
}
