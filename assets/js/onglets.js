document.addEventListener('DOMContentLoaded', () => {
  const tabSections = document.querySelectorAll('.tabs-section');

  tabSections.forEach(section => {
    const tabs = section.querySelectorAll('.tab');
    const contents = section.querySelectorAll('.tab-content');

    // Récupérer l'onglet actif en mémoire (clé unique par bloc si plusieurs sections)
    const sectionId = section.id || 'default';
    const savedTab = localStorage.getItem(`activeTab-${sectionId}`);
    if (savedTab && section.querySelector(`.tab[data-tab="${savedTab}"]`)) {
      activateTab(savedTab);
    }

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const target = tab.dataset.tab;
        activateTab(target);
        // Mémoriser
        localStorage.setItem(`activeTab-${sectionId}`, target);
      });
    });

    function activateTab(tabName) {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
      contents.forEach(c => c.classList.toggle('active', c.id === tabName));
    }
  });
});
