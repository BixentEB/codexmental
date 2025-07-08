// Configurable seuils
const thresholds = {
  pc: { rows: 10, cols: 6 },
  mobile: { rows: 5, cols: 4 }
};

// Détecter mobile
const isMobile = window.innerWidth <= 768;
const maxRows = isMobile ? thresholds.mobile.rows : thresholds.pc.rows;
const maxCols = isMobile ? thresholds.mobile.cols : thresholds.pc.cols;

// Cibler UNIQUEMENT les tableaux codex-table
document.querySelectorAll("table.codex-table").forEach(table => {
  const rows = table.querySelectorAll("tr").length;
  const firstRow = table.querySelector("tr");
  if (!firstRow) return; // Sécurité si pas de tr

  const cols = firstRow.querySelectorAll("th, td").length;

  let hasScroll = false;

  if (rows > maxRows) {
    table.classList.add("scroll-vertical");
    hasScroll = true;
  }

  if (cols > maxCols) {
    table.classList.add("scroll-horizontal");
    hasScroll = true;
  }

  // Ajouter le message cliquable seulement si scroll activé
  if (hasScroll) {
    const note = document.createElement("div");
    note.textContent = "👉 Cliquer pour agrandir";
    note.className = "table-note";

    table.parentNode.insertBefore(note, table);

    note.addEventListener("click", () => {
      const overlay = document.getElementById("tableOverlay");
      const content = document.getElementById("tableContent");

      if (overlay && content) {
        content.innerHTML = table.outerHTML;
        overlay.style.display = "flex";
      } else {
        console.log("⚠️ Overlay introuvable : impossible d'afficher le tableau en plein écran.");
      }
    });
  }
});

// Sécurité bouton fermer overlay
const closeButton = document.getElementById("closeOverlay");
if (closeButton) {
  closeButton.addEventListener("click", () => {
    const overlay = document.getElementById("tableOverlay");
    const content = document.getElementById("tableContent");
    if (overlay && content) {
      overlay.style.display = "none";
      content.innerHTML = "";
    }
  });
}
