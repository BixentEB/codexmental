/* eslint-env browser */
/* eslint-disable no-undef */
(function () {
  // Récupère l'espace global sans supposer 'window'
  var G = (typeof globalThis !== 'undefined') ? globalThis
        : (typeof self !== 'undefined') ? self
        : (typeof window !== 'undefined') ? window
        : {};

  var THREE_NS = G && G.THREE;
  if (!THREE_NS || !THREE_NS.TextureLoader || !THREE_NS.TextureLoader.prototype || typeof THREE_NS.TextureLoader.prototype.load !== 'function') {
    return; // rien à faire si Three.js ou le loader n'est pas présent
  }

  var TL = THREE_NS.TextureLoader.prototype;
  var OLD_LOAD = TL.load;

  function mapPath(url) {
    if (!url) return url;
    var u = String(url);

    // Remap anciens dossiers -> nouveaux
    u = u.replace(/\/img\/planets\//g, '/dashb/modules/dashboard/assets/textures/planets/');
    u = u.replace(/\/img\/moons\//g,   '/dashb/modules/dashboard/assets/textures/moons/');
    u = u.replace(/\/img\/rings\//g,   '/dashb/modules/dashboard/assets/textures/rings/');

    // Normalise un ancien schéma {name}-{layer}.jpg
    u = u.replace(/\/textures\/planets\/([^/]+)-(surface|cloud|infrared)\.jpg/i,
                  '/dashb/modules/dashboard/assets/textures/planets/$1-$2.jpg');

    return u;
  }

  TL.load = function (url, onLoad, onProgress, onError) {
    var next = url;
    try { next = mapPath(url); } catch (e) { /* silencieux */ }
    return OLD_LOAD.call(this, next, onLoad, onProgress, onError);
  };
})();
