// /assets/js/sky-widget.js
// Mini-météo pour theme-sky (Open-Meteo, sans clé)

const SKY_STORAGE_KEY = 'cm_sky_widget_v1';
const SKY_CACHE_MS = 15 * 60 * 1000;

let aborter = null;

export function initSkyWidget() {
  const host = document.getElementById('widget-sky');
  if (!host) return;
  host.hidden = false;
  host.innerHTML = renderSkeleton();
  // essaie cache
  const cached = readCache();
  if (cached) render(host, cached);
  // lance rafraîchissement (position => fetch => render)
  bootstrapWeather(host);
}

export function destroySkyWidget() {
  const host = document.getElementById('widget-sky');
  if (host) {
    host.hidden = true;
    host.innerHTML = '';
  }
  if (aborter) {
    aborter.abort();
    aborter = null;
  }
}

/* ---------- Bootstrapping ---------- */
async function bootstrapWeather(host) {
  try {
    const loc = await getLocation();
    const data = await fetchWeather(loc);
    writeCache({ ts: Date.now(), loc, data });
    render(host, { loc, data });
  } catch (err) {
    renderError(host, err);
  }
}

/* ---------- Location: geoloc + fallback manual ---------- */

async function getLocation() {
  // 1) préfères une localisation sauvegardée par l’utilisateur
  const saved = readCache();
  if (saved?.loc && saved.loc.source === 'manual') return saved.loc;

  // 2) geoloc navigateur (si autorisée)
  const geo = await geolocate().catch(() => null);
  if (geo) return geo;

  // 3) fallback par défaut: Paris (évite un widget vide)
  return { name: 'Paris, FR', latitude: 48.8566, longitude: 2.3522, source: 'default' };
}

function geolocate() {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) return reject(new Error('Geolocation non disponible'));
    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          name: 'Ma position',
          latitude: +pos.coords.latitude.toFixed(4),
          longitude: +pos.coords.longitude.toFixed(4),
          source: 'geo'
        });
      },
      err => reject(err),
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );
  });
}

/* ---------- Fetch météo (Open-Meteo) ---------- */

async function fetchWeather(loc) {
  aborter?.abort();
  aborter = new AbortController();

  const params = new URLSearchParams({
    latitude: loc.latitude,
    longitude: loc.longitude,
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'wind_speed_10m'
    ].join(','),
    hourly: ['temperature_2m', 'weather_code', 'precipitation_probability'].join(','),
    daily: ['sunrise', 'sunset'].join(','),
    timezone: 'auto'
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url, { signal: aborter.signal });
  if (!res.ok) throw new Error('Erreur météo');
  return res.json();
}

/* ---------- Geocoding (saisie utilisateur) ---------- */
async function geocodeCity(q) {
  const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=1&language=fr&format=json`;
  const res = await fetch(url);
  if (!res.ok) throw new Error('Geocoding error');
  const json = await res.json();
  const g = json.results?.[0];
  if (!g) throw new Error('Ville introuvable');
  return {
    name: `${g.name}${g.country ? ', ' + g.country_code : ''}`,
    latitude: g.latitude,
    longitude: g.longitude,
    source: 'manual'
  };
}

/* ---------- Rendering ---------- */

function renderSkeleton() {
  return `
    <div class="sky-head">
      <div class="sky-loc">
        <span class="lname">—</span>
        <button type="button" class="change-loc" title="Changer de lieu">changer</button>
      </div>
      <div class="sky-upd" style="opacity:.75;font-size:.85rem;"></div>
    </div>
    <div class="sky-now">
      <svg class="sky-icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="5"/></svg>
      <div>
        <div class="sky-temp">—°</div>
        <div class="sky-cond">—</div>
      </div>
      <div class="sky-precip" style="text-align:right;font-size:.9rem;">—</div>
    </div>
    <div class="sky-meta">
      <div><div class="k">Ressenti</div><div class="v v-feel">—°</div></div>
      <div><div class="k">Humidité</div><div class="v v-hum">—%</div></div>
      <div><div class="k">Vent</div><div class="v v-wind">— km/h</div></div>
    </div>
    <div class="sky-sun">
      <div>Lever&nbsp;: <strong class="v v-sunrise">—</strong></div>
      <div>Coucher&nbsp;: <strong class="v v-sunset">—</strong></div>
    </div>
    <div class="sky-hourly"></div>
  `;
}

function render(host, payload) {
  const { loc, data } = payload;
  const $ = sel => host.querySelector(sel);

  // header
  $('.lname').textContent = loc.name;
  $('.sky-upd').textContent = 'MAJ ' + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // current
  const cur = data.current;
  const wcode = cur.weather_code;
  const cond = wcToText(wcode);
  $('.sky-temp').textContent = Math.round(cur.temperature_2m) + '°';
  $('.sky-cond').textContent = cond.label;
  $('.sky-precip').textContent = (cur.precipitation ?? 0) > 0 ? `${cur.precipitation} mm` : '—';
  $('.v-feel').textContent = Math.round(cur.apparent_temperature) + '°';
  $('.v-hum').textContent = Math.round(cur.relative_humidity_2m) + '%';
  $('.v-wind').textContent = Math.round(cur.wind_speed_10m) + ' km/h';

  // sunrise/sunset (jour 0)
  const sr = data.daily.sunrise?.[0], ss = data.daily.sunset?.[0];
  $('.v-sunrise').textContent = timeOnly(sr);
  $('.v-sunset').textContent = timeOnly(ss);

  // icon + fond
  const iconSvg = iconFor(wcode, isNight(cur.time, sr, ss));
  host.querySelector('.sky-icon').outerHTML = iconSvg;
  host.classList.remove('bg-day','bg-cloud','bg-rain','bg-night');
  host.classList.add(bgFor(wcode, isNight(cur.time, sr, ss)));

  // hourly 12 prochaines heures
  const h = data.hourly;
  const idxNow = h.time.findIndex(t => t >= cur.time);
  const end = Math.min(h.time.length, idxNow + 12);
  const cells = [];
  for (let i = idxNow; i < end; i++) {
    const t = h.time[i];
    const w = h.weather_code[i];
    const pp = h.precipitation_probability?.[i];
    const temp = Math.round(h.temperature_2m[i]);
    cells.push(`
      <div class="hcell">
        <div class="h">${hourOnly(t)}</div>
        ${iconFor(w, isNight(t, sr, ss)).replace('sky-icon','hi')}
        <div class="t">${temp}°</div>
        <div class="p" style="opacity:.8">${pp != null ? pp + '%' : ''}</div>
      </div>
    `);
  }
  host.querySelector('.sky-hourly').innerHTML = cells.join('');

  // changer la localisation
  host.querySelector('.change-loc')?.addEventListener('click', async () => {
    const q = prompt('Ville ou code postal :', loc.name || '');
    if (!q) return;
    try {
      const newLoc = await geocodeCity(q);
      const fresh = await fetchWeather(newLoc);
      const pack = { ts: Date.now(), loc: newLoc, data: fresh };
      writeCache(pack);
      render(host, pack);
    } catch (e) {
      alert('Ville introuvable.');
    }
  });
}

function renderError(host, err) {
  host.innerHTML = `
    <div style="display:flex;gap:.6rem;align-items:center;">
      <span>🌥️</span>
      <div>
        <div style="font-weight:600">Météo indisponible</div>
        <div style="opacity:.8;font-size:.9rem">${err?.message || 'Erreur inconnue'}</div>
        <button id="sky-retry" style="margin-top:.5rem">Réessayer</button>
      </div>
    </div>
  `;
  host.hidden = false;
  host.querySelector('#sky-retry')?.addEventListener('click', () => bootstrapWeather(host));
}

/* ---------- Helpers ---------- */

function writeCache(obj) {
  try { localStorage.setItem(SKY_STORAGE_KEY, JSON.stringify(obj)); } catch {}
}
function readCache() {
  try {
    const raw = localStorage.getItem(SKY_STORAGE_KEY);
    if (!raw) return null;
    const obj = JSON.parse(raw);
    if (!obj.ts || (Date.now() - obj.ts) > SKY_CACHE_MS) return null;
    return obj;
  } catch { return null; }
}

function timeOnly(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
function hourOnly(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString([], { hour: '2-digit' });
}
function isNight(iso, sunriseIso, sunsetIso) {
  const t = new Date(iso).getTime();
  const sr = sunriseIso ? new Date(sunriseIso).getTime() : null;
  const ss = sunsetIso ? new Date(sunsetIso).getTime() : null;
  if (sr == null || ss == null) return false;
  return (t < sr || t > ss);
}
function bgFor(code, night) {
  if (night) return 'bg-night';
  if ([51,53,55,61,63,65,66,67,80,81,82].includes(code)) return 'bg-rain';
  if ([1,2,3].includes(code)) return 'bg-cloud';
  return 'bg-day';
}
function wcToText(code) {
  // mapping simple Open-Meteo WMO
  const map = {
    0: 'Ciel clair',
    1: 'Principalement clair',
    2: 'Partiellement nuageux',
    3: 'Couvert',
    45: 'Brouillard',
    48: 'Brouillard givrant',
    51: 'Bruine faible', 53: 'Bruine', 55: 'Bruine forte',
    61: 'Pluie faible', 63: 'Pluie', 65: 'Pluie forte',
    66: 'Pluie verglaçante faible', 67: 'Pluie verglaçante',
    71: 'Neige faible', 73: 'Neige', 75: 'Neige forte',
    77: 'Grains de neige',
    80: 'Averses faibles', 81: 'Averses', 82: 'Averses fortes',
    85: 'Averses de neige faibles', 86: 'Averses de neige fortes',
    95: 'Orage', 96: 'Orage grêle', 99: 'Orage grêle fort'
  };
  return { code, label: map[code] || '—' };
}
function iconFor(code, night=false) {
  // icônes inline (SVG minimalistes) – zéro asset externe
  const sun = `<svg class="sky-icon" viewBox="0 0 24 24" aria-label="Soleil"><circle cx="12" cy="12" r="5" fill="currentColor"/><g stroke="currentColor" stroke-width="1.5"><line x1="12" y1="1" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="23"/><line x1="1" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="23" y2="12"/><line x1="4.2" y1="4.2" x2="6.3" y2="6.3"/><line x1="17.7" y1="17.7" x2="19.8" y2="19.8"/><line x1="17.7" y1="6.3" x2="19.8" y2="4.2"/><line x1="4.2" y1="19.8" x2="6.3" y2="17.7"/></g></svg>`;
  const moon = `<svg class="sky-icon" viewBox="0 0 24 24" aria-label="Lune"><path d="M21 12.5c-1.8 3.6-6.2 5.1-9.8 3.3A7.5 7.5 0 0 1 7 6.1 7.7 7.7 0 0 0 12.3 21c3.9 0 7.2-2.6 8.7-6.3z" fill="currentColor"/></svg>`;
  const cloud = `<svg class="sky-icon" viewBox="0 0 24 24" aria-label="Nuages"><path d="M7 18c-2.2 0-4-1.7-4-3.8S4.2 10.5 6.4 11a5.6 5.6 0 0 1 11 1.1h.6c2 0 3.6 1.5 3.6 3.3S20 19 18 19H7z" fill="currentColor"/></svg>`;
  const rain = `<svg class="sky-icon" viewBox="0 0 24 24" aria-label="Pluie"><path d="M7 14c-2.2 0-4-1.6-4-3.6S4.2 7 6.4 7.5A5.6 5.6 0 0 1 17.5 8H18c2 0 3.6 1.5 3.6 3.3S20 15 18 15H7z" fill="currentColor"/><g fill="currentColor" opacity=".9"><path d="M8 17l-1 3"/><path d="M12 17l-1 3"/><path d="M16 17l-1 3"/></g></svg>`;
  const storm = `<svg class="sky-icon" viewBox="0 0 24 24" aria-label="Orage"><path d="M7 13c-2.2 0-4-1.6-4-3.6S4.2 6 6.4 6.5A5.6 5.6 0 0 1 17.5 7H18c2 0 3.6 1.5 3.6 3.3S20 14 18 14H7z" fill="currentColor"/><path d="M12 14l-2 4h2l-1 4 3-5h-2l2-3z" fill="currentColor"/></svg>`;
  const snow = `<svg class="sky-icon" viewBox="0 0 24 24" aria-label="Neige"><path d="M7 13c-2.2 0-4-1.6-4-3.6S4.2 6 6.4 6.5A5.6 5.6 0 0 1 17.5 7H18c2 0 3.6 1.5 3.6 3.3S20 14 18 14H7z" fill="currentColor"/><g fill="currentColor" opacity=".95"><circle cx="9" cy="17.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="15" cy="17.5" r="1"/></g></svg>`;

  // map simple par code
  if (night) {
    if ([0].includes(code)) return moon;
  }
  if ([0].includes(code)) return sun;
  if ([1,2,3,45,48].includes(code)) return cloud;
  if ([51,53,55,61,63,65,66,67,80,81,82].includes(code)) return rain;
  if ([95,96,99].includes(code)) return storm;
  if ([71,73,75,77,85,86].includes(code)) return snow;
  return cloud;
}
