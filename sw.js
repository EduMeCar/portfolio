// ===== CONFIGURACIÓN =====
const CACHE_NAME = 'conciencia-sonora-v1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
  '/favicon.svg',
  // Agrega aquí otros recursos si los tienes:
  // '/styles.css',
  // '/script.js',
  // '/tu-audio.mp3'
];

// ===== INSTALACIÓN =====
self.addEventListener('install', event => {
  console.log('🟢 Service Worker instalándose...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('📦 Almacenando en caché los recursos esenciales');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('✅ Todos los recursos cacheados correctamente');
        return self.skipWaiting(); // Activar inmediatamente
      })
      .catch(error => {
        console.error('❌ Error al cachear:', error);
      })
  );
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', event => {
  console.log('🔥 Service Worker activado');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar cachés antiguas
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🎯 Service Worker listo para controlar clientes');
      return self.clients.claim();
    })
  );
});

// ===== ESTRATEGIA DE CACHÉ: Cache First, luego Network =====
self.addEventListener('fetch', event => {
  // Ignorar solicitudes que no son GET o de otro origen
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Si está en caché, devolverlo
        if (cachedResponse) {
          console.log('📨 Sirviendo desde caché:', event.request.url);
          return cachedResponse;
        }

        // Si no está en caché, buscar en la red
        console.log('🌐 Buscando en la red:', event.request.url);
        return fetch(event.request)
          .then(networkResponse => {
            // Verificar que la respuesta es válida
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }

            // Clonar la respuesta para guardarla en caché
            const responseToCache = networkResponse.clone();

            // Guardar en caché para próximas solicitudes
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
                console.log('💾 Guardado en caché:', event.request.url);
              });

            return networkResponse;
          })
          .catch(error => {
            console.error('❌ Error de red:', error);
            
            // Puedes devolver una página offline personalizada aquí
            // return caches.match('/offline.html');
            
            return new Response('🔌 Estás offline - Conciencia Sonora', {
              status: 408,
              statusText: 'Offline',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            });
          });
      })
  );
});

// ===== MENSAJES =====
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

console.log('🎵 Service Worker de Conciencia Sonora cargado');
