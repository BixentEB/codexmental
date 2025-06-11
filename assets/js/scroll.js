// ========================================================
// scroll.js – Gestion du bouton "Retour en haut"
// ========================================================

/**
 * Initialise le bouton de retour en haut de page :
 * - Masqué par défaut
 * - S'affiche après un scroll > 100px
 * - Fait défiler la page en douceur vers le haut
 */
export function setupScrollButton() {
  const btn = document.getElementById('scrollTopBtn');
  if (!btn) return;

  // Masquer le bouton au départ
  btn.style.display = 'none';

  // Scroll doux au clic
  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Afficher / masquer selon le scroll
  window.addEventListener('scroll', () => {
    btn.style.display = window.scrollY > 100 ? 'block' : 'none';
  });
}
