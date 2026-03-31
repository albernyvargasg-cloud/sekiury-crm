const CACHE = 'sekiury-crm-v1';
const ASSETS = [
  '/sekiury-crm/',
  '/sekiury-crm/index.html',
  '/sekiury-crm/manifest.json',
  '/sekiury-crm/icon-192x192.png',
  '/sekiury-crm/icon-512x512.png',
  'https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&family=DM+Serif+Display&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Instalar — cachear recursos
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(ASSETS).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Activar — limpiar caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first para assets, network first para API
self.addEventListener('fetch', e => {
  // No interceptar llamadas a Anthropic API
  if (e.request.url.includes('api.anthropic.com')) return;

  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(res => {
        // Solo cachear respuestas válidas de nuestro dominio
        if (res.ok && e.request.url.includes('github.io')) {
          caches.open(CACHE).then(cache => cache.put(e.request, res.clone()));
        }
        return res;
      }).catch(() => cached);
    })
  );
});
