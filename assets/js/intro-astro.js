import { IDS } from '/assets/js/ids.js';
import { getFullMoonInfo } from '/assets/js/astro-lunaire.js';

export let currentAlertText = "";
let isTyping = false;

export function isToday(dateStr) {
  const today = new Date();
  const date = new Date(dateStr);
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

export function afficherNoteAstro(data, theme) {
  const bloc = document.getElementById(IDS.ASTRO);
  if (!bloc) return;
  if (theme === 'lunaire') {
    currentAlertText = getFullMoonInfo();
  } else {
    const todayAlerts = data.filter(ev => isToday(ev.date));
    if (todayAlerts.length > 0) {
      const eventsText = todayAlerts.map(ev => ev.message).join(' • ');
      currentAlertText = eventsText;
    } else {
      currentAlertText = '🪐 Aucune donnée à ce jour.';
    }
  }
  lancerIntroAstro(theme);
}
