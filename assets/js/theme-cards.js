// Cartes thèmes — gestion par délégation (fonctionne même si le HTML est injecté après coup)

function getCardsContainer(start) {
  // On remonte jusqu'au container si possible, sinon document
  return (start && start.closest?.('.theme-cards-container')) || document;
}

function setActiveCard(clickedCard) {
  const container = getCardsContainer(clickedCard);
  container.querySelectorAll('.theme-card.active').forEach(c => c.classList.remove('active'));
  clickedCard.classList.add('active');
}

document.addEventListener('click', (e) => {
  const card = e.target.closest('.theme-card');
  if (!card) return;

  const themeKey = card.dataset.theme;           // ex: "solaire", "lunaire", "galactique", "stellaire", "sky"
  if (!themeKey) return;

  const themeClass = `theme-${themeKey}`;

  // 1) Mémorise le choix visiteur
  try { localStorage.setItem('codexTheme', themeClass); } catch {}

  // 2) Active visuellement la carte cliquée (dans SON container)
  setActiveCard(card);

  // 3) Applique le thème via l’API centrale (theme-engine + canvas)
  if (typeof window.setTheme === 'function') {
    window.setTheme(themeClass);
  } else {
    // Fallback minimal si setTheme n'est pas dispo (rare)
    document.body.className = themeClass;
  }
});

// Bonus: si le thème actuel est connu, on marque la carte correspondante comme active
window.addEventListener('DOMContentLoaded', () => {
  const effective = document.body.dataset?.effectiveTheme || '';
  const key = effective.replace(/^theme-/, ''); // "solaire" etc.
  if (!key) return;

  const card = document.querySelector(`.theme-card[data-theme="${key}"]`);
  if (card) setActiveCard(card);
});
