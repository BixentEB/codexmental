// planet-database.js — Dictionnaire central des données planétaires pour le dashboard Codex Mental

export const PLANET_DATA = {

  // STARS
  soleil: {
    name: "Soleil",
    type: "étoile",
    distance: "0",
    radius: "696 340 km",
    temp: "5 778 K",
    colonized: "Non exploitable",
    bases: [],
    moons: [],
    missions: ["SOHO", "Parker Solar Probe", "Solar Orbiter"],
    textures: {
      surface: "soleil-surface.jpg",
      cloud: null,
      infrared: "soleil-infrared.jpg"
    },
    symbol: "☉",
    symbolImg: "soleil-symbol.svg",
    sciName: "Sol"
  },

// PLANETS  
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
    },
    symbol: "☿",
    symbolImg: "mercure-symbol.svg",
    sciName: "Sol I"
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
    },
    symbol: "♀",
    symbolImg: "venus-symbol.svg",
    sciName: "Sol II"
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
    },
    symbol: "♁",
    symbolImg: "terre-symbol.svg",
    sciName: "Sol III"
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
    },
    symbol: "♂",
    symbolImg: "mars-symbol.svg",
    sciName: "Sol IV"
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
    },
    symbol: "♃",
    symbolImg: "jupiter-symbol.svg",
    sciName: "Sol V"
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
    },
    symbol: "♄",
    symbolImg: "saturne-symbol.svg",
    sciName: "Sol VI"
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
    },
    symbol: "♅",
    symbolImg: "uranus-symbol.svg",
    sciName: "Sol VII"
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
    },
    symbol: "♆",
    symbolImg: "neptune-symbol.svg",
    sciName: "Sol VIII"
  },

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
    },
    symbol: "⛳",
    symbolImg: "ceres-symbol.svg",
    sciName: "Sol (Ce)"
  },

  // DWARF PLANETS
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
    },
    symbol: "♇",
    symbolImg: "pluton-symbol.svg",
    sciName: "Sol IX"
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
      { name: "Hiʻīaka" },
      { name: "Namaka" }
    ],
    missions: [],
    textures: {
      surface: "haumea-surface.jpg",
      cloud: null,
      infrared: null
    },
    symbol: "⯶",
    symbolImg: "haumea-symbol.svg",
    sciName: "Sol (Ha)"
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
    },
    symbol: "⯺",
    symbolImg: "makemake-symbol.svg",
    sciName: "Sol (Ma)"
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
    },
    symbol: "⯰",
    symbolImg: "eris-symbol.svg",
    sciName: "Sol (Er)"
  },

  // HYPOTHETIC PLANETS
  planete9: {
    name: "Planète Neuf",
    type: "hypothétique",
    distance: ">400 UA",
    radius: "?",
    temp: "?",
    colonized: "Inconnue",
    bases: [],
    moons: [],
    missions: [],
    textures: {
      surface: "/lab/modules/dashboard/img/planets/nine-surface.jpg",
      cloud: null,
      infrared: null
    },
    symbol: "?",
    symbolImg: null,
    sciName: "Hyp. IX"
  },

  //BELTS
    "asteroid-belt": {
  name: "Ceinture d'astéroïdes",
  type: "ceinture",
  distance: "300-600 Mkm",
  radius: "~400 Mkm",
  temp: "-100°C à -150°C",
  colonized: "Inexploitable",
  bases: [],
  moons: [],
  missions: ["Dawn", "Lucy"],
  textures: {
    surface: null,
    cloud: null,
    infrared: null
  },
  symbol: "☄",
  symbolImg: "asteroid-symbol.svg",
  sciName: "Asteroid Belt"
},



    "kuiper-zone": {
    name: "Ceinture de Kuiper",
    type: "ceinture",
    distance: "4 500 à 7 500 Mkm",
    radius: "~6 000 Mkm",
    temp: "-220°C à -250°C",
    colonized: "Non",
    bases: [],
    moons: [],
    missions: ["New Horizons", "Voyager 1", "Voyager 2"],
    textures: {
      surface: null,
      cloud: null,
      infrared: null
    },
    symbol: "⛛", // ou autre caractère fictif
    symbolImg: "kuiper-symbol.svg", // optionnel
    sciName: "Kuiper Belt"
  },


};
