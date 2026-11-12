/* Service worker du portail : rend la page installable et l'ouvre même hors connexion.
   Stratégie « réseau d'abord » : en ligne, toujours la dernière version publiée ;
   hors ligne, la dernière copie gardée. Les applications ouvertes par les boutons
   (autres adresses) ne sont jamais interceptées. */
const CACHE = 'portail-v1';
const FICHIERS = [
  './', 'index.html', 'manifest.webmanifest', 'js/pwa.js',
  'icones/icone.svg', 'icones/icone-192.png', 'icones/icone-512.png',
  'icones/icone-masquable-512.png', 'icones/apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(cles => Promise.all(cles.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  // Uniquement les fichiers du portail lui-même.
  if (req.method !== 'GET' || url.origin !== self.location.origin ||
      !url.pathname.startsWith(new URL(self.registration.scope).pathname)) return;
  const cle = url.origin + url.pathname;
  e.respondWith(
    fetch(req)
      .then(rep => {
        if (rep.ok) {
          const copie = rep.clone();
          caches.open(CACHE).then(c => c.put(cle, copie));
        }
        return rep;
      })
      .catch(() => caches.match(cle).then(r => r ||
        (req.mode === 'navigate' ? caches.match(new URL('index.html', self.registration.scope).href) : undefined) ||
        new Response('Hors connexion', { status: 503 })))
  );
});
