// ship-module.js — Vaisseau spatial avec évitement solaire intelligent et logs filtrés
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
    this.lastAvoid = 0;
    this.lastLog = "";
    this.lastLoggedObject = null;
  }

  update(objects, sunCenter) {
    const now = Date.now();
    if (now < this.pausedUntil) return;

    // Évitement solaire (avec cooldown)
    const dx = this.x - sunCenter.x;
    const dy = this.y - sunCenter.y;
    const distSun = Math.sqrt(dx * dx + dy * dy);
    if (distSun < this.avoidanceRadius && now - this.lastAvoid > 5000) {
      this.lastAvoid = now;
      const awayAngle = Math.atan2(dy, dx);
      const smooth = 0.05;
      this.angle = this.angle * (1 - smooth) + awayAngle * smooth;
      this.logOnce("⚠️ Évitement du Soleil", "yellow");
    }

    // Détection d’objets
    for (const obj of objects) {
      const name = obj.label || obj.name;
      if (!name) continue;

      const ox = this.center.x + Math.cos(obj.angle) * obj.r;
      const oy = this.center.y + Math.sin(obj.angle) * obj.r;
      const dist = Math.sqrt((this.x - ox) ** 2 + (this.y - oy) ** 2);
      if (dist < this.proximityRadius && now - this.lastObserved > 4000) {
        if (name !== this.lastLoggedObject) {
          this.lastObserved = now;
          this.lastLoggedObject = name;
          this.logOnce(`📡 Observation : ${name}`, "cyan");
          if (SHIP_CONFIG.enableObservationPause) {
            this.pausedUntil = now + 1000 + Math.random() * 1500;
          }
        }
        break;
      }
    }

    // Mouvement
    this.angle += this.rotationSpeed;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    // Rebonds limites
    const W = this.center.x * 2;
    const H = this.center.y * 2;
    if (this.x < 0 || this.x > W) this.angle = Math.PI - this.angle;
    if (this.y < 0 || this.y > H) this.angle = -this.angle;

    // Traînée
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > 100) this.trail.shift();
    for (const pt of this.trail) pt.alpha *= 0.94;
  }

  draw(ctx) {
    this.trail.forEach(pt => {
      const gradColor = `rgba(${100 + 155 * pt.alpha}, ${150 + 50 * pt.alpha}, 255, ${pt.alpha})`;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = gradColor;
      ctx.fill();
    });

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
      this.log("🛸 Vaisseau sélectionné !", "white");
      return true;
    }
    return false;
  }

  log(msg, color = "white") {
    console.log(`[Vaisseau] ${msg}`);
    const box = document.getElementById('info-missions');
    if (box) {
      const line = document.createElement('div');
      line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      line.style.color = color;
      line.style.margin = "2px 0";
      box.appendChild(line);
      box.scrollTop = box.scrollHeight;
    }
  }

  logOnce(msg, color = "white") {
    if (msg !== this.lastLog) {
      this.lastLog = msg;
      this.log(msg, color);
    }
  }
}

export const SHIP_CONFIG = {
  speed: 0.2,
  rotationSpeed: 0.002,
  avoidanceRadius: 80,
  proximityRadius: 12,
  enableObservationPause: true
};
