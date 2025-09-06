// ========================================================
// theme-alias.js — Alias "theme-main" vers ton thème favori
// ========================================================

/**
 * Mappe "theme-main" vers TON thème favori du moment, sans casser le choix visiteur.
 * - Si le visiteur a déjà choisi un thème (localStorage), on le respecte.
 * - Sinon on renvoie ton favori (configurable ci-dessous).
 */
const ADMIN_FAVORITE = 'theme-sky'; 
// Change ici quand tu veux: 'theme-stellaire' | 'theme-galactique' | 'theme-solaire' | 'theme-lunaire' | 'theme-sky' (si tu en crées un), etc.

export function resolveInitialTheme() {
  const userChoice = localStorage.getItem('codexTheme'); // choix visiteur, s'il existe
  if (userChoice) return userChoice;

  // Si la page met <body class="theme-main"> on aliasera vers ADMIN_FAVORITE
  return 'theme-main'; 
}

export function resolveAlias(themeClass) {
  // Si on te passe 'theme-main', retourne l'alias réel choisi côté admin
  if (themeClass === 'theme-main') return ADMIN_FAVORITE;
  return themeClass;
}
