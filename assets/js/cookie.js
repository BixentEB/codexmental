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
  if (!getCookie('cookieConsent')) {
    document.getElementById('cookie-banner').style.display = 'flex';
  }

  document.getElementById('cookie-accept').addEventListener('click', function() {
    setCookie('cookieConsent', 'true', 365);
    document.getElementById('cookie-banner').style.display = 'none';
  });
});
