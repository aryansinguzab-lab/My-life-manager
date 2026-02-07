const cacheName = 'school support'; 
const assets = [
  '/',
  '/index.html',
  '/manifest.json',
  '/dexie.js',
  '/chart.js',
  '/icon2.png'
  
  // Add icon here only if it physically exists in the folder
];

self.addEventListener('install', evt => {
  evt.waitUntil(
    caches.open(cacheName).then(cache => {
      // We use a map to catch errors so one missing file doesn't break the app
      return Promise.allSettled(assets.map(url => cache.add(url)));
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', evt => {
  evt.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(key => key !== cacheName).map(key => caches.delete(key))
      );
    })
  );
  return self.clients.claim();
});

self.addEventListener('fetch', evt => {
  // Only handle standard GET requests
  if (evt.request.method !== 'GET') return;

  evt.respondWith(
    caches.open(cacheName).then(cache => {
      return cache.match(evt.request).then(cachedRes => {
        const fetchPromise = fetch(evt.request).then(networkRes => {
          // Update the cache with the fresh version for NEXT time
          if (networkRes.ok) {
            cache.put(evt.request, networkRes.clone());
          }
          return networkRes;
        }).catch(() => {
            // If network fails and no cache, this prevents a crash
            return cachedRes; 
        });

        // Return the cached version immediately (fast), or wait for network
        return cachedRes || fetchPromise;
      });
    })
  );
});
      
