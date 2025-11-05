const CACHE_NAME = "sonora-v1";
const urlsToCache = [
    "./",
    "./index.html",
    "./manifest.json",
    "./favicon.svg",
    "./logo-192.png",
    "./logo-512.png",
    "./lead-magnet.pdf",
    "./micancion.mp3"
];

self.addEventListener("install", e => {
    e.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))
    );
});

self.addEventListener("fetch", e => {
    e.respondWith(
        caches.match(e.request).then(resp => resp || fetch(e.request))
    );
});
