// ============================================
// blog.js – Affichage dynamique du blog Codex
// ============================================

// Références DOM
const panels = document.querySelectorAll('.panel');
const panelWrapper = document.getElementById('panels');
const blogViewer = document.getElementById('blog-viewer');
const menuButtons = document.querySelectorAll('.menu-btn');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

let articlesData = [];

// ============================================
// Chargement du fichier JSON contenant les articles
// ============================================
async function loadArticles() {
  try {
    const res = await fetch('/blog/blog.json');
    articlesData = await res.json();
    populatePanels();
  } catch (err) {
    blogViewer.innerHTML = '<p>❌ Erreur lors du chargement des articles.</p>';
  }
}

// ============================================
// Création dynamique des panneaux : date, thème, tous
// ============================================
function populatePanels() {
  const byDate = [...articlesData].sort((a, b) => b.date.localeCompare(a.date));
  const byTheme = {};
  const allList = [];

  byDate.forEach(article => {
    const link = createArticleLink(article);
    allList.push(link);

    if (!byTheme[article.theme]) byTheme[article.theme] = [];
    byTheme[article.theme].push(createArticleLink(article));
  });

  // Panel Date
  const datePanel = document.getElementById('panel-date');
  datePanel.innerHTML = '<h3>🗓️ Articles par date</h3>';
  byDate.forEach(article => {
    datePanel.appendChild(createArticleLink(article));
  });

  // Panel Thèmes
  const themePanel = document.getElementById('panel-theme');
  themePanel.innerHTML = '<h3>🧠 Thématiques</h3>';
  for (let theme in byTheme) {
    const title = document.createElement('h4');
    title.textContent = theme;
    themePanel.appendChild(title);
    byTheme[theme].forEach(link => themePanel.appendChild(link));
  }

  // Panel Tous
  const allPanel = document.getElementById('panel-all');
  allPanel.innerHTML = '<h3>📄 Tous les articles</h3>';
  allList.forEach(link => allPanel.appendChild(link));
}

// ============================================
// Création d’un lien cliquable vers un article
// ============================================
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

// ============================================
// Chargement d’un article dans la zone centrale
// ============================================
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

// ============================================
// Gestion des boutons de menu (ouverture de panneaux)
// ============================================
menuButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    panelWrapper.classList.add('active');
    panels.forEach(p => p.classList.remove('active'));

    const panel = document.getElementById(`panel-${btn.dataset.panel}`);
    if (panel) panel.classList.add('active');

    // Optionnel : refermer le menu latéral sur petit écran
    if (window.innerWidth < 768) {
      document.getElementById('blog-menu')?.classList.add('closed');
    }
  });
});

// ============================================
// Recherche dynamique d’articles
// ============================================
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

// ============================================
// Initialisation
// ============================================
loadArticles();
