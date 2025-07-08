// Configurable
const thresholds = {
  pc: { rows: 10, cols: 6 },
  mobile: { rows: 5, cols: 4 }
};

// Détecter mobile
const isMobile = window.innerWidth <= 768;
const maxRows = isMobile ? thresholds.mobile.rows : thresholds.pc.rows;
const maxCols = isMobile ? thresholds.mobile.cols : thresholds.pc.cols;

// Cibler UNIQUEMENT les tableaux avec .codex-table
document.querySelectorAll("table.codex-table").forEach(table => {
  const rowCount = table.querySelectorAll("tr").length;
  const colCount = table.querySelectorAll("tr:first-child th, tr:first-child td").length;

  let hasScroll = false;

  // Scroll vertical si trop de lignes
  if (rowCount > maxRows) {
    table.classList.add("scroll-vertical");
    hasScroll = true;
  }

  // Scroll horizontal si trop de colonnes
  if (colCount > maxCols) {
    table.classList.add("scroll-horizontal");
    hasScroll = true;
  }

  // Si scroll activé, ajouter le message cliquable
  if (hasScroll) {
    const note = document.createElement("div");
    note.textContent = "👉 Cliquer pour agrandir";
    note.className = "table-note";

    // Placer le message avant le tableau
    table.parentNode.insertBefore(note, table);

    // Gérer le clic
    note.addEventListener("click", () => {
      const overlay = document.getElementById("tableOverlay");
      const content = document.getElementById("tableContent");
      content.innerHTML = table.outerHTML;
      overlay.style.display = "flex";
    });
  }
});

// Bouton fermer overlay
document.getElementById("closeOverlay").addEventListener("click", () => {
  const overlay = document.getElementById("tableOverlay");
  overlay.style.display = "none";
  document.getElementById("tableContent").innerHTML = "";
});
