/* Installation du portail (Edge / Chrome / Android) : enregistrement du service worker
   et bouton « Installer » quand le navigateur le propose. */
(function () {
  'use strict';
  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    window.addEventListener('load', function () {
      navigator.serviceWorker.register('sw.js').catch(function () { /* le portail marche aussi sans */ });
    });
  }

  var invite = null;
  function bouton() { return document.getElementById('btn-installer'); }

  window.addEventListener('beforeinstallprompt', function (e) {
    e.preventDefault();
    invite = e;
    if (bouton()) bouton().hidden = false;
  });

  window.addEventListener('appinstalled', function () {
    invite = null;
    if (bouton()) bouton().hidden = true;
  });

  document.addEventListener('DOMContentLoaded', function () {
    var b = bouton();
    if (!b) return;
    b.addEventListener('click', function () {
      if (!invite) return;
      invite.prompt();
      invite.userChoice.then(function () {
        invite = null;
        b.hidden = true;
      });
    });
  });
})();
