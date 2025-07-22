// display-moons.js – Affichage enrichi des lunes, sans <ul>, format texte espacé
import { MOON_DATA } from './moon-database.js';

export function displayMoons(planetKey) {
  const container = document.getElementById('planet-moons');
  if (!container) return;

  const moons = MOON_DATA[planetKey];

  if (!moons || moons.length === 0) {
    container.innerHTML = "Aucune lune connue";
    return;
  }

  // 🌙 Format : Io — 3 643 km — volcanique
  const html = moons.map(m => {
    const parts = [`<strong>${m.name}</strong>`];
    if (m.diameter) parts.push(m.diameter);
    if (m.composition) parts.push(m.composition);
    return `<p>${parts.join(' — ')}</p>`;
  }).join('');

  container.innerHTML = html;
}
