// Recipe Box service worker - app shell cached, recipes refreshed when online.
const SHELL = 'rb-shell-v2';
const DATA  = 'rb-data-v1';
const LIB   = 'rb-lib-v1';
const SHELL_FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(SHELL).then(c => c.addAll(SHELL_FILES)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== SHELL && k !== DATA && k !== LIB).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  // Firebase SDK from gstatic: cache first, so the grocery list still loads offline
  if (url.hostname === 'www.gstatic.com' && url.pathname.indexOf('/firebasejs/') === 0) {
    e.respondWith(
      caches.open(LIB).then(c => c.match(req).then(hit => hit || fetch(req).then(res => {
        if (res && res.status === 200) c.put(req, res.clone());
        return res;
      })))
    );
    return;
  }

  if (url.origin !== location.origin) return;

  // recipes.json: network first so new recipes show up, fall back to last good copy
  if (url.pathname.endsWith('recipes.json')) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(DATA).then(c => c.put('recipes.json', copy));
        return res;
      }).catch(() => caches.open(DATA).then(c => c.match('recipes.json')))
    );
    return;
  }

  // everything else: cache first, refresh in background
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(res => {
        if (res && res.status === 200) {
          const copy = res.clone();
          caches.open(SHELL).then(c => c.put(req, copy));
        }
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
