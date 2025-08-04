document.addEventListener("DOMContentLoaded", () => {
  const NEW_THRESHOLD_DAYS = 7;
  const links = document.querySelectorAll('#viewer-menu a[data-date]'); // 👈 ici la bonne cible

  links.forEach(link => {
    const dateStr = link.dataset.date;
    if (!dateStr) return;

    const pubDate = new Date(dateStr);
    const now = new Date();
    const diffDays = (now - pubDate) / (1000 * 60 * 60 * 24);

    if (diffDays <= NEW_THRESHOLD_DAYS) {
      const newBadge = document.createElement('span');
      newBadge.textContent = "NEW";
      newBadge.classList.add("new-badge");
      link.prepend(newBadge);
    }
  });
});
