// /assets/js/widgets/solaire.adapter.js
import { getSunInfo } from '/assets/js/astro-solaire.js';

export default {
  id: 'theme-solaire',
  titleLeft: 'Soleil (infos locales)',
  titleRight: 'Position actuelle',

  async mountData(el) {
    const txt = getSunInfo(new Date(), 48.8566, 2.3522);
    if (!txt) return false;
    const lines = txt.split('\n');
    const alt = (lines[0].match(/à ([\\d.,-]+)° d'altitude/)||[])[1] || '—';
    const azi = (lines[0].match(/et ([\\d.,-]+)° d'azimut/)||[])[1] || '—';
    const lever = (lines.find(l=>l.includes('Lever'))||'').replace('🌅 ','').replace('Prochain ','') || '—';
    const coucher = (lines.find(l=>l.includes('Coucher'))||'').replace('🌇 ','').replace('Prochain ','') || '—';

    el.innerHTML = `
      <div class="astro-kv">
        <div class="k">Altitude</div><div class="v">${alt}°</div>
        <div class="k">Azimut</div><div class="v">${azi}°</div>
        <div class="k">Lever</div><div class="v">${lever}</div>
        <div class="k">Coucher</div><div class="v">${coucher}</div>
      </div>`;
    return true;
  },

  async mountViz(el) {
    el.innerHTML = `
      <svg viewBox="0 0 260 160" style="width:100%;height:160px">
        <defs>
          <linearGradient id="sunGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stop-color="currentColor" stop-opacity=".9"/>
            <stop offset="100%" stop-color="currentColor" stop-opacity=".2"/>
          </linearGradient>
        </defs>
        <path d="M20 120 A110 110 0 0 1 240 120" fill="none" stroke="url(#sunGrad)" stroke-width="6" />
        <circle cx="130" cy="60" r="10" fill="currentColor">
          <animate attributeName="cx" dur="8s" repeatCount="indefinite" values="20;130;240;130;20"/>
          <animate attributeName="cy" dur="8s" repeatCount="indefinite" values="120;20;120;20;120"/>
        </circle>
      </svg>`;
    return true;
  }
};
