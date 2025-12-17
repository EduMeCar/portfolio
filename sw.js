// ===== SERVICE WORKER - EDUARDO MEJÍA PORTFOLIO =====
// Versión: 2.0 - Actualizado con estrategia híbrida

const CACHE_NAME = 'eduardo-mejia-portfolio-v2.0';
const RUNTIME_CACHE = 'eduardo-mejia-runtime-v2.0';

// Recursos esenciales para cachear durante la instalación
const STATIC_CACHE_URLS = [
  '/portfolio/',
  '/portfolio/index.html',
  '/portfolio/manifest.json',
  '/portfolio/style.min.css',
  '/portfolio/script.min.js',
  '/portfolio/icon-192x192.png',
  '/portfolio/icon-512x512.png',
  '/portfolio/favicon.svg'
];

// Recursos externos críticos
const EXTERNAL_CACHE_URLS = [
  'https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&family=Inter:wght@700;800;900&display=swap'
];

// ===== INSTALACIÓN =====
self.addEventListener('install', event => {
  console.log('🟢 [SW] Instalando Service Worker v2.0...');
  
  event.waitUntil(
    Promise.all([
      // Cachear recursos estáticos
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 [SW] Cacheando recursos estáticos');
        return cache.addAll(STATIC_CACHE_URLS).catch(err => {
          console.error('❌ [SW] Error cacheando estáticos:', err);
          // No fallar toda la instalación si algún recurso falla
          return Promise.resolve();
        });
      }),
      // Cachear recursos externos
      caches.open(CACHE_NAME).then(cache => {
        console.log('🌐 [SW] Cacheando recursos externos');
        return Promise.all(
          EXTERNAL_CACHE_URLS.map(url => 
            cache.add(url).catch(err => {
              console.warn('⚠️ [SW] No se pudo cachear:', url);
              return Promise.resolve();
            })
          )
        );
      })
    ]).then(() => {
      console.log('✅ [SW] Instalación completa');
      return self.skipWaiting();
    })
  );
});

// ===== ACTIVACIÓN =====
self.addEventListener('activate', event => {
  console.log('🔥 [SW] Activando Service Worker');
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Eliminar cachés obsoletas
          if (cacheName !== CACHE_NAME && cacheName !== RUNTIME_CACHE) {
            console.log('🗑️ [SW] Eliminando caché obsoleta:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('🎯 [SW] Service Worker activo y listo');
      return self.clients.claim();
    })
  );
});

// ===== ESTRATEGIA DE FETCH HÍBRIDA =====
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests no-GET
  if (request.method !== 'GET') return;
  
  // Ignorar Chrome extensions
  if (url.protocol === 'chrome-extension:') return;
  
  // Ignorar analytics y tracking
  if (url.hostname.includes('google-analytics') || 
      url.hostname.includes('googletagmanager')) {
    return;
  }
  
  // ESTRATEGIA: Network-First para HTML (siempre contenido fresco)
  if (request.headers.get('Accept')?.includes('text/html')) {
    event.respondWith(networkFirstStrategy(request));
    return;
  }
  
  // ESTRATEGIA: Cache-First para assets estáticos
  if (isStaticAsset(url)) {
    event.respondWith(cacheFirstStrategy(request));
    return;
  }
  
  // ESTRATEGIA: Network-First para APIs y contenido dinámico
  event.respondWith(networkFirstStrategy(request));
});

// ===== ESTRATEGIAS =====

// Network-First: Intenta red, fallback a caché
async function networkFirstStrategy(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  
  try {
    const networkResponse = await fetch(request, { 
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    if (networkResponse && networkResponse.status === 200) {
      // Guardar en caché runtime
      cache.put(request, networkResponse.clone());
      console.log('💾 [SW] Guardado en runtime cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('📨 [SW] Network falló, usando caché:', request.url);
    
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Si no hay caché, devolver página offline básica
    if (request.headers.get('Accept')?.includes('text/html')) {
      return new Response(
        createOfflinePage(),
        {
          status: 503,
          statusText: 'Service Unavailable',
          headers: { 'Content-Type': 'text/html; charset=utf-8' }
        }
      );
    }
    
    // Para otros recursos, lanzar el error
    throw error;
  }
}

// Cache-First: Usa caché si existe, sino red
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    console.log('📨 [SW] Sirviendo desde caché:', request.url);
    return cachedResponse;
  }
  
  console.log('🌐 [SW] Buscando en red:', request.url);
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
      console.log('💾 [SW] Guardado en runtime cache:', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.error('❌ [SW] Error en red:', error);
    
    // Para imágenes, devolver placeholder SVG
    if (request.destination === 'image') {
      return new Response(
        createPlaceholderImage(),
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// ===== HELPERS =====

function isStaticAsset(url) {
  const staticExtensions = ['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.woff', '.woff2', '.ttf'];
  return staticExtensions.some(ext => url.pathname.endsWith(ext));
}

function createOfflinePage() {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Sin conexión - Eduardo Mejía</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
          font-family: 'Space Mono', monospace;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          text-align: center;
          padding: 20px;
        }
        h1 {
          font-size: 3rem;
          margin-bottom: 1rem;
          color: #ff3300;
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 2rem;
          max-width: 600px;
        }
        button {
          background: #fff;
          color: #000;
          border: 4px solid #fff;
          padding: 15px 30px;
          font-family: inherit;
          font-weight: 900;
          font-size: 1rem;
          cursor: pointer;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          box-shadow: 8px 8px 0 #fff;
          transition: 0.2s;
        }
        button:hover {
          transform: translate(4px, 4px);
          box-shadow: 4px 4px 0 #fff;
        }
      </style>
    </head>
    <body>
      <h1>🔌 SIN CONEXIÓN</h1>
      <p>No hay conexión a internet en este momento. Algunas partes del sitio pueden estar disponibles en caché.</p>
      <button onclick="window.location.reload()">REINTENTAR</button>
    </body>
    </html>
  `;
}

function createPlaceholderImage() {
  return `
    <svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
      <rect width="400" height="300" fill="#1a1a1a"/>
      <text x="50%" y="50%" font-family="monospace" font-size="16" fill="#666" text-anchor="middle">
        Imagen no disponible
      </text>
    </svg>
  `;
}

// ===== MENSAJES DEL CLIENTE =====
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('⏭️ [SW] Saltando espera por petición del cliente');
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('🧹 [SW] Limpiando caché por petición del cliente');
    event.waitUntil(
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }).then(() => {
        console.log('✅ [SW] Caché limpiada completamente');
      })
    );
  }
});

// ===== BACKGROUND SYNC (Opcional) =====
self.addEventListener('sync', event => {
  if (event.tag === 'sync-contacts') {
    console.log('🔄 [SW] Sincronizando contactos...');
    // Implementar lógica de sincronización si es necesario
  }
});

console.log('🎵 Service Worker de Eduardo Mejía Portfolio cargado (v2.0)');
