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
    this.lastAvoid = 0;
    this.lastObserved = 0;
    this.lastLog = "";

    this.target = null;
    this.following = null;
    this.followUntil = 0;
    this.activeLogs = [];
  }

  update(objects, sunCenter) {
    const now = Date.now();

    if (this.following && now < this.followUntil) {
      const { obj } = this.following;
      const ox = this.center.x + Math.cos(obj.angle) * obj.r;
      const oy = this.center.y + Math.sin(obj.angle) * obj.r;
      this.x = ox + Math.cos(obj.angle + Math.PI / 2) * 10;
      this.y = oy + Math.sin(obj.angle + Math.PI / 2) * 10;
      this._updateTrail();
      return;
    }

    if (this.following && now >= this.followUntil) {
      this._fadeOutLogs();
      this.following = null;
    }

    if (now < this.pausedUntil) return;

    const dx = this.x - sunCenter.x;
    const dy = this.y - sunCenter.y;
    const distSun = Math.sqrt(dx * dx + dy * dy);
    if (distSun < this.avoidanceRadius && now - this.lastAvoid > 5000) {
      this.lastAvoid = now;
      const away = Math.atan2(dy, dx);
      this.angle = this.angle * 0.95 + away * 0.05;
      this.logOnce("⚠️ Évitement du Soleil", "yellow");
    }

    const sorted = objects
      .map(o => ({ obj: o, dist: this._distToObj(o) }))
      .sort((a, b) => a.dist - b.dist)
      .slice(0, 3);
    const chosen = sorted[Math.floor(Math.random() * sorted.length)];

    if (chosen && chosen.dist < this.proximityRadius + 4 && now - this.lastObserved > 6000) {
      this.lastObserved = now;
      const name = chosen.obj.label || chosen.obj.name || "Objet inconnu";
      const ox = this.center.x + Math.cos(chosen.obj.angle) * chosen.obj.r;
      const oy = this.center.y + Math.sin(chosen.obj.angle) * chosen.obj.r;

      this.following = { obj: chosen.obj };
      this.followUntil = now + 10000;

      this.logTitle(`🛰️ MISSION : Observation de ${name}`);
      this.logRandom("mission");
      return;
    }

    if (chosen.dist > 600 && now - this.lastObserved > 5000) {
      if (Math.random() < 0.5) {
        this.pausedUntil = now + 4000;
        this.logOnce("⏸️ Pause stationnaire", "gray");
      } else {
        this.angle += 0.005;
        this.x = sunCenter.x + Math.cos(this.angle) * 140;
        this.y = sunCenter.y + Math.sin(this.angle) * 140;
        this._updateTrail();
        this.logOnce("🌀 Patrouille orbitale (standby)", "gray");
      }
      return;
    }

    this.angle += this.rotationSpeed;
    this.x += Math.cos(this.angle) * this.speed;
    this.y += Math.sin(this.angle) * this.speed;

    const W = this.center.x * 2;
    const H = this.center.y * 2;
    if (this.x < 0 || this.x > W) this.angle = Math.PI - this.angle;
    if (this.y < 0 || this.y > H) this.angle = -this.angle;

    this._updateTrail();
  }

  _updateTrail() {
    this.trail.push({ x: this.x, y: this.y, alpha: 1 });
    if (this.trail.length > 100) this.trail.shift();
    for (const pt of this.trail) pt.alpha *= 0.94;
  }

  _distToObj(obj) {
    const ox = this.center.x + Math.cos(obj.angle) * obj.r;
    const oy = this.center.y + Math.sin(obj.angle) * obj.r;
    return Math.sqrt((this.x - ox) ** 2 + (this.y - oy) ** 2);
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

  log(msg, color = "white") {
    console.log(`[Vaisseau] ${msg}`);
    const box = document.getElementById('info-missions');
    if (box) {
      const line = document.createElement('div');
      line.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
      line.style.color = color;
      line.style.margin = "2px 0";
      box.appendChild(line);
      this.activeLogs.push(line);
      box.scrollTop = box.scrollHeight;
    }
  }

  logTitle(msg) {
    this.log(msg, "cyan");
  }

  logRandom(type = "mission") {
    const set = LOG_SCENARIOS[type];
    if (set && set.length > 0) {
      const r = set[Math.floor(Math.random() * set.length)];
      this.log(`→ ${r}`, "white");
    }
  }

  logOnce(msg, color = "white") {
    if (msg !== this.lastLog) {
      this.lastLog = msg;
      this.log(msg, color);
    }
  }

  _fadeOutLogs() {
    this.activeLogs.forEach((line, i) => {
      setTimeout(() => line.classList.add("fade-out"), 1000 + i * 600);
      setTimeout(() => line.remove(), 5000 + i * 600);
    });
    this.activeLogs = [];
  }

  onClick(x, y) {
    const dist = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
    if (dist <= 10) {
      this.log("🛸 Vaisseau sélectionné !", "white");
      return true;
    }
    return false;
  }
}

export const SHIP_CONFIG = {
  speed: 0.6,
  rotationSpeed: 0.01,
  avoidanceRadius: 80,
  proximityRadius: 14,
  enableObservationPause: true
};

export const LOG_SCENARIOS = {
  mission: [
    "Analyse spectrographique en cours...",
    "Activation du scanner magnétique.",
    "Cartographie topologique temporaire.",
    "Mesure du rayonnement cosmique.",
    "Alignement avec le pôle nord magnétique.",
    "Synchronisation des balises orbitales."
  ],
  ravitaillement: [
    "Connexion au réservoir orbital...",
    "Transfert de carburant cryogénique.",
    "Révision du bouclier thermique.",
    "Vidange de la capsule de survie.",
    "Recalibrage des capteurs de flux."
  ]
};
