// planet-sections.js – Fonctions de rendu pour les blocs dynamiques du dashboard
import { MOON_DATA } from './moon-database.js';
import { COLONIZATION_STATUS } from './colonization-status.js';

// 📋 INFORMATIONS
export function renderBasicInfo(data) {
  return `
    <p>Nom : ${data.name || '—'}</p>
    <p>Distance : ${data.distance || '—'}</p>
    <p>Diamètre : ${data.radius || '—'}</p>
    <p>Température : ${data.temp || '—'}</p>
  `;
}

export function renderComposition(data) {
  return data.composition
    ? `<p><strong>Composition :</strong><br>${data.composition}</p>`
    : `<p>—</p>`;
}

export function renderClimate(data) {
  return data.climate
    ? `<p><strong>Climat :</strong><br>${data.climate}</p>`
    : `<p>Température moyenne : ${data.temp || '—'}</p>`;
}

// 🏙️ COLONISATION
export function renderColonizationState(data) {
  const status = data.colonization?.status || '—';
  return `<p>État de colonisation : ${status}</p>`;
}

export function renderColonizationPotentials(data) {
  return data.colonization?.potentials
    ? `<p><strong>Potentiels :</strong><br>${data.colonization.potentials}</p>`
    : `<p>Potentiels : Données manquantes</p>`;
}

export function renderColonizationPhase(data) {
  return data.colonization?.phase
    ? `<p><strong>Phase actuelle :</strong><br>${data.colonization.phase}</p>`
    : `<p>Phase actuelle : Données manquantes</p>`;
}

export function renderColonizationBases(data) {
  const bases = data.colonization?.bases;
  if (Array.isArray(bases) && bases.length > 0) {
    return `<p><strong>Bases ou robots présents :</strong><br>${bases.join(', ')}</p>`;
  }
  return `<p>Aucune base connue</p>`;
}

// 🚀 EXPLORATION (missions)
export function renderMissionList(data) {
  const missions = data.missions;
  if (!Array.isArray(missions) || missions.length === 0) {
    return `<p>Aucune mission connue</p>`;
  }
  return missions.map(name => `<p>🚀 ${name}</p>`).join('');
}

// 🌙 LUNES (sélection individuelle avec visualisation)
export function renderMoonSelection({ planetKey }) {
  const moons = MOON_DATA[planetKey];
  if (!moons || moons.length === 0) return "<p>Aucune lune détectée</p>";

  const options = moons.map((m, index) => `<option value="${index}">${m.name}</option>`).join('');

  return `
    <label for="moon-select">Sélectionnez une lune :</label>
    <select id="moon-select" class="codex-select">
      <option value="">—</option>
      ${options}
    </select>
    <script>
      setTimeout(() => {
        const select = document.getElementById('moon-select');
        if (select) {
          select.addEventListener('change', (e) => {
            const idx = parseInt(e.target.value);
            if (!isNaN(idx)) {
              const moon = ${JSON.stringify(MOON_DATA[planetKey])}[idx];
              if (moon && window.loadMoon3D) {
                window.loadMoon3D(moon.name, moon);
              }
            }
          });
        }
      }, 100);
    </script>
  `;
}
