function setCookie(name, value, days) {
  const expires = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + expires + "; path=/";
}

function getCookie(name) {
  const value = "; " + document.cookie;
  const parts = value.split("; " + name + "=");
  if (parts.length === 2) return decodeURIComponent(parts.pop().split(";").shift());
}

window.addEventListener('DOMContentLoaded', function() {
  const banner = document.getElementById('cookie-banner');
  const button = document.getElementById('cookie-accept');

  if (!getCookie('cookieConsent')) {
    banner.style.display = 'flex';
  } else {
    // Masquer si consentement déjà donné
    banner.style.display = 'none';
  }

  button.addEventListener('click', function() {
    setCookie('cookieConsent', 'true', 365);
    banner.style.display = 'none';
  });
});
