// ========================================================
// partials.js – Injection dynamique des sections HTML (menu, footer)
// ========================================================

/**
 * Injecte un fragment HTML dans un élément ciblé par son ID
 * @param {string} id - L’ID de l’élément HTML cible
 * @param {string} url - L’URL du fichier HTML à injecter
 */
export function injectPartial(id, url) {
  const target = document.getElementById(id);
  if (!target) return;

  return fetch(url)
    .then(res => res.ok ? res.text() : Promise.reject(`Erreur chargement ${url}`))
    .then(html => {
      target.innerHTML = html;

      if (id === 'menu-placeholder') {
        highlightActiveLink();
        setupMobileMenu();
        setupThemeFab();
      }
    });
}

/**
 * Ajoute la classe "active" au lien de navigation correspondant à la page en cours
 */
export function highlightActiveLink() {
  const path = window.location.pathname;

  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href");

    const normalizedHref = href.replace(/\/index\.html$/, "").replace(/\/$/, "");
    const normalizedPath = path.replace(/\/index\.html$/, "").replace(/\/$/, "");

    if (normalizedHref === normalizedPath) {
      link.classList.add("active");
    }
  });
}


/**
 * Gère l’ouverture et la fermeture du menu mobile
 */
function setupMobileMenu() {
  const toggleBtn = document.getElementById("menu-toggle");
  const menu = document.getElementById("mobile-menu");

  if (toggleBtn && menu) {
    toggleBtn.addEventListener("click", () => {
      menu.classList.toggle("open");
    });

    document.addEventListener("click", (e) => {
      if (!menu.contains(e.target) && e.target !== toggleBtn) {
        menu.classList.remove("open");
      }
    });
  }
}

/**
 * Gère l’ouverture et fermeture du bouton flottant (FAB) de sélection des thèmes
 */
function setupThemeFab() {
  const themeFab = document.getElementById("theme-fab");
  const themeOptions = document.querySelector(".theme-fab-options");

  if (themeFab && themeOptions) {
    themeFab.addEventListener("click", (e) => {
      e.stopPropagation(); // Empêche fermeture immédiate
      themeOptions.classList.toggle("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!themeFab.contains(e.target) && !themeOptions.contains(e.target)) {
        themeOptions.classList.add("hidden");
      }
    });
  }
}
