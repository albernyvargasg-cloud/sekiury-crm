const CACHE = 'sekiury-crm-v3';

// Instalar — activar inmediatamente sin cachear
self.addEventListener('install', e => {
  self.skipWaiting();
});

// Activar — borrar TODOS los caches viejos
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Network first — siempre busca versión más reciente del servidor
self.addEventListener('fetch', e => {
  if (e.request.url.includes('api.anthropic.com')) return;
  if (e.request.url.includes('googleapis.com')) return;
  if (e.request.url.includes('cdnjs')) return;
  if (e.request.url.includes('jsdelivr')) return;

  e.respondWith(
    fetch(e.request).then(res => {
      if (res.ok) {
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});
