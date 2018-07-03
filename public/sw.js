var CACHE_STATIC_NAME = 'static-v2.6';
var CACHE_DYNAMIC_NAME = 'dynamic-v3';


self.addEventListener('install', function(event){
    console.log('Installing Service Worker ...',event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
            .then(function(cache){
                console.log(' Precaching App Shell');
                // cache.add('/src/js/app.js');
                // cache.add('/index.html');
                
                cache.addAll([
                    '/',
                    '/index.html',
                    '/offline.html',
                    '/src/js/app.js',
                    '/src/js/feed.js',
                    '/src/js/promise.js',
                    '/src/js/fetch.js',
                    '/src/js/material.min.js',
                    '/src/css/app.css',
                    '/src/css/feed.css',
                    '/src/images/main-image.jpg',
                    'https://fonts.googleapis.com/css?family=Roboto:400,700',
                    'https://fonts.googleapis.com/icon?family=Material+Icons',
                    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
                ])
            })
    )
});

self.addEventListener('activate', function(event){
    console.log('Activating Service Worker', event);
    event.waitUntil(
        caches.keys()
        .then(function(keyList){
            return Promise.all(keyList.map(function(key) {
                if(key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                    console.log('Removing Old Cache --> ',key)
                    return caches.delete(key);
                }
            }))
        })
    );
});

// Network with cache fallback strategy --> Pretty Good

// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         caches.match(event.request) //To match current request with cached request it
// 		.then(function(response) {
// 			//If response found return it, else fetch again.
//             if(response) {
//                 return response
//             } else {
//                 // Applying Dynamic caching
//                 return fetch(event.request)
//                 .then(function(res){
//                   return caches.open(CACHE_DYNAMIC_NAME)
//                     .then(function(cache){
//                         cache.put(event.request.url,res.clone())
//                         return res;
//                     }).catch(function(){
                        
//                     });
//                 });
//             }
// 		})
// 		.catch(function(error) {
// 			return caches.open(CACHE_STATIC_NAME)
//                             .then(function(cache){
//                                return cache.match('/offline.html')
//            });
// 		})
//     )
// });

// CACHE ONLY STRATEGY --> Not Useful in many cases
self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request)
    )}
);