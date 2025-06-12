document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("menu-toggle");
  const mobileMenu = document.getElementById("mobile-menu");

  if (toggleBtn && mobileMenu) {
    toggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      mobileMenu.classList.toggle("open");
    });

    // Fermer si clic ailleurs
    document.addEventListener("click", (e) => {
      if (!mobileMenu.contains(e.target) && e.target !== toggleBtn) {
        mobileMenu.classList.remove("open");
      }
    });
  }
});
