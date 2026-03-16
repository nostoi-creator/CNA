const CACHE_NAME = 'cna-network-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/bg.png',
  '/icon-192.png',
  '/icon-512.png',
  '/Blackout.m4a',
  '/CNA-Keypad-SE.mp3',
  '/CNA-Push-SE.mp3',
  '/CNA-Push2-SE.mp3',
  '/CNA-Push3-SE.mp3',
  '/CNA-Passwordclosed-SE.mp3',
  '/CNA-Animationtext-SE.mp3',
];

// インストール時にキャッシュ
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS.map(url => new Request(url, { cache: 'reload' })));
    }).then(() => self.skipWaiting())
  );
});

// 古いキャッシュを削除
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// キャッシュ優先・ネットワークフォールバック
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
    })
  );
});
