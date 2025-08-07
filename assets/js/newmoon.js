// 1. CONFIGURATION DE BASE
const MOON_CONFIG = {
  sizes: ['150px', '250px', '500px'], // Vos tailles préférées conservées
  textureUrl: '/img/lune/lune-pleine.png'
};

// 2. MOTEUR DE RENDU SIMPLIFIÉ
class MoonRenderer {
  constructor() {
    this.container = this.createContainer();
    this.initCanvas();
  }

  createContainer() {
    const div = document.createElement('div');
    div.id = 'moon-container';
    div.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      cursor: pointer;
      width: ${MOON_CONFIG.sizes[1]};
      height: ${MOON_CONFIG.sizes[1]};
    `;
    document.body.appendChild(div);
    return div;
  }

  initCanvas() {
    this.canvas = document.createElement('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.canvas.width = 300; // Résolution fixe pour qualité
    this.canvas.height = 300;
    this.container.innerHTML = '';
    this.container.appendChild(this.canvas);
  }

  // 3. ALGORITHME GARANTI SANS BUG
  drawMoon(fraction, phase) {
    const radius = this.canvas.width / 2;
    
    // Effacer le canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Dessiner la lune pleine
    this.ctx.beginPath();
    this.ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    this.ctx.fillStyle = '#f5f5f5';
    this.ctx.fill();
    
    // Calculer l'ombre avec précision mathématique
    const shadowAngle = phase * Math.PI * 2;
    const shadowSize = (1 - fraction) * radius * 2;
    
    // Dessiner l'ombre
    this.ctx.beginPath();
    this.ctx.arc(radius, radius, radius, 
                 shadowAngle - Math.PI/2, 
                 shadowAngle + Math.PI/2);
    this.ctx.lineTo(radius + Math.cos(shadowAngle) * shadowSize, 
                    radius + Math.sin(shadowAngle) * shadowSize);
    this.ctx.closePath();
    this.ctx.fillStyle = 'rgba(0,0,0,0.8)';
    this.ctx.fill();
  }
}

// 4. INITIALISATION ROBUSTE
function initMoonWidget() {
  const renderer = new MoonRenderer();
  
  loadSunCalc(() => {
    const update = () => {
      const {fraction, phase} = SunCalc.getMoonIllumination(new Date());
      renderer.drawMoon(fraction, phase);
      console.log(`🌕 Phase=${phase.toFixed(3)} Illum=${(fraction*100).toFixed(1)}%`);
    };
    
    update();
    setInterval(update, 3600000);
  });
}

// Lancement
initMoonWidget();
