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

      // Si on injecte le menu, activer liens et interactions
      if (id === 'menu-placeholder') {
        highlightActiveLink();

        // 🔄 Menu mobile
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

        // 🌌 Bouton flottant des thèmes
        const themeFab = document.getElementById("theme-fab");
        const themeOptions = document.querySelector(".theme-fab-options");
        if (themeFab && themeOptions) {
          themeFab.addEventListener("click", () => {
            themeOptions.classList.toggle("hidden");
          });
          document.addEventListener("click", (e) => {
            if (!themeFab.contains(e.target) && !themeOptions.contains(e.target)) {
              themeOptions.classList.add("hidden");
            }
          });
        }
      }
    });
}

/**
 * Ajoute la classe "active" sur le lien du menu correspondant à la page en cours
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
