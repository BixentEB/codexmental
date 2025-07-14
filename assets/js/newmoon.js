import { moon } from "https://cdn.jsdelivr.net/npm/astronomia/+esm";

export function updateNewMoonWidget() {
  // Suppression de l'ancien widget
  const existing = document.getElementById('lune-widget');
  if (existing) existing.remove();

  // Création du widget
  const widget = document.createElement('div');
  widget.id = 'lune-widget';
  widget.innerHTML = `
    <svg viewBox="0 0 100 100" width="200" height="200">
      <defs>
        <mask id="masque-lune">
          <rect width="100%" height="100%" fill="white"/>
          <circle id="lune-ombre" cx="50" cy="50" r="50" fill="black"/>
        </mask>
      </defs>
      <circle cx="50" cy="50" r="49" fill="#f5f5f5" mask="url(#masque-lune)"/>
    </svg>
  `;
  document.body.appendChild(widget);

  // Mise à jour de la phase
  function update() {
    const date = new Date();
    const phase = moon.phase(date); // Angle en radians
    const illumination = moon.illum(date); // % éclairé
    
    // Position de l'ombre (ajustement précis)
    const shadowX = 50 + (50 * Math.cos(phase + Math.PI/2));
    document.getElementById('lune-ombre').setAttribute('cx', shadowX);
    
    console.log(`🌙 Phase: ${(illumination*100).toFixed(1)}%`);
  }

  update();
  setInterval(update, 3600000); // Actualisation horaire
}
