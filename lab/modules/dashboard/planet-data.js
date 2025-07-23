// planet-data.js – Mise à jour des blocs planétaires avec sections dynamiques

import { setupSectionSwitcher } from './section-switcher.js';
import { COLONIZATION_STATUS } from './colonization-status.js';
import {
  renderBasicInfo,
  renderComposition,
  renderClimate,
  renderMoonSummary,
  renderMoonDetails,
  renderColonizationSummary,
  renderColonizationExplanation,
  renderMissionSummary
} from './planet-sections.js';

export function updatePlanetUI(data = {}, planetKey = null) {
  // 🌐 Affichage dynamique : symbole, nom, nom scientifique
  const symbolTarget = document.getElementById('planet-symbol');
  if (symbolTarget) {
    symbolTarget.innerHTML = data.symbolImg
      ? `<img src="/lab/modules/dashboard/img/symbols/${data.symbolImg}" alt="${data.name}" class="symbol-img">`
      : `<span class="symbol-text">${data.symbol || ""}</span>`;
  }

  const nameTarget = document.getElementById('planet-name');
  if (nameTarget) {
    nameTarget.textContent = data.name || "";
  }

  const sciNameTarget = document.getElementById('planet-scientific-name');
  if (sciNameTarget) {
    sciNameTarget.textContent = data.sciName || "";
  }

  // 🧠 Bloc : Informations principales
  setupSectionSwitcher('#info-data', {
    basic: renderBasicInfo,
    composition: renderComposition,
    climat: renderClimate
  }, data);

  // 🌙 Bloc : Lunes (si données disponibles)
  if (planetKey) {
    setupSectionSwitcher('#info-moons', {
      summary: renderMoonSummary,
      details: renderMoonDetails
    }, { planetKey, data });
  }

  // 🏙️ Bloc : Terraformation
  setupSectionSwitcher('#info-colony', {
    summary: renderColonizationSummary,
    explanation: renderColonizationExplanation
  }, data);

  // 🚀 Bloc : Exploration
  setupSectionSwitcher('#info-missions', {
    summary: renderMissionSummary
  }, data);
}
