// colonization-status.js – Statuts centralisés de colonisation

export const COLONIZATION_STATUS = {
  no: {
    label: "Non",
    reason: "Aucune présence humaine ou projet d'installation à ce jour."
  },
  envisaged: {
    label: "Envisagée",
    reason: "Des projets d'exploration ou de colonisation sont à l'étude ou en développement."
  },
  speculative: {
    label: "Spéculative",
    reason: "Théoriquement possible, mais aucune mission réelle n’est planifiée."
  },
  inhabited: {
    label: "Oui",
    reason: "Présence humaine permanente ou infrastructures existantes (ex : ISS, base lunaire...)."
  },
  impossible: {
    label: "Impossible",
    reason: "Conditions physiques ou environnementales éliminatoires pour toute colonisation."
  }
};
