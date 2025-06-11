// ========================================================
// badge-astro.js – Affiche le badge si événement du jour
// ========================================================

import { isToday } from '/assets/js/intro-astro.js'; // Réutilisation de la fonction utilitaire

export function activerBadgeAstro() {
  fetch('/arc/events-astro-2025.json')
    .then(res => res.json())
    .then(data => {
      // Filtrer les événements correspondant à aujourd’hui
      const todayEvents = data.filter(ev => isToday(ev.date));

      if (todayEvents.length > 0) {
        const badge = document.getElementById('badge-astro');
        if (badge) {
          badge.textContent = todayEvents.map(ev => ev.message).join(' • ');
          badge.style.display = 'block';
        }
      }
    })
    .catch(err => console.error("❌ Erreur chargement astro.json (badge)", err));
}
