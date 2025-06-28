document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("viewer-menu-burger");
  const menu = document.getElementById("viewer-menu");
  const close = document.getElementById("viewer-menu-close");

  if (burger && menu) {
    burger.addEventListener("click", () => {
      menu.classList.toggle("open");
      burger.classList.toggle("open");
    });
  }

  if (close && menu) {
    close.addEventListener("click", () => {
      menu.classList.remove("open");
      burger.classList.remove("open");
    });
  }

  // Délégation d'événements : clics sur les liens du menu
  menu.addEventListener("click", e => {
    const link = e.target.closest('a[data-viewer]');
    if (link) {
      e.preventDefault();
      const ref = link.dataset.viewer;
      if (ref && typeof loadArticle === "function") {
        loadArticle(ref);
      }
      // Fermer le menu après clic (facultatif)
      if (window.innerWidth <= 768) {
        menu.classList.remove("open");
        if (burger) burger.classList.remove("open");
      }
    }
  });
});
