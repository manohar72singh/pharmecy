const CACHE_NAME = "medishop-cache-v1";
const urlsToCache = ["/", "/index.html", "/manifest.json", "/icon-512.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)),
  );
});

self.addEventListener("fetch", (event) => {
  // Only cache GET requests
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(event.request).catch(() => {
        // Return offline fallback for navigation requests
        if (event.request.mode === "navigate") {
          return caches.match("/index.html");
        }
      });
    }),
  );
});
