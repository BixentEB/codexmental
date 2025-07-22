// moon-database.js – Dictionnaire des lunes du système solaire
// Clé = nom court de la planète ; chaque valeur contient un tableau de lunes

export const MOON_DATA = {
  mars: [
    {
      name: "Phobos",
      diameter: "22.2 km",
      orbit: "6 000 km",
      composition: "rocheuse",
      description: "Phobos est la plus grande lune de Mars, très proche de sa surface.",
      status: "naturelle",
      image: "phobos.jpg"
    },
    {
      name: "Deimos",
      diameter: "12.4 km",
      orbit: "20 000 km",
      composition: "rocheuse",
      description: "Deimos est plus éloignée et plus petite que Phobos.",
      status: "naturelle",
      image: "deimos.jpg"
    }
  ],
  jupiter: [
    {
      name: "Io",
      diameter: "3 643 km",
      orbit: "421 800 km",
      composition: "volcanique",
      description: "Lune très active, avec des volcans sulfuriques.",
      status: "naturelle",
      image: "io.jpg"
    },
    {
      name: "Europe",
      diameter: "3 122 km",
      orbit: "671 000 km",
      composition: "glacée",
      description: "Possède un océan liquide sous une croûte de glace.",
      status: "naturelle",
      image: "europa.jpg"
    },
    {
      name: "Ganymède",
      diameter: "5 268 km",
      orbit: "1 070 000 km",
      composition: "glacée",
      description: "Plus grande lune du système solaire.",
      status: "naturelle",
      image: "ganymede.jpg"
    },
    {
      name: "Callisto",
      diameter: "4 821 km",
      orbit: "1 880 000 km",
      composition: "glacée",
      description: "Très ancienne, cratérisée.",
      status: "naturelle",
      image: "callisto.jpg"
    }
  ],
  saturne: [
    {
      name: "Titan",
      diameter: "5 150 km",
      orbit: "1 222 000 km",
      composition: "atmosphérique, méthane",
      description: "Possède une atmosphère dense, lacs de méthane.",
      status: "naturelle",
      image: "titan.jpg"
    },
    {
      name: "Encelade",
      diameter: "504 km",
      orbit: "238 000 km",
      composition: "glacée",
      description: "Sources hydrothermales possibles sous la glace.",
      status: "naturelle",
      image: "encelade.jpg"
    }
  ],
  uranus: [
    { name: "Titania", diameter: "1 578 km", orbit: "436 300 km", composition: "glace et roche", description: "", status: "naturelle", image: "titania.jpg" },
    { name: "Oberon", diameter: "1 523 km", orbit: "583 500 km", composition: "glace et roche", description: "", status: "naturelle", image: "oberon.jpg" }
  ],
  neptune: [
    { name: "Triton", diameter: "2 706 km", orbit: "354 800 km", composition: "glace azotée", description: "Possède une orbite rétrograde, capturée.", status: "naturelle", image: "triton.jpg" }
  ],
  pluton: [
    { name: "Charon", diameter: "1 212 km", orbit: "19 600 km", composition: "glacée", description: "Lune massive, système double avec Pluton.", status: "naturelle", image: "charon.jpg" }
  ],

  // 🧱 Gabarit à copier
  exemple: [
    {
      name: "Nom de la lune",
      diameter: "—",
      orbit: "—",
      composition: "—",
      description: "—",
      status: "naturelle | artificielle | abandonnée",
      image: "nom-de-fichier.jpg"
    }
  ]
};
