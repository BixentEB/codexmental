// === 🌌 CANVAS UNIFIÉ : STELLAIRE & GALACTIQUE ===More actions
let canvas, ctx, rafId;
let particles = [];

function setupCanvas() {
  canvas = document.getElementById("theme-canvas");
  if (!canvas) return;
  ctx = canvas.getContext("2d");
  canvas.style.opacity = '0';
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function initParticles(type = 'stars', count = 120) {
  particles = Array.from({ length: count }, () => {
    const r = (type === 'dust') ? Math.random() * 3 + 1.2 : Math.random() * 1.5 + 0.3;
    return {
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r,
      alpha: Math.random(),
      delta: (Math.random() * 0.02) * (Math.random() < 0.5 ? 1 : -1),
      type
    };
  });
}

function animateParticles() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  for (let p of particles) {
    p.alpha += p.delta;
    if (p.alpha <= 0 || p.alpha >= 1) p.delta *= -1;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, 2 * Math.PI);
    if (p.type === 'dust') {
      const hue = 240 + Math.random() * 40;
      ctx.shadowBlur = 8;
      ctx.shadowColor = `rgba(180, 130, 255, ${p.alpha})`;
      ctx.fillStyle = `hsla(${hue}, 100%, 85%, ${p.alpha})`;
    } else {
      ctx.shadowBlur = 0;
      ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha})`;
    }
    ctx.fill();
  }
  rafId = requestAnimationFrame(animateParticles);
}

function stopParticles() {
  if (rafId) cancelAnimationFrame(rafId);
  if (ctx && canvas) ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.shadowBlur = 0;
  particles = [];
  if (canvas) canvas.style.opacity = '0';
}

// === 🌙 GESTION DU WIDGET LUNAIRE ===
function getMoonPhaseIndex(date = new Date()) {
  const base = new Date('2001-01-01T00:00:00Z');
  const diff = (date - base) / (1000 * 60 * 60 * 24);
  const lunations = 0.20439731 + diff * 0.03386319269;
  return Math.floor((lunations % 1) * 8);
}

function updateLunarWidget(theme) {
  const existing = document.getElementById('lune-widget');
  if (existing) existing.remove();

  if (theme === 'theme-lunaire') {
    const phase = getMoonPhaseIndex();
    const lune = document.createElement('div');
    lune.id = 'lune-widget';
    lune.style.backgroundImage = `url('/img/lune/lune-${phase}.png')`;
    document.body.appendChild(lune);
    followScrollLune();
  }
}

function followScrollLune() {
  const lune = document.getElementById('lune-widget');
  if (!lune) return;
  const padding = 10;
  const scrollTop = window.scrollY;
  const windowHeight = window.innerHeight;
  const luneHeight = lune.offsetHeight;
  const idealTop = scrollTop + windowHeight - luneHeight - padding;
  lune.style.left = 'unset';
  lune.style.right = `${padding}px`;
  lune.style.top = `${idealTop}px`;
}

// === 🎨 THÈME ===
function setTheme(theme) {
  document.body.className = theme;
  localStorage.setItem('codexTheme', theme);
  stopParticles();
  updateLunarWidget(theme);
  if (!canvas) return;
  if (theme === 'theme-stellaire') {
    setupCanvas();
    initParticles('stars', 120);
    canvas.style.opacity = '1';
    animateParticles();
  } else if (theme === 'theme-galactique') {
    setupCanvas();
    initParticles('dust', 100);
    canvas.style.opacity = '1';
    animateParticles();
  }
}

// === 🧩 INJECTION MENU / FOOTER ===
function injectPartial(id, url) {
  const target = document.getElementById(id);
  if (!target) return;
  fetch(url)
    .then(res => res.ok ? res.text() : Promise.reject(`Erreur chargement ${url}`))
    .then(html => {
      target.innerHTML = html;
      if (id === 'menu-placeholder') {
        highlightActiveLink();
        setTimeout(() => {
          const toggleBtn = document.getElementById("menu-toggle");
          const menu = document.getElementById("mobile-menu");
          if (toggleBtn && menu) {
            toggleBtn.addEventListener("click", () => {
              menu.classList.toggle("open");
            });
            document.addEventListener("click", (e) => {
              if (!menu.contains(e.target) && e.target !== toggleBtn) {
                menu.classList.remove("open");
              }
            });
          }
        }, 100);
      }
    })
    .catch(err => console.error("❌ Injection échouée :", err));
}

// === 🌐 LIEN ACTIF DANS LE MENU ===
function highlightActiveLink() {
  const currentPath = location.pathname.replace(/\/+$/, '');
  document.querySelectorAll("nav a").forEach(link => {
    const href = link.getAttribute("href");
    const linkPath = new URL(href, window.location.origin).pathname.replace(/\/+$/, '');
    if (linkPath === currentPath) link.classList.add("active");
  });
}

// === ⬆️ BOUTON RETOUR HAUT ===
function setupScrollButton() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;
  btn.style.display = 'none';
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 100 ? 'block' : 'none';
  });
}

// === 🚀 INITIALISATION ===
window.addEventListener('DOMContentLoaded', () => {
  canvas = document.getElementById('theme-canvas');
  if (canvas) {
    ctx = canvas.getContext('2d');
    canvas.style.opacity = '0';
  }

  const savedTheme = localStorage.getItem('codexTheme') || 'theme-stellaire';
  setTheme(savedTheme);
  setupScrollButton();
  injectPartial('menu-placeholder', '/menu.html');
  injectPartial('footer-placeholder', '/footer.html');

  // Sécurité (si menu mobile était déjà présent au chargement, ex. sur index.html)
  const toggleBtn = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");
  if (toggleBtn && menu) {
    toggleBtn.addEventListener("click", () => {
      menu.classList.toggle("open");
    });
    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== toggleBtn) {
        menu.classList.remove("open");
      }
    });
  }

  if (savedTheme === 'theme-lunaire') {
    window.addEventListener('scroll', followScrollLune);
    window.addEventListener('resize', followScrollLune);
  }

  lancerIntroAstro();
});

// === 🌠 ASTRONOMIE & INTRO ===
function isToday(dateStr) {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

function afficherNoteAstro(data) {
  const bloc = document.getElementById('astro-info');
  if (!bloc) return;

  const todayAlerts = data.filter(ev => isToday(ev.date));
  let alertText = "";

  if (todayAlerts.length > 0) {
    alertText = todayAlerts.map(ev => ev.message).join(' • ');
    todayAlerts.forEach(ev => {
      if (ev.themeEffect) lancerAnimation(ev.themeEffect);
    });
  } else {
    alertText = "Aucun événement astronomique aujourd’hui.";
  }

  lancerIntroAstro(alertText);
}

// 💡 Cette fonction remplace le fetch unique
function chargerEtAfficherAstro() {
  fetch('./arc/events-astro-2025.json')
    .then(res => res.json())
    .then(data => afficherNoteAstro(data))
    .then(data => {
      const todayAlerts = data.filter(ev => isToday(ev.date));
      let alertText = "";

      if (todayAlerts.length > 0) {
        alertText = todayAlerts.map(ev => ev.message).join(' • ');
        todayAlerts.forEach(ev => {
          if (ev.themeEffect) lancerAnimation(ev.themeEffect);
        });
      } else {
        alertText = "Aucun événement astronomique aujourd’hui.";
      }

      lancerIntroAstro(alertText);
    })
    .catch(err => console.error("Erreur chargement astro.json", err));
}

function lancerIntroAstro(alertText = "") {
  const bloc = document.getElementById('astro-info');
  if (!bloc) return;

  const messages = [
    { icon: '🛰️', text: 'Connexion au satellite Codex établie.' },
    { icon: '🌌', text: 'Balayage du ciel nocturne...' },
    { icon: '🌙', text: 'Réception des données lunaires...' },
    { icon: '📡', text: 'Synchronisation orbitale en cours...' },
    { icon: '🪐', text: 'Décodage des messages interstellaires...' },
    { icon: '🔭', text: 'Connexion à l’observatoire quantique...' },
    { icon: '💫', text: 'Analyse des anomalies cosmiques...' },
    { icon: '📁', text: 'Accès aux archives célestes...' },
    { icon: '🔌', text: 'Mise à jour du protocole astrologique...' }
  ];

  const entry = messages[Math.floor(Math.random() * messages.length)];
  let i = 0;
  bloc.textContent = entry.icon;
  let clignote = true;

  const clignoteInterval = setInterval(() => {
    bloc.textContent = clignote ? entry.icon : '';
    clignote = !clignote;
  }, 400);

  setTimeout(() => {
    clearInterval(clignoteInterval);
    bloc.textContent = '';
    const typer = setInterval(() => {
      bloc.textContent += entry.text.charAt(i);
      i++;
      if (i === entry.text.length) {
        clearInterval(typer);
        bloc.textContent += ' ' + alertText;

        // ✅ Et maintenant on relance tout le fetch après délai
        // 🔁 Reboucle complète après 10s
        setTimeout(() => {
          chargerEtAfficherAstro(); // 🔁 pas juste la boucle
          chargerEtAfficherAstro();
        }, 10000);
      }
    }, 45);
  }, 2000);
}

// 👇 Lancement initial
// 🚀 Démarrage initial
chargerEtAfficherAstro();
