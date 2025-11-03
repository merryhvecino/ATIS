// Advanced offline cache with API caching for ATIS
const CACHE = 'atis-cache-v2'
const RUNTIME_CACHE = 'atis-runtime-v2'
const ASSETS = ['/', '/index.html', '/static/css/main.css', '/static/js/main.js']

// Install - cache shell assets
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then(cache => 
      cache.addAll(ASSETS).catch(() => {
        // Gracefully handle missing assets during dev
        console.log('Some assets not yet available')
      })
    )
  )
  self.skipWaiting()
})

// Activate - clean old caches
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(names => 
      Promise.all(
        names.filter(n => n !== CACHE && n !== RUNTIME_CACHE).map(n => caches.delete(n))
      )
    )
  )
  return self.clients.claim()
})

// Fetch - network first for API, cache first for assets
self.addEventListener('fetch', (e) => {
  const { request } = e
  const url = new URL(request.url)
  
  // Only handle http/https requests (ignore chrome-extension://, etc.)
  if (!url.protocol.startsWith('http')) {
    return
  }
  
  // API requests: network first, fallback to cache
  if (url.pathname.startsWith('/stops') || url.pathname.startsWith('/alerts') || 
      url.pathname.startsWith('/weather') || url.pathname.startsWith('/safety') ||
      url.pathname.startsWith('/reviews') || url.pathname.startsWith('/departures')) {
    e.respondWith(
      fetch(request)
        .then(resp => {
          const copy = resp.clone()
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy))
          return resp
        })
        .catch(() => caches.match(request))
    )
    return
  }
  
  // Static assets: cache first, fallback to network
  e.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached
      return fetch(request).then(resp => {
        if (resp.status === 200) {
          const copy = resp.clone()
          caches.open(RUNTIME_CACHE).then(cache => cache.put(request, copy))
        }
        return resp
      }).catch(() => {
        // Return a basic fallback for network errors
        return new Response('Network error', { status: 503 })
      })
    })
  )
})
