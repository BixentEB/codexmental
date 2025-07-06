document.addEventListener('DOMContentLoaded', () => {
  const tabs = document.querySelectorAll('.tabs .tab');
  const contents = document.querySelectorAll('.tab-content');

  // Récupère l'onglet actif en mémoire
  const savedTab = localStorage.getItem('activeTab');
  if (savedTab) {
    activateTab(savedTab);
  }

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;
      activateTab(target);
      // Mémorise
      localStorage.setItem('activeTab', target);
    });
  });

  function activateTab(tabName) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.tab === tabName));
    contents.forEach(c => c.classList.toggle('active', c.id === tabName));
  }
});
