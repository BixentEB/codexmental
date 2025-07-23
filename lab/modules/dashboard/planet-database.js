// planet-database.js — Dictionnaire central des données planétaires pour le dashboard Codex Mental

export const PLANET_DATA = {
  mercure: {
    name: "Mercure",
    type: "tellurique",
    distance: "57.9 Mkm",
    radius: "2 440 km",
    temp: "167°C",
    colonized: "Spéculative",
    bases: [],
    moons: [],
    missions: ["Mariner 10", "MESSENGER", "BepiColombo"],
    textures: {
      surface: "mercure-surface.jpg",
      cloud: null,
      infrared: null
    }
  },
  venus: {
    name: "Vénus",
    type: "tellurique",
    distance: "108.2 Mkm",
    radius: "6 052 km",
    temp: "464°C",
    colonized: "Possible (orbite)",
    bases: [],
    moons: [],
    missions: ["Venera", "Magellan", "Akatsuki"],
    textures: {
      surface: "venus-surface.jpg",
      cloud: "venus-cloud.jpg",
      infrared: "venus-infrared.jpg"
    }
  },
  terre: {
    name: "Terre",
    type: "tellurique",
    distance: "149.6 Mkm",
    radius: "6 371 km",
    temp: "15°C",
    colonized: "Oui",
    bases: ["ISS"],
    moons: [{ name: "Lune", diameter: "3 474 km" }],
    missions: [],
    textures: {
      surface: "terre-surface.jpg",
      cloud: "terre-cloud.jpg",
      infrared: "terre-infrared.jpg"
    }
  },
  mars: {
    name: "Mars",
    type: "tellurique",
    distance: "227.9 Mkm",
    radius: "3 390 km",
    temp: "-63°C",
    colonized: "Envisagée",
    bases: ["Perseverance", "Zhurong"],
    moons: [
      { name: "Phobos", diameter: "22.2 km" },
      { name: "Deimos", diameter: "12.4 km" }
    ],
    missions: ["Viking", "Curiosity", "InSight", "Perseverance", "Zhurong"],
    textures: {
      surface: "mars-surface.jpg",
      cloud: null,
      infrared: "mars-infrared.jpg"
    }
  },
  jupiter: {
    name: "Jupiter",
    type: "gazeuse",
    distance: "778.3 Mkm",
    radius: "69 911 km",
    temp: "-108°C",
    colonized: "Spéculative",
    bases: [],
    moons: [
      { name: "Io" },
      { name: "Europe" },
      { name: "Ganymède" },
      { name: "Callisto" }
    ],
    missions: ["Pioneer", "Voyager", "Galileo", "Juno"],
    textures: {
      surface: "jupiter-surface.jpg",
      cloud: "jupiter-cloud.jpg",
      infrared: "jupiter-ir.jpg"
    }
  },
  saturne: {
    name: "Saturne",
    type: "gazeuse",
    distance: "1 429 Mkm",
    radius: "58 232 km",
    temp: "-139°C",
    colonized: "Spéculative",
    bases: [],
    moons: [
      { name: "Titan" },
      { name: "Encelade" },
      { name: "Rhéa" },
      { name: "Mimas" }
    ],
    missions: ["Voyager", "Cassini-Huygens"],
    textures: {
      surface: "saturne-surface.jpg",
      cloud: "saturne-cloud.jpg",
      infrared: "saturne-ir.jpg"
    }
  },
  uranus: {
    name: "Uranus",
    type: "glaciaire",
    distance: "2 871 Mkm",
    radius: "25 362 km",
    temp: "-197°C",
    colonized: "Spéculative",
    bases: [],
    moons: [
      { name: "Titania" },
      { name: "Oberon" },
      { name: "Miranda" },
      { name: "Ariel" }
    ],
    missions: ["Voyager 2"],
    textures: {
      surface: "uranus-surface.jpg",
      cloud: null,
      infrared: null
    }
  },
  neptune: {
    name: "Neptune",
    type: "glaciaire",
    distance: "4 498 Mkm",
    radius: "24 622 km",
    temp: "-201°C",
    colonized: "Spéculative",
    bases: [],
    moons: [
      { name: "Triton" },
      { name: "Néréide" }
    ],
    missions: ["Voyager 2"],
    textures: {
      surface: "neptune-surface.jpg",
      cloud: null,
      infrared: null
    }
  },

  // 🌑 Planètes naines
  ceres: {
    name: "Cérès",
    type: "naine",
    distance: "413 Mkm",
    radius: "473 km",
    temp: "-105°C",
    colonized: "Spéculative",
    bases: [],
    moons: [],
    missions: ["Dawn"],
    textures: {
      surface: "ceres-surface.jpg",
      cloud: null,
      infrared: null
    }
  },
  pluton: {
    name: "Pluton",
    type: "naine",
    distance: "5 900 Mkm",
    radius: "1 188 km",
    temp: "-229°C",
    colonized: "Spéculative",
    bases: [],
    moons: [
      { name: "Charon" },
      { name: "Hydra" },
      { name: "Nix" }
    ],
    missions: ["New Horizons"],
    textures: {
      surface: "pluton-surface.jpg",
      cloud: null,
      infrared: null
    }
  },
  haumea: {
    name: "Hauméa",
    type: "naine",
    distance: "6 452 Mkm",
    radius: "816 × 1 218 km",
    temp: "-241°C",
    colonized: "Spéculative",
    bases: [],
    moons: [
      { name: "Hiʻiaka" },
      { name: "Namaka" }
    ],
    missions: [],
    textures: {
      surface: "haumea-surface.jpg",
      cloud: null,
      infrared: null
    }
  },
  makemake: {
    name: "Makémaké",
    type: "naine",
    distance: "6 850 Mkm",
    radius: "715 km",
    temp: "-243°C",
    colonized: "Spéculative",
    bases: [],
    moons: [{ name: "MK2" }],
    missions: [],
    textures: {
      surface: "makemake-surface.jpg",
      cloud: null,
      infrared: null
    }
  },
  eris: {
    name: "Éris",
    type: "naine",
    distance: "10 120 Mkm",
    radius: "1 163 km",
    temp: "-231°C",
    colonized: "Spéculative",
    bases: [],
    moons: [{ name: "Dysnomia" }],
    missions: [],
    textures: {
      surface: "eris-surface.jpg",
      cloud: null,
      infrared: null
    }
  },

  // 🧱 🧪 Structure à copier/coller pour de nouveaux objets
  exemple: {
    name: "Nom visible",
    type: "type ou catégorie",
    distance: "—",
    radius: "—",
    temp: "—",
    colonized: "non | envisagée | spéculative",
    bases: [],
    moons: [],
    missions: [],
    textures: {
      surface: null,
      cloud: null,
      infrared: null
    }
  }
};
