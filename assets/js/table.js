// Configurable seuils
const thresholds = {
  pc: { rows: 10, cols: 6 },
  mobile: { rows: 5, cols: 4 }
};

// Détecter mobile
const isMobile = window.innerWidth <= 768;
const maxRows = isMobile ? thresholds.mobile.rows : thresholds.pc.rows;
const maxCols = isMobile ? thresholds.mobile.cols : thresholds.pc.cols;

console.log("=== DEBUG TABLES ===");

// Lister tous les tableaux ciblés
document.querySelectorAll("table").forEach((table, index) => {
  const rowCount = table.querySelectorAll("tr").length;
  const colCount = table.querySelectorAll("tr:first-child th, tr:first-child td").length;
  
  console.log(`Table #${index + 1}:`);
  console.log("- InnerHTML (truncated):", table.innerHTML.substring(0, 200) + "...");
  console.log(`- Rows: ${rowCount}`);
  console.log(`- Columns: ${colCount}`);
  console.log(`- Parent classes: ${table.parentNode.className}`);
  
  // Simuler les classes qu'on aurait appliquées
  if (rowCount > maxRows) {
    console.log("-> DEV NOTE: Ce tableau recevrait scroll-vertical");
  }
  if (colCount > maxCols) {
    console.log("-> DEV NOTE: Ce tableau recevrait scroll-horizontal");
  }
});
