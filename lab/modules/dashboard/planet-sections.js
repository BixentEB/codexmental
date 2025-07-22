// planet-sections.js – fonctions de rendu pour chaque sous-section

export function renderBasicInfo(data) {
  return `
    <p>Nom : ${data.name}</p>
    <p>Distance : ${data.distance}</p>
    <p>Taille : ${data.radius}</p>
    <p>Température : ${data.temp}</p>
  `;
}

export function renderComposition(data) {
  return data.composition
    ? `<p><strong>Composition :</strong><br>${data.composition}</p>`
    : "<p>Composition inconnue</p>";
}

export function renderClimate(data) {
  return data.climate
    ? `<p><strong>Climat :</strong><br>${data.climate}</p>`
    : `<p>Température moyenne : ${data.temp || '—'}</p>`;
}
