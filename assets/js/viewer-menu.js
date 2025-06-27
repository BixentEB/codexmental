// Ajoutez ce check au début du fichier
console.log("[Debug] Chargement viewer-menu.js");
if (!document.getElementById('viewer-menu')) {
  console.error("Élément #viewer-menu introuvable !");
  return; // Stop si l'élément n'existe pas
}

document.addEventListener("DOMContentLoaded", () => {
  // 1. Injection dynamique des éléments
  const injectElements = () => {
    // Charge menu-principal.html dans le header
    fetch('templates/menu-principal.html')
      .then(r => r.text())
      .then(html => {
        document.querySelector('header').insertAdjacentHTML('beforeend', html);
        initBurger();
      });

    // Charge blog-menu.html dans le conteneur
    fetch('templates/blog-menu.html')
      .then(r => r.text())
      .then(html => {
        document.getElementById('menu-container').innerHTML = html;
        initBurger();
      });
  };

  // 2. Initialisation des interactions
  const initBurger = () => {
    const burger = document.getElementById("articles-menu-burger");
    const menu = document.getElementById("viewer-menu");
    const close = document.getElementById("viewer-menu-close");

    if (burger && menu && close) {
      burger.addEventListener("click", () => {
        menu.classList.toggle("open");
        burger.classList.toggle("open");
      });

      close.addEventListener("click", () => {
        menu.classList.remove("open");
        burger.classList.remove("open");
      });
    }
  };

  injectElements();
});
