// newmoon.js - VERSION FINALE (Canvas)

// 1. Configuration
const MOON_CONFIG = {
  sizes: ['150px', '250px', '500px'], // Vos tailles préférées
  colors: {
    light: '#f5f5f5',
    shadow: 'rgba(0,0,0,0.8)'
  }
};

// 2. Charge SunCalc (identique à l'original)
function loadSunCalc(callback) {
  if (window.SunCalc) return callback();
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/suncalc@1.9.0/suncalc.min.js';
  script.onload = callback;
  document.head.appendChild(script);
}

// 3. Moteur de rendu Canvas
class MoonRenderer {
  constructor() {
    this.sizeIndex = 1;
    this.container = this.createContainer();
    this.initCanvas();
    this.setupEvents();
  }

  createContainer() {
    const div = document.createElement('div');
    div.id = 'moon-container';
    div.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      cursor: pointer;
      z-index: 1000;
      width: ${MOON_CONFIG.sizes[this.sizeIndex]};
      height: ${MOON_CONFIG.sizes[this.sizeIndex]};
    `;
    document.body.appendChild(div);
    return div;
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.width = 300; // Haute résolution
    this.canvas.height = 300;
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
  }

  drawMoon(fraction, phase) {
    const radius = this.canvas.width / 2;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Lune éclairée
    this.ctx.beginPath();
    this.ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = MOON_CONFIG.colors.light;
    this.ctx.fill();
    
    // Ombre dynamique
    const angle = phase * Math.PI * 2;
    const shadowWidth = (1 - fraction) * radius * 2;
    
    this.ctx.beginPath();
    this.ctx.arc(radius, radius, radius, angle - Math.PI/2, angle + Math.PI/2);
    this.ctx.lineTo(
      radius + Math.cos(angle) * shadowWidth,
      radius + Math.sin(angle) * shadowWidth
    );
    this.ctx.closePath();
    this.ctx.fillStyle = MOON_CONFIG.colors.shadow;
    this.ctx.fill();
  }

  setupEvents() {
    this.container.addEventListener('click', () => {
      this.sizeIndex = (this.sizeIndex + 1) % MOON_CONFIG.sizes.length;
      this.container.style.width = MOON_CONFIG.sizes[this.sizeIndex];
      this.container.style.height = MOON_CONFIG.sizes[this.sizeIndex];
    });
  }
}

// 4. Initialisation
function initMoonWidget() {
  const renderer = new MoonRenderer();
  
  loadSunCalc(() => {
    const update = () => {
      const {fraction, phase} = SunCalc.getMoonIllumination(new Date());
      renderer.drawMoon(fraction, phase);
      console.log(`🌝 Illum: ${(fraction * 100).toFixed(1)}% | Phase: ${phase.toFixed(3)}`);
    };
    
    update();
    setInterval(update, 3600000); // Mise à jour horaire
  });
}

// Lancement automatique
if (!window.moonWidgetInitialized) {
  window.moonWidgetInitialized = true;
  initMoonWidget();
}
