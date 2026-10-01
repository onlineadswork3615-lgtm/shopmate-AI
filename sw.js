// ShopMate AI — Service Worker v1.3.0
const CACHE_NAME = "shopmate-v1.3.0";
const urlsToCache = [
  "./",
  "./index.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// ---------- Install ----------
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
  );
  self.skipWaiting();
});

// ---------- Activate ----------
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(names => {
      return Promise.all(
        names.map(n => { if (n !== CACHE_NAME) return caches.delete(n); })
      );
    })
  );
  self.clients.claim();
});

// ---------- Fetch ----------
self.addEventListener("fetch", event => {
  // API call bypass (Google Apps Script)
  if (event.request.url.includes("script.google.com")) return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Background update
        fetch(event.request).then(fresh => {
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, fresh));
        }).catch(() => {});
        return cached;
      }
      return fetch(event.request).then(response => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      });
    })
  );
});

// ---------- Message (Skip Waiting) ----------
self.addEventListener("message", event => {
  if (event.data === "skipWaiting") {
    self.skipWaiting();
  }
});
