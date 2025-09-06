// ==========================================
// Catalogue d'effets pour onglets
// ==========================================

/**
 * Applique un effet donné aux onglets d’un conteneur
 * @param {string} containerSelector - ex: ".tabs"
 * @param {string} effectClass - ex: "tab-effect-shine"
 */
export function applyTabEffect(containerSelector, effectClass) {
  const tabs = document.querySelectorAll(`${containerSelector} .tab`);
  tabs.forEach(tab => tab.classList.add(effectClass));
}

/**
 * Retire un effet donné
 */
export function removeTabEffect(containerSelector, effectClass) {
  const tabs = document.querySelectorAll(`${containerSelector} .tab`);
  tabs.forEach(tab => tab.classList.remove(effectClass));
}

/**
 * Change d’effet (supprime les anciens, ajoute le nouveau)
 */
export function switchTabEffect(containerSelector, newEffect, effectsList) {
  const tabs = document.querySelectorAll(`${containerSelector} .tab`);
  tabs.forEach(tab => {
    effectsList.forEach(e => tab.classList.remove(e));
    tab.classList.add(newEffect);
  });
}
