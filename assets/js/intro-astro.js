// ========================================================
// intro-astro.js – Message animé d’introduction + alerte astro
// ========================================================

import { IDS } from '/assets/js/ids.js';

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

  const todayAlerts = data.filter(ev => isToday(ev.date));

  if (todayAlerts.length > 0) {
    currentAlertText = todayAlerts.map(ev => ev.message).join(' • ');
    todayAlerts.forEach(ev => {
      if (ev.themeEffect) lancerAnimation(ev.themeEffect); // effet visuel à lancer
    });
  } else {
    currentAlertText = "🌌 Aucun phénomène remarquable aujourd’hui. Les étoiles se reposent en silence.";
  }

  lancerIntroAstro(); // Lance l’animation textuelle
}

/**
 * Animation machine à écrire
 * @param {HTMLElement} element - Élément cible
 * @param {string} text - Texte à écrire
 * @param {number} speed - Vitesse d’écriture (ms par caractère)
 * @param {Function} callback - Callback final optionnel
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
 * Lance le message d’intro animé (séquence ambiance + info astro)
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

  // ✅ Affiche icône + texte
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
