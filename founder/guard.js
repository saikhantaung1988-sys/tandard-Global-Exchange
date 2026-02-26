// /founder/guard.js
(function () {
  const ok = sessionStorage.getItem('founder_ok');
  if (!ok) {
    location.href = '/founder/index.html';
  }
})();