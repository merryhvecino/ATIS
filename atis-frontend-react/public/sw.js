// Basic offline cache using service worker (create-react-app compatible pattern)
const CACHE = 'atis-cache-v1'
const ASSETS = ['/', '/index.html']

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)))
})

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then(res => res || fetch(e.request).then(resp => {
      const copy = resp.clone()
      caches.open(CACHE).then(cache => cache.put(e.request, copy))
      return resp
    }))
  )
})
