
// ship-stars.js — module pour étoiles galactiques statiques + parallaxe légère

export class Starfield {
  constructor(width, height, numStatic = 100, numParallax = 40) {
    this.width = width;
    this.height = height;
    this.staticStars = [];
    this.parallaxStars = [];

    for (let i = 0; i < numStatic; i++) {
      this.staticStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        alpha: 0.05 + Math.random() * 0.2,
        size: Math.random() * 1.2 + 0.3,
        color: ['#ffffff', '#88ccff', '#ccddff'][Math.floor(Math.random() * 3)]
      });
    }

    for (let i = 0; i < numParallax; i++) {
      this.parallaxStars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.04,
        vy: (Math.random() - 0.5) * 0.04,
        alpha: 0.08 + Math.random() * 0.3,
        size: Math.random() * 1.8 + 0.5,
        color: ['#ffffff', '#88ccff', '#ccccff', '#e6f2ff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  update() {
    this.parallaxStars.forEach(star => {
      star.x += star.vx;
      star.y += star.vy;

      if (star.x < 0) star.x = this.width;
      if (star.x > this.width) star.x = 0;
      if (star.y < 0) star.y = this.height;
      if (star.y > this.height) star.y = 0;
    });
  }

  draw(ctx) {
    this.staticStars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${this.hexToRgb(star.color)},${star.alpha})`;
      ctx.fill();
    });

    this.parallaxStars.forEach(star => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, 2 * Math.PI);
      ctx.fillStyle = `rgba(${this.hexToRgb(star.color)},${star.alpha})`;
      ctx.fill();
    });
  }

  hexToRgb(hex) {
    const bigint = parseInt(hex.replace("#", ""), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `${r},${g},${b}`;
  }
}
