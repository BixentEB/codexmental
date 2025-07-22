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

  // 🏙️ Bloc : Colonisation
  setupSectionSwitcher('#info-colony', {
    summary: renderColonizationSummary,
    explanation: renderColonizationExplanation
  }, data);

  // 🚀 Bloc : Missions
  setupSectionSwitcher('#info-missions', {
    summary: renderMissionSummary
  }, data);
}
