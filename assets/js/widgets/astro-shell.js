// /assets/js/widgets/astro-shell.js
import * as Sky from '/assets/js/widgets/adapters/sky.adapter.js';
import * as Solaire from '/assets/js/widgets/adapters/solaire.adapter.js';
import * as Lunaire from '/assets/js/widgets/adapters/lunaire.adapter.js';

const REGISTRY = { sky: Sky, solaire: Solaire, lunaire: Lunaire };

const $ = (s, r=document)=> r.querySelector(s);

function detectTheme(){
  const b = document.body;
  const eff = b.dataset?.effectiveTheme || '';
  const has = c => b.classList.contains(c);

  if (has('theme-main')){
    if (eff.includes('sky')) return 'sky';
    if (eff.includes('solaire')) return 'solaire';
    if (eff.includes('lunaire')) return 'lunaire';
    if (eff.includes('stellaire') || eff.includes('galactique')) return 'other';
    return 'sky';
  }
  if (has('theme-sky')) return 'sky';
  if (has('theme-solaire')) return 'solaire';
  if (has('theme-lunaire')) return 'lunaire';
  if (has('theme-stellaire') || has('theme-galactique')) return 'other';
  return '';
}

const Shell = {
  root: null,
  current: null,
  init(){
    this.root = $('#astro-shell');
    if(!this.root) return;

    // structure minimaliste (2 slots)
    this.root.innerHTML = `
      <div class="aw-wrap" style="display:none">
        <div class="aw-box aw-data" aria-live="polite"></div>
        <div class="aw-box aw-viz" aria-hidden="false"></div>
      </div>
      <div class="aw-meta" style="display:none">
        <small class="aw-status">Prêt</small><span class="aw-sep">•</span>
        <time class="aw-time"></time>
      </div>
    `;

    this.observeTheme();
    this.tickTime();
    // activation initiale
    this.applyTheme(detectTheme());
  },

  observeTheme(){
    const mo = new MutationObserver(()=> {
      const t = detectTheme();
      if(!t || t === this.current) return;
      this.applyTheme(t);
    });
    mo.observe(document.body, {attributes:true, attributeFilter:['class','data-effective-theme']});
  },

  async applyTheme(theme){
    this.current = theme;
    if(!this.root) return;

    // cartes supportées
    if(theme === 'sky' || theme === 'solaire' || theme === 'lunaire'){
      this.show(true);
      await this.render(theme);
      this.status('OK');
      return;
    }

    // autres thèmes ou inconnu -> masquer le shell pour laisser vivre le fallback
    this.show(false);
  },

  async render(theme){
    const adapter = REGISTRY[theme];
    if(!adapter){ this.fallback('Adapter manquant'); return; }

    try{
      this.status('Chargement…');
      const data = await (adapter.getData?.(this) ?? {});
      const dataHTML = adapter.renderData?.(data, this) || '';
      const vizHTML = adapter.renderViz?.(data, this) || '';

      $('.aw-data', this.root).innerHTML = dataHTML;
      $('.aw-viz',  this.root).innerHTML = vizHTML;
    }catch(err){
      console.warn('[astro-shell] erreur', err);
      this.fallback('Données indisponibles');
    }
  },

  show(v){
    $('.aw-wrap', this.root).style.display = v ? '' : 'none';
    $('.aw-meta', this.root).style.display = v ? '' : 'none';
  },

  status(msg){
    const s = $('.aw-status', this.root);
    if(s) s.textContent = msg;
  },

  tickTime(){
    const t = $('.aw-time', this.root);
    if(!t) return;
    const upd = ()=> t.textContent = new Date().toLocaleString();
    upd(); setInterval(upd, 15_000);
  },

  fallback(reason=''){
    $('.aw-data', this.root).innerHTML = `<div style="opacity:.8">Mode simplifié. ${reason}</div>`;
    $('.aw-viz', this.root).innerHTML = `
      <svg viewBox="0 0 360 150" aria-hidden="true">
        <defs>
          <radialGradient id="awPulse" cx="50%" cy="50%">
            <stop offset="0%" stop-color="#fff" stop-opacity=".35"/>
            <stop offset="100%" stop-color="#fff" stop-opacity="0"/>
          </radialGradient>
        </defs>
        <circle cx="180" cy="75" r="28" fill="url(#awPulse)">
          <animate attributeName="r" values="20;34;20" dur="4s" repeatCount="indefinite"/>
          <animate attributeName="opacity" values=".7;.25;.7" dur="4s" repeatCount="indefinite"/>
        </circle>
      </svg>
    `;
    this.status('Fallback actif');
  }
};

window.addEventListener('DOMContentLoaded', ()=> Shell.init());
