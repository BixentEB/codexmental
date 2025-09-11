// /assets/js/astro-hub.js
// Hub d’affichage "intro-astro" amélioré en carte 2 colonnes (données + visuel)
// S’active uniquement sur home.html dans #astro-container.
// Rend un renderer selon le thème effectif, sinon fallback texte animé existant.

import { getSunInfo } from '/assets/js/astro-solaire.js';
import { setCurrentAlertText, lancerIntroAstro } from '/assets/js/intro-astro.js';

// ========================== Utils ==========================
const isHome = () => document.body.classList.contains('home');
const container = () => document.getElementById('astro-container');
const introNode = () => document.getElementById('intro-astro');

// Thème effectif (sans casser ta logique globale)
const themeName = () => {
  const cls = [...document.body.classList];

  // (1) Si une classe theme-* explicite est présente (autre que theme-main), on la prend
  const explicit = cls.find(c => c.startsWith('theme-') && c !== 'theme-main');
  if (explicit) return explicit;

  // (2) Si on est en "theme-main", on résout via sources douces
  //     a) Query param ?theme=sky|solaire|lunaire|stellaire|galactique
  const qp = new URLSearchParams(location.search).get('theme');
  if (qp && ['sky','solaire','lunaire','stellaire','galactique'].includes(qp)) {
    return `theme-${qp}`;
  }

  //     b) Favori utilisateur: accepte cm_theme OU codexTheme (tes deux conventions possibles)
  const storedRaw =
    (localStorage.getItem('cm_theme') || localStorage.getItem('codexTheme') || '').trim();

  if (storedRaw) {
    // Autorise "theme-xxx" ou juste "xxx"
    if (storedRaw.startsWith('theme-')) return storedRaw;
    if (['sky','solaire','lunaire','stellaire','galactique'].includes(storedRaw)) {
      return `theme-${storedRaw}`;
    }
  }

  // (3) Défaut safe pour home si aucune info: sky
  return 'theme-sky';
};

function clearContainer() {
  const c = container();
  if (!c) return;
  // supprime toute carte rendue
  [...c.querySelectorAll('.astro-hub')].forEach(n => n.remove());
  // ré-affiche la ligne animée si elle existe
  if (introNode()) introNode().style.display = 'block';
}

function mountFrame(themeClass, titleLeft = '', titleRight = '') {
  const c = container();
  if (!c) return null;

  // cache la ligne animée (fallback toujours dispo si besoin)
  if (introNode()) introNode().style.display = 'none';

  const wrap = document.createElement('div');
  wrap.className = `astro-hub ${themeClass}`;
  wrap.innerHTML = `
    <div class="astro-col astro-data">
      ${titleLeft ? `<h3>${titleLeft}</h3>` : ''}
      <div class="astro-kv" id="astro-kv"></div>
    </div>
    <div class="astro-col astro-viz">
      ${titleRight ? `<h3 style="position:absolute; top:.6rem; left:.9rem;">${titleRight}</h3>` : ''}
      <div id="astro-viz-slot" style="width:100%; height:200px;"></div>
    </div>
    <div class="astro-foot" id="astro-foot"></div>
  `;
  c.appendChild(wrap);
  return {
    wrap,
    kv: wrap.querySelector('#astro-kv'),
    viz: wrap.querySelector('#astro-viz-slot'),
    foot: wrap.querySelector('#astro-foot')
  };
}

// Helpers météo
function wcToText(code) {
  const map = {
    0:'Ciel clair',1:'Principalement clair',2:'Partiellement nuageux',3:'Couvert',
    45:'Brouillard',48:'Brouillard givrant',
    51:'Bruine faible',53:'Bruine',55:'Bruine forte',
    61:'Pluie faible',63:'Pluie',65:'Pluie forte',
    66:'Pluie verglaçante faible',67:'Pluie verglaçante',
    71:'Neige faible',73:'Neige',75:'Neige forte',
    77:'Grains de neige',
    80:'Averses faibles',81:'Averses',82:'Averses fortes',
    85:'Averses de neige faibles',86:'Averses de neige fortes',
    95:'Orage',96:'Orage grêle',99:'Orage grêle fort'
  };
  return map[code] || '—';
}
function timeOnly(iso){ if(!iso) return '—'; return new Date(iso).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'}); }
function isNightISO(iso, sr, ss) { const t=+new Date(iso), a=sr?+new Date(sr):0, b=ss?+new Date(ss):0; return (a && b) ? (t<a || t>b) : false; }
function iconFor(code, night=false){
  const sun = `<svg viewBox="0 0 120 120" style="width:120px;height:120px"><circle cx="60" cy="60" r="26" fill="currentColor"/><g stroke="currentColor" stroke-width="4" stroke-linecap="round" opacity=".9"><line x1="60" y1="6" x2="60" y2="22"/><line x1="60" y1="98" x2="60" y2="114"/><line x1="6" y1="60" x2="22" y2="60"/><line x1="98" y1="60" x2="114" y2="60"/><line x1="24" y1="24" x2="34" y2="34"/><line x1="86" y1="86" x2="96" y2="96"/><line x1="86" y1="34" x2="96" y2="24"/><line x1="24" y1="96" x2="34" y2="86"/></g></svg>`;
  const moon = `<svg viewBox="0 0 120 120" style="width:120px;height:120px"><path d="M100 70c-9 18-31 25-49 16A38 38 0 0 1 36 30 39 39 0 0 0 60 108c20 0 37-13 40-38z" fill="currentColor"/></svg>`;
  const cloud = `<svg viewBox="0 0 160 120" style="width:160px;height:120px"><path d="M48 92c-20 0-36-14-36-32 0-16 12-29 28-31a40 40 0 0 1 78 8h4c16 0 28 12 28 26s-14 29-30 29H48z" fill="currentColor" opacity=".9"/></svg>`;
  const rain = `<svg viewBox="0 0 160 140" style="width:160px;height:120px"><path d="M48 80c-20 0-36-14-36-32 0-16 12-29 28-31a40 40 0 0 1 78 8h4c16 0 28 12 28 26s-14 29-30 29H48z" fill="currentColor" opacity=".9"/><g fill="currentColor" opacity=".95"><path d="M60 100 l-6 18"/><path d="M90 100 l-6 18"/><path d="M120 100 l-6 18"/></g></svg>`;
  const snow = `<svg viewBox="0 0 160 140" style="width:160px;height:120px"><path d="M48 80c-20 0-36-14-36-32 0-16 12-29 28-31a40 40 0 0 1 78 8h4c16 0 28 12 28 26s-14 29-30 29H48z" fill="currentColor" opacity=".9"/><g fill="currentColor" opacity=".95"><circle cx="72" cy="106" r="4"/><circle cx="96" cy="112" r="4"/><circle cx="120" cy="106" r="4"/></g></svg>`;
  const storm = `<svg viewBox="0 0 160 140" style="width:160px;height:120px"><path d="M48 80c-20 0-36-14-36-32 0-16 12-29 28-31a40 40 0 0 1 78 8h4c16 0 28 12 28 26s-14 29-30 29H48z" fill="currentColor" opacity=".9"/><path d="M92 96l-12 20h12l-6 20 18-26h-12l10-14z" fill="currentColor"/></svg>`;
  if (night && (code===0)) return moon;
  if ([0].includes(code)) return sun;
  if ([1,2,3,45,48].includes(code)) return cloud;
  if ([51,53,55,61,63,65,66,67,80,81,82].includes(code)) return rain;
  if ([71,73,75,77,85,86].includes(code)) return snow;
  if ([95,96,99].includes(code)) return storm;
  return cloud;
}

// ======================== Renderers ========================
const RENDERERS = new Map();

// --- SKY (météo locale) ---
RENDERERS.set('theme-sky', {
  name: 'sky',
  async render() {
    const frame = mountFrame('is-sky', 'Météo locale', 'Ciel');
    if (!frame) return;

    // localisation (geo -> fallback Paris)
    const loc = await (async () => {
      try {
        const p = await new Promise((res, rej) => {
          if (!navigator.geolocation) return rej();
          navigator.geolocation.getCurrentPosition(res, rej, { timeout:8000, maximumAge:10*60*1000 });
        });
        return { name: 'Ma position', lat: +p.coords.latitude.toFixed(4), lon: +p.coords.longitude.toFixed(4) };
      } catch {
        return { name: 'Paris, FR', lat: 48.8566, lon: 2.3522 };
      }
    })();

    // Open-Meteo
    const url = new URL('https://api.open-meteo.com/v1/forecast');
    url.searchParams.set('latitude', loc.lat);
    url.searchParams.set('longitude', loc.lon);
    url.searchParams.set('current', 'temperature_2m,apparent_temperature,relative_humidity_2m,precipitation,weather_code,wind_speed_10m');
    url.searchParams.set('daily', 'sunrise,sunset');
    url.searchParams.set('timezone', 'auto');

    const res = await fetch(url.toString());
    const data = await res.json();

    const cur = data.current;
    const daily = data.daily;
    const wtxt = wcToText(cur.weather_code);

    // colonne gauche (données)
    frame.kv.innerHTML = [
      ['Lieu', loc.name],
      ['Temp.', `${Math.round(cur.temperature_2m)}°`],
      ['Ressenti', `${Math.round(cur.apparent_temperature)}°`],
      ['Humidité', `${Math.round(cur.relative_humidity_2m)}%`],
      ['Vent', `${Math.round(cur.wind_speed_10m)} km/h`],
      ['Précip.', cur.precipitation ? `${cur.precipitation} mm` : '—'],
      ['Ciel', wtxt]
    ].map(([k,v]) => `<div class="k">${k}</div><div class="v">${v}</div>`).join('');

    // colonne droite (viz)
    frame.viz.innerHTML = iconFor(cur.weather_code, isNightISO(cur.time, daily.sunrise?.[0], daily.sunset?.[0]));

    // pied
    frame.foot.textContent = `MAJ ${new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}`;

    // court message pour fallback animé si la carte est masquée
    setCurrentAlertText(`${wtxt} • ${Math.round(cur.temperature_2m)}° • Lever ${timeOnly(daily.sunrise?.[0])} • Coucher ${timeOnly(daily.sunset?.[0])}`);
  },
  destroy() {}
});

// --- SOLAIRE (infos locales + mini-arc) ---
RENDERERS.set('theme-solaire', {
  name: 'solar',
  async render() {
    const frame = mountFrame('is-solar', 'Soleil (infos locales)', 'Position actuelle');
    if (!frame) return;

    const loc = { name:'Paris, FR', lat:48.8566, lon:2.3522 }; // pas besoin d’une grande précision ici
    const txt = getSunInfo(new Date(), loc.lat, loc.lon);

    const lines = txt.split('\n');
    const alt = (lines[0].match(/à ([\d.,-]+)° d'altitude/)||[])[1] || '—';
    const azi = (lines[0].match(/et ([\d.,-]+)° d'azimut/)||[])[1] || '—';
    const lever = (lines.find(l=>l.includes('Lever'))||'').replace('🌅 ','') || '—';
    const coucher = (lines.find(l=>l.includes('Coucher'))||'').replace('🌇 ','') || '—';

    frame.kv.innerHTML = [
      ['Altitude', `${alt}°`],
      ['Azimut', `${azi}°`],
      ['Lever', lever.replace('Prochain ', '')],
      ['Coucher', coucher.replace('Prochain ', '')],
    ].map(([k,v]) => `<div class="k">${k}</div><div class="v">${v}</div>`).join('');

    // Viz : arc de course solaire (SVG)
    frame.viz.innerHTML = `
      <svg viewBox="0 0 260 160" style="width:100%;height:160px">
        <defs>
          <linearGradient id="sunGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity=".9"/>
            <stop offset="100%" stop-color="currentColor" stop-opacity=".2"/>
          </linearGradient>
        </defs>
        <path d="M20 120 A110 110 0 0 1 240 120" fill="none" stroke="url(#sunGrad)" stroke-width="6" />
        <circle id="sunDot" cx="130" cy="60" r="10" fill="currentColor">
          <animate attributeName="cx" dur="8s" repeatCount="indefinite" values="20;130;240;130;20"/>
          <animate attributeName="cy" dur="8s" repeatCount="indefinite" values="120;20;120;20;120"/>
        </circle>
      </svg>
    `;

    frame.foot.textContent = 'Position & horaires basés sur SunCalc';
    setCurrentAlertText(lines.join(' • '));
  },
  destroy() {}
});

// ========================== Boot ==========================
function run() {
  if (!isHome() || !container()) return;
  console.debug?.('[astro-hub] boot', { isHome: isHome(), hasContainer: !!container() });

  const apply = () => {
    clearContainer();
    const t = themeName();
    const renderer = t && RENDERERS.get(t);
    console.debug?.('[astro-hub] theme:', t, 'renderer:', !!renderer);

    if (renderer) {
      renderer.render().catch(err => {
        console.warn('[astro-hub] renderer error', err);
        // fallback texte animé
        if (introNode()) {
          introNode().style.display = 'block';
          lancerIntroAstro(t?.replace('theme-','') ?? 'general');
        }
      });
    } else {
      // pas de renderer => fallback animé existant
      if (introNode()) {
        introNode().style.display = 'block';
        lancerIntroAstro(t?.replace('theme-','') ?? 'general');
      }
    }
  };

  apply();

  // Observe les changements de classe sur <body> (bascule de thème)
  const mo = new MutationObserver(apply);
  mo.observe(document.body, { attributes: true, attributeFilter: ['class'] });
}

document.addEventListener('DOMContentLoaded', run);
