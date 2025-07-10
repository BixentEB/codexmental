// ========================================================
// intro-astro.js – Message animé d’introduction + alerte astro
// Fichiers liés :
//   - astro-lunaire.js : fournit les infos précises de la lune via SunCalc
//   - events-astro-2025.json : liste des événements spéciaux
// Utilisé uniquement pour l'affichage textuel, sans lien avec le widget SVG
// ========================================================

import { IDS } from '/assets/js/ids.js';
import { getFullMoonInfo } from '/assets/js/astro-lunaire.js';

export let currentAlertText = "";
let isTyping = false;

/**
 * Vérifie si une date correspond à aujourd’hui
 * @param {string} dateStr - Date au format ISO
 * @returns {boolean}
 */
export function isToday(dateStr) {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

/**
 * Filtre les événements astronomiques du jour et prépare le message
 * @param {Array} data - Liste des événements astronomiques
 */
export function afficherNoteAstro(data) {
  const bloc = document.getElementById(IDS.ASTRO);
  if (!bloc) return;

  if (document.body.classList.contains('theme-lunaire')) {
    // 🌙 Thème lunaire => uniquement SunCalc complet
    currentAlertText = getFullMoonInfo();
  } else {
    // Les autres thèmes => événements JSON
    const todayAlerts = data.filter(ev => isToday(ev.date));

    if (todayAlerts.length > 0) {
      const eventsText = todayAlerts.map(ev => ev.message).join(' • ');
      currentAlertText = eventsText;
    } else {
      currentAlertText = '🪐 Aucune donnée à ce jour.';
    }
  }

  lancerIntroAstro();
}

/**
 * Animation machine à écrire
 */
export function typewriter(element, text, speed = 45, callback) {
  if (!element || typeof text !== 'string') return;

  element.innerHTML = '';
  let i = 0;

  const interval = setInterval(() => {
    const char = document.createTextNode(text.charAt(i));
    element.appendChild(char);
    i++;
    if (i >= text.length) {
      clearInterval(interval);
      if (callback) callback();
    }
  }, speed);
}

/**
 * Lance le message d’intro animé
 */
export function lancerIntroAstro() {
  const bloc = document.getElementById(IDS.ASTRO);
  if (!bloc || isTyping) return;
  isTyping = true;

  bloc.textContent = '';

  const messages = [
    { icon: '🛰️', text: 'Connexion au satellite Codex établie.' },
    { icon: '🌌', text: 'Balayage du ciel nocturne...' },
    { icon: '🌙', text: 'Réception des données lunaires...' },
    { icon: '📡', text: 'Synchronisation orbitale en cours...' },
    { icon: '🪐', text: 'Décodage des messages interstellaires...' },
    { icon: '🔭', text: 'Connexion à l’observatoire quantique...' },
    { icon: '💫', text: 'Analyse des anomalies cosmiques...' },
    { icon: '🔮', text: 'Accès aux archives célestes...' },
    { icon: '🌟', text: 'Mise à jour du protocole astrologique...' }
  ];

  const entry = messages[Math.floor(Math.random() * messages.length)];

  typewriter(bloc, `${entry.icon} ${entry.text}`, 45, () => {
    bloc.textContent += ' ';

    const cursorSpan = document.createElement('span');
    cursorSpan.className = 'cursor-blink';
    bloc.appendChild(cursorSpan);

    setTimeout(() => {
      cursorSpan.remove();

      const messageFinal = currentAlertText?.trim()
        ? currentAlertText
        : '🪐 Aucune donnée à ce jour.';

      bloc.textContent += ' ';
      typewriter(bloc, messageFinal, 45, () => {
        isTyping = false;
        setTimeout(lancerIntroAstro, 10000);
      });
    }, 2000);
  });
}
