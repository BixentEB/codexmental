function getMoonData(date = new Date()) {
  const base = new Date('2024-01-11T07:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = diff / 29.530588853;
  const phase = lunations % 1;
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
  
  // Calcul correct pour avoir vraiment 1% minimum
  const minVisible = 1; // 1% minimum
  const adjustedIllumination = Math.max(illumination, minVisible);
  
  // Calcul de la position de l'ombre pour créer le croissant
  // Pour un croissant croissant (waxing), l'ombre vient de la gauche
  // Pour un croissant décroissant (waning), l'ombre vient de la droite
  const maxShift = 50; // Distance maximale de déplacement
  
  if (adjustedIllumination <= 1) {
    // Phase très mince : positionnement extrême
    const offset = isWaxing ? -maxShift + 2 : maxShift - 2;
    ombre.setAttribute('cx', 50 + offset);
  } else if (adjustedIllumination >= 99) {
    // Presque pleine lune : ombre très légère
    const offset = isWaxing ? maxShift - 2 : -maxShift + 2;
    ombre.setAttribute('cx', 50 + offset);
  } else {
    // Phase intermédiaire : calcul proportionnel
    const progress = adjustedIllumination / 100;
    const shift = maxShift * (1 - progress);
    const offset = isWaxing ? -shift : shift;
    ombre.setAttribute('cx', 50 + offset);
  }
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
      <circle cx="50" cy="50" r="50" fill="#f5f5dc" mask="url(#mask-lune)" />
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
