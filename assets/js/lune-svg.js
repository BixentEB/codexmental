function getMoonData(date = new Date()) {
  // Nouvelle lune : 25 juin 2025 (d'après les calendriers lunaires)
  const base = new Date('2025-06-25T00:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = diff / 29.530588853;
  const phase = (lunations % 1 + 1) % 1; // Normaliser entre 0 et 1
  
  // Calcul correct de l'illumination
  const illumination = (1 - Math.cos(phase * 2 * Math.PI)) / 2;
  const isWaxing = phase < 0.5;
  
  return {
    illumination: illumination * 100,
    isWaxing,
    phase
  };
}

function setMoonPhaseSVG(illumination, isWaxing) {
  const ombre = document.getElementById('ombre');
  if (!ombre) return;
  
  // Calcul mathématique correct pour correspondre au pourcentage réel
  // L'illumination de 0% = nouvelle lune (ombre au centre)
  // L'illumination de 50% = demi-lune (ombre sur le bord)
  // L'illumination de 100% = pleine lune (ombre très décalée)
  
  const progress = illumination / 100; // 0 à 1
  
  // Calcul de la position de l'ombre basé sur la géométrie lunaire
  // À 0% : ombre centrée (cx=50)
  // À 50% : ombre sur le bord (cx=0 ou cx=100)
  // À 100% : ombre très décalée pour ne pas masquer
  
  let ombreCx;
  
  if (illumination <= 0.1) {
    // Nouvelle lune : ombre au centre
    ombreCx = 50;
  } else if (illumination >= 99.9) {
    // Pleine lune : ombre très décalée
    ombreCx = isWaxing ? 150 : -50;
  } else {
    // Calcul proportionnel correct
    // Pour un croissant croissant : l'ombre part de droite (100) vers gauche
    // Pour un croissant décroissant : l'ombre part de gauche (0) vers droite
    if (isWaxing) {
      // Croissant croissant : illumination à droite, ombre vient de gauche
      ombreCx = 100 - (progress * 100);
    } else {
      // Croissant décroissant : illumination à gauche, ombre vient de droite  
      ombreCx = progress * 100;
    }
  }
  
  ombre.setAttribute('cx', ombreCx);
}

function insertSVGWidget() {
  const old = document.getElementById('svg-lune-widget');
  if (old) old.remove();

  const wrapper = document.createElement('div');
  wrapper.id = 'svg-lune-widget';

  wrapper.innerHTML = `
    <svg id="svg-lune" viewBox="0 0 100 100" class="moon-svg" width="100%" height="100%">
      <defs>
        <mask id="mask-lune">
          <rect x="0" y="0" width="100" height="100" fill="white" />
          <circle id="ombre" cx="50" cy="50" r="50" fill="black" />
        </mask>
      </defs>
      <image href="/img/lune/lune-pleine.png" x="0" y="0" width="100" height="100" mask="url(#mask-lune)" />
    </svg>
  `;

  document.body.appendChild(wrapper);
  setupLuneClickCycle(wrapper);
}

function setupLuneClickCycle(wrapper) {
  if (!wrapper) return;

  const tailles = ['150px', '250px', '350px', '500px'];
  const classes = ['', '', '', 'super-lune'];
  
  // Utilisation d'une variable en mémoire au lieu de localStorage
  let index = wrapper.dataset.tailleIndex ? parseInt(wrapper.dataset.tailleIndex) : 1;

  function applySizeAndClass() {
    wrapper.style.width = tailles[index];
    wrapper.style.height = tailles[index];
    wrapper.classList.remove('super-lune');
    if (classes[index]) wrapper.classList.add(classes[index]);
    wrapper.dataset.tailleIndex = index;
  }

  applySizeAndClass();
  wrapper.style.cursor = 'pointer';
  wrapper.style.pointerEvents = 'auto'; // S'assurer que c'est cliquable

  wrapper.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Logique responsive pour les tailles maximum
    const maxIndex = window.innerWidth <= 568 ? 1 :  // Mobile : max 250px
                     window.innerWidth <= 1024 ? 2 : // Tablet : max 350px
                     3; // Desktop : max 500px
    
    index = (index + 1) % (maxIndex + 1);
    applySizeAndClass();
    followScrollLuneSVG();
  });
}

function followScrollLuneSVG() {
  const lune = document.getElementById('svg-lune-widget');
  if (!lune) return;

  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const luneHeight = lune.offsetHeight;
  const top = scrollTop + windowHeight - luneHeight - 20;

  lune.style.position = 'absolute';
  lune.style.top = `${top}px`;
  lune.style.bottom = 'unset';
  lune.style.left = 'unset';
  lune.style.right = lune.classList.contains('super-lune') ? '-200px' : '20px';
  lune.style.zIndex = '1000';
}

export function updateLunarWidget() {
  if (document.readyState !== 'complete') {
    window.addEventListener('load', updateLunarWidget, { once: true });
    return;
  }

  insertSVGWidget();
  const { illumination, isWaxing } = getMoonData();
  setMoonPhaseSVG(illumination, isWaxing);

  // Debug : afficher les valeurs
  console.log(`Phase lunaire: ${illumination.toFixed(1)}% - ${isWaxing ? 'Croissant' : 'Décroissant'}`);

  window.addEventListener('scroll', followScrollLuneSVG);
  window.addEventListener('resize', followScrollLuneSVG);
  followScrollLuneSVG();
}
