// Ajoute "NEW" devant les liens récents ET une pastille sur les <summary> qui en contiennent
document.addEventListener("DOMContentLoaded", () => {
  const NEW_THRESHOLD_DAYS = 7;

  const isNew = (dateStr) => {
    if (!dateStr) return false;
    const pubDate = new Date(dateStr);
    if (isNaN(pubDate)) return false;
    const now = new Date();
    const diffDays = (now - pubDate) / (1000 * 60 * 60 * 24);
    return diffDays <= NEW_THRESHOLD_DAYS;
  };

  // 1) Badges "NEW" sur les liens
  const links = document.querySelectorAll('#viewer-menu a[data-date]');
  links.forEach(link => {
    if (isNew(link.dataset.date)) {
      const badge = document.createElement('span');
      badge.textContent = "NEW";
      badge.className = "new-badge";
      link.classList.add('is-new');        // pour la détection section
      link.prepend(badge);
    }
  });

  // 2) Pastille sur les sections <details> qui contiennent au moins un .is-new
  const sections = document.querySelectorAll('#viewer-menu details');
  sections.forEach(section => {
    const hasNew = section.querySelector('a.is-new') !== null;
    const summary = section.querySelector('summary');
    if (!summary) return;

    // Evite les doublons si le script est ré-exécuté
    const existingDot = summary.querySelector('.section-new-dot');

    if (hasNew && !existingDot) {
      const dot = document.createElement('span');
      dot.className = 'section-new-dot';
      summary.appendChild(dot);
      section.classList.add('has-new');
    } else if (!hasNew && existingDot) {
      existingDot.remove();
      section.classList.remove('has-new');
    }
  });
});
