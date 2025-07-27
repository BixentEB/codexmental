// ship-module.js — Comportement autonome du vaisseau spatial
export class Ship {
  constructor(center) {
    this.center = center;
    this.x = center.x + 100;
    this.y = center.y;
    this.angle = 0;
    this.speed = SHIP_CONFIG.speed;
    this.rotationSpeed = SHIP_CONFIG.rotationSpeed;
    this.avoidanceRadius = SHIP_CONFIG.avoidanceRadius;
    this.proximityRadius = SHIP_CONFIG.proximityRadius;
    this.size = 5;
    this.trail = [];
    this.pausedUntil = 0;
    this.lastObserved = 0;
  }

  update(objects, sunCenter) {
    const now = Date.now();
    if (now < this.pausedUntil) return;

    // Évitement du Soleil
    const dx = this.x - sunCenter.x;
    const dy = this.y - sunCenter.y;
    const distSun = Math.sqrt(dx * dx + dy * dy);
    if (distSun < this.avoidanceRadius) {
      const angleAway = Math.atan2(dy, dx);
      this.angle = angleAway + Math.random() * 0.5 - 0.25;
      this.log("⚠️ Évitement du Soleil");
    }

    // Détection de proximité (avec cooldown)
    for (const obj of objects) {
      const ox = this.center.x + Math.cos(obj.angle) * obj.r;
      const oy = this.center.y + Math.sin(obj.angle) * obj.r;
      const dist = Math.sqrt((this.x - ox) ** 2 + (this.y - oy) ** 2);
      if (dist < this.proximityRadius && now - this.lastObserved > 2000) {
        this.lastObserved = now;
        const label = obj.label || obj.name || 'Objet inconnu';
        this.log(`📡 Observation : ${label}`);
        if (SHIP_CONFIG.enableObservationPause) {
          this.pausedUntil = now + 1000 + Math.random() * 2000;
        }
        break;
      }
    }

    // Mouvement
    this.angle += this.rotationSpeed;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Rebonds bords écran
    const W = this.center.x * 2;
    const H = this.center.y * 2;
    if (this.x < 0 || this.x > W) this.angle = Math.PI - this.angle;
    if (this.y < 0 || this.y > H) this.angle = -this.angle;

    // Traînée
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > 80) this.trail.shift(); // traînée plus longue
    for (const pt of this.trail) pt.alpha *= 0.9;
  }

  draw(ctx) {
    // Traînée
    this.trail.forEach(pt => {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(136, 136, 255, ${pt.alpha})`;
      ctx.fill();
    });

    // Triangle vaisseau
    ctx.beginPath();
    ctx.moveTo(this.x + 5 * Math.cos(this.angle), this.y + 5 * Math.sin(this.angle));
    ctx.lineTo(this.x + 3 * Math.cos(this.angle + Math.PI * 0.75), this.y + 3 * Math.sin(this.angle + Math.PI * 0.75));
    ctx.lineTo(this.x + 3 * Math.cos(this.angle - Math.PI * 0.75), this.y + 3 * Math.sin(this.angle - Math.PI * 0.75));
    ctx.closePath();
    ctx.fillStyle = '#f0f';
    ctx.fill();
  }

  onClick(x, y) {
    const dist = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
    if (dist <= 10) {
      this.log("🛸 Vaisseau sélectionné !");
      return true;
    }
    return false;
  }

  log(msg) {
    console.log(`[Vaisseau] ${msg}`);
    const box = document.getElementById('info-missions');
    if (box) {
      const line = document.createElement('div');
      line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      box.appendChild(line);
      box.scrollTop = box.scrollHeight;
    }
  }
}

// Configuration globale
export const SHIP_CONFIG = {
  speed: 0.2,
  rotationSpeed: 0.002,
  avoidanceRadius: 80,
  proximityRadius: 12,
  enableObservationPause: true
};
