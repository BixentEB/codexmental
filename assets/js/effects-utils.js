/**
 * Ajoute un effet CSS à tous les éléments ciblés
 */
export function applyEffect(selector, effectClass) {
  document.querySelectorAll(selector).forEach(el => el.classList.add(effectClass));
}

/**
 * Retire un effet CSS
 */
export function removeEffect(selector, effectClass) {
  document.querySelectorAll(selector).forEach(el => el.classList.remove(effectClass));
}

/**
 * Change d’effet (utile si on switch de thème)
 */
export function switchEffect(selector, newEffect, effectsList) {
  document.querySelectorAll(selector).forEach(el => {
    effectsList.forEach(e => el.classList.remove(e));
    el.classList.add(newEffect);
  });
}
