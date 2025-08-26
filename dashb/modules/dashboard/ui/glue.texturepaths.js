// Réécriture douce des chemins textures (planets / moons / rings) -> assets/textures
(function(){
  const TL = (window.THREE && THREE.TextureLoader && THREE.TextureLoader.prototype);
  if (!TL || !TL.load) return;

  const OLD_LOAD = TL.load;
  const mapPath = (url='')=>{
    let u = String(url);
    // anciens dossiers connus
    u = u.replace(/\/img\/planets\//g, '/assets/textures/planets/');
    u = u.replace(/\/img\/moons\//g,   '/assets/textures/moons/');
    u = u.replace(/\/img\/rings\//g,   '/assets/textures/rings/');
    // si on détecte un {name}-{layer}.jpg ailleurs -> planets/
    u = u.replace(/\/textures\/planets\/([^/]+)-(surface|cloud|infrared)\.jpg/i,
                  '/assets/textures/planets/$1-$2.jpg');
    return u;
  };

  TL.load = function(url, onLoad, onProgress, onError){
    try { url = mapPath(url); } catch(e){}
    return OLD_LOAD.call(this, url, onLoad, onProgress, onError);
  };
})();
