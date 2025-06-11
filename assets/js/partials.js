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

      // Si on injecte le menu, activer liens et menu mobile
      if (id === 'menu-placeholder') {
        highlightActiveLink();

        // 🔄 Activation du menu mobile
        setTimeout(() => {
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
        }, 10);
      }
    });
}

/**
 * Ajoute la classe "active" sur le lien du menu correspondant à la page en cours
 */
export function highlightActiveLink() {
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  document.querySelectorAll(".nav-link").forEach(link => {
    const href = link.getAttribute("href") || "";
    if (href.endsWith(currentPage)) {
      link.classList.add("active");
    }
  });
}
