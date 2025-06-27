document.addEventListener("DOMContentLoaded", () => {
  const burger = document.getElementById("viewer-menu-burger");
  const menu = document.getElementById("viewer-menu");
  const close = document.getElementById("viewer-menu-close");

  burger.addEventListener("click", () => {
    menu.classList.toggle("open");
    burger.classList.toggle("open");
  });

  close.addEventListener("click", () => {
    menu.classList.remove("open");
    burger.classList.remove("open");
  });
});
