// display-moons.js – Injection enrichie des lunes dans le bloc infos
import { MOON_DATA } from './moon-database.js';

export function displayMoons(planetKey) {
  const container = document.getElementById('planet-moons');
  if (!container) return;

  const moons = MOON_DATA[planetKey];

  if (!moons || moons.length === 0) {
    container.innerHTML = "Aucune lune connue";
    return;
  }

  const html = moons.map(m => {
    const parts = [m.name];
    if (m.diameter) parts.push(`(${m.diameter})`);
    if (m.composition) parts.push(`— ${m.composition}`);
    return `<li>${parts.join(' ')}</li>`;
  }).join('');

  container.innerHTML = `<ul class="moon-list">${html}</ul>`;
}
