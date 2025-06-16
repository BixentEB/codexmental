const panels = document.querySelectorAll('.panel');
const panelWrapper = document.getElementById('panels');
const blogViewer = document.getElementById('blog-viewer');
const menuButtons = document.querySelectorAll('.menu-btn');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

let articlesData = [];

async function loadArticles() {
  const res = await fetch('/blog/blog.json');
  articlesData = await res.json();
  populatePanels();
}

function populatePanels() {
  const byDate = [...articlesData].sort((a, b) => b.date.localeCompare(a.date));
  const byTheme = {};
  const allList = [];

  byDate.forEach(article => {
    // Liste pour Tous
    const link = createArticleLink(article);
    allList.push(link);

    // Regroupement par thème
    if (!byTheme[article.theme]) byTheme[article.theme] = [];
    byTheme[article.theme].push(createArticleLink(article));
  });

  // Remplir les panneaux
  const datePanel = document.getElementById('panel-date');
  datePanel.innerHTML = '<h3>🗓️ Articles par date</h3>';
  byDate.forEach(article => {
    datePanel.appendChild(createArticleLink(article));
  });

  const themePanel = document.getElementById('panel-theme');
  themePanel.innerHTML = '<h3>🧠 Thématiques</h3>';
  for (let theme in byTheme) {
    const themeTitle = document.createElement('h4');
    themeTitle.textContent = theme;
    themePanel.appendChild(themeTitle);
    byTheme[theme].forEach(link => themePanel.appendChild(link));
  }

  const allPanel = document.getElementById('panel-all');
  allPanel.innerHTML = '<h3>📄 Tous les articles</h3>';
  allList.forEach(link => allPanel.appendChild(link));
}

function createArticleLink(article) {
  const a = document.createElement('a');
  a.href = '#';
  a.textContent = article.title;
  a.dataset.file = article.file;
  a.classList.add('article-link');
  a.style.display = 'block';
  a.style.margin = '0.5rem 0';
  a.addEventListener('click', e => {
    e.preventDefault();
    loadArticle(article.file);
  });
  return a;
}

function loadArticle(file) {
  fetch(file)
    .then(res => res.text())
    .then(html => {
      blogViewer.innerHTML = html;
    })
    .catch(err => {
      blogViewer.innerHTML = '<p>❌ Erreur lors du chargement de l’article.</p>';
    });
}

menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    panelWrapper.classList.add('active');
    panels.forEach(p => p.classList.remove('active'));
    const panel = document.getElementById(`panel-${btn.dataset.panel}`);
    if (panel) panel.classList.add('active');
  });
});

// Recherche dynamique
searchInput?.addEventListener('input', () => {
  const query = searchInput.value.toLowerCase();
  searchResults.innerHTML = '';

  articlesData.forEach(article => {
    const content = (article.title + article.tags.join(' ')).toLowerCase();
    if (content.includes(query)) {
      const link = createArticleLink(article);
      searchResults.appendChild(link);
    }
  });

  if (!searchResults.children.length) {
    searchResults.innerHTML = '<p>Aucun résultat.</p>';
  }
});

loadArticles();
