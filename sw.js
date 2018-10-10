
var cacheStorageKey = 'minimal-pwa-26'
var cacheList = [
  '/',
  "index.html",
  "main.css",
  "e.png",
  "pwa-fonts.png",
  "data.json"
]

this.addEventListener('install', function (e) {
  self.skipWaiting(); //service worker被载入后立即激活，可保证sw.js每次都是最新的
  console.log('Cache event!');
  e.waitUntil(
    caches.open(cacheStorageKey).then(function (cache) {
      console.log('Adding to Cache:', cacheList)
      return cache.addAll(cacheList)
    }).then(function () {
      console.log('Skip waiting!')
      return self.skipWaiting()
    })
  ) 
  
  // e.waitUntil(
  //   self.skipWaiting()
  // )
})

this.addEventListener('activate', function (e) {
  console.log('Activate event')
  e.waitUntil(
    Promise.all([
      self.clients.claim(),
      caches.keys().then(cacheList => {
        return Promise.all(
          cacheList.map(cacheName => {
            if (cacheName !== cacheStorageKey) {
              return caches.delete(cacheName)
            }
          })
        )
      })
    ]).then(() => {
      // console.log('Clients claims.')
      // return self.clients.claim()
    })
  )
})

this.addEventListener('fetch', function (e) {
  e.respondWith(
    caches.match(e.request).then(function (response) {
      if (response) {
        return response
      }
      let request = e.request.clone();
      return fetch(request).then(res => {
        if (!res || res.status !== 200 || res.type !== 'basic') {
          return res;
        }

        let responseToCache = res.clone();
        caches.open(cacheStorageKey).then(cache => {
          cache.put(e.request, responseToCache);
        })

        return res;
      })
    })
  )
})