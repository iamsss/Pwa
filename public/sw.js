importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

var CACHE_STATIC_NAME = 'static-v2.47';
var CACHE_DYNAMIC_NAME = 'dynamic-v3';
var STATIC_FILES = [
    '/',
    '/index.html',
    '/offline.html',
    '/src/js/app.js',
    '/src/js/feed.js',
    '/src/js/promise.js',
    '/src/js/fetch.js',
    '/src/js/idb.js',
    '/src/js/material.min.js',
    '/src/css/app.css',
    '/src/css/feed.css',
    '/src/images/main-image.jpg',
    'https://fonts.googleapis.com/css?family=Roboto:400,700',
    'https://fonts.googleapis.com/icon?family=Material+Icons',
    'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];



// function trimCache(cacheName, maxItems) {
//     caches.open(cacheName)
//         .then(function (cache) {
//             return cache.keys()
//             .then(function (keys) {
//                 if (keys.length > maxItems) {
//                     cache.delete(keys[0])
//                         .then(trimCache(cacheName, maxItems));
//                 }
//             })
//         });
        
// }

function isInArray(string, array) {
    for (var i = 0; i < array.length; i++) {
        if (array[i] === string) {
            return true;
        }
    }
    return false;
}
self.addEventListener('install', function (event) {
    console.log('Installing Service Worker ...', event);
    event.waitUntil(
        caches.open(CACHE_STATIC_NAME)
        .then(function (cache) {
            console.log(' Precaching App Shell');
            // cache.add('/src/js/app.js');
            // cache.add('/index.html');

            cache.addAll(STATIC_FILES)
        })
    )
});

self.addEventListener('activate', function (event) {
    console.log('Activating Service Worker', event);
    event.waitUntil(
        caches.keys()
        .then(function (keyList) {
            return Promise.all(keyList.map(function (key) {
                if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
                    console.log('Removing Old Cache --> ', key)
                    return caches.delete(key);
                }
            }))
        })
    );
    event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', function (event) {
    var url = 'https://loindia-6cb36.firebaseio.com/posts';
    // Cache then Network Strategy Only this part
    if (event.request.url.indexOf(url) > -1) {
        event.respondWith(
            fetch(event.request)
                    .then(function (res) {
                        var clonedRes = res.clone();
                        clonedRes.json()
                        .then(function(data){
                            clearAllData('posts').then(function(){
                            writeData('posts', data);
                            })
                        })
                        return res;
                    }) 
        );
    }
    // Cache Only Strategy For Static File
    else if (isInArray(event.request.url, STATIC_FILES)) {
        event.respondWith(
            caches.match(event.request)
        )
    }
    // cache with network fallback strategy
    else {
        event.respondWith(
            caches.match(event.request) //To match current request with cached request it
            .then(function (response) {
                //If response found return it, else fetch again.
                if (response) {
                    return response
                } else {
                    // Applying Dynamic caching
                    return fetch(event.request)
                        .then(function (res) {
                            return caches.open(CACHE_DYNAMIC_NAME)
                                .then(function (cache) {
                                    // trimCache(CACHE_DYNAMIC_NAME,3);
                                    cache.put(event.request.url, res.clone())
                                    return res;
                                }).catch(function () {

                                });
                        });
                }
            })
            .catch(function (error) {

                return caches.open(CACHE_STATIC_NAME)
                    .then(function (cache) {
                        if (event.request.headers.get('accept').includes('text/html')) {
                            return cache.match('/offline.html')
                        }
                    });
            })
        );
    }

});


// cache with network fallback strategy --> Pretty Good

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
//   return caches.open(CACHE_DYNAMIC_NAME)
//     .then(function(cache){
//         cache.put(event.request.url,res.clone())
//         return res;
//     }).catch(function(){

//     });
// });
//             }
// 		})
// 		.catch(function(error) {
// return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache){
//                    return cache.match('/offline.html')
//            });
// 		})
//     )
// });

// CACHE ONLY STRATEGY --> Not Useful in many cases
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         caches.match(event.request)
//     )}
// );

//Network Only Strategy --> Boring no use of sw
// self.addEventListener('fetch', function(event){
//     event.respondWith(
//         fetch(event.request)
//     )}
// );

// Network with Cache fallback strategy --> But 
// in this we are not using advantage of performance in cache
// And if connection is slow than we face horrible u.i experiance
// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         fetch(event.request)
//         .then(function (res) {
//             return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function (cache) {
//                     cache.put(event.request.url, res.clone())
//                     return res;
//                 }).catch(function () {

//                 });

//         })
//         .catch(function (err) {
//             return caches.match(event.request) //To match current request with cached request it
//                 .then(function (response) {
//                     //If response found return it, else fetch again.
//                     if (response) {
//                         return response
//                     } else {

//                         return caches.open(CACHE_STATIC_NAME)
//                             .then(function (cache) {
//                                 return cache.match('/offline.html')
//                             })
//                     }
//                 })
//         })
//     )
// });


self.addEventListener('sync', function(event){
    console.log('Service Worker Syncing');
    if(event.tag === 'sync-new-post') {
        console.log('In the Right Syncing new Post');

        event.waitUntil(
            readAllData('sync-posts').then(function(data){
                for(var dt of data) {
                    fetch('https://loindia-6cb36.firebaseio.com/posts.json', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Accept': 'application/json'
                        },
                        body: JSON.stringify({
                          id: dt.id,
                          title: dt.title,
                          location: dt.location,
                          image: dt.image
                        })
                      }).then(function(res) {
                        console.log('Data sent',res);
                        if(res.ok){
                            res.json()
                                .then(function(resData){
                                    deleteItemsFromData('sync-posts',resData.id);
                                })
                            }
                      })
                      .catch(function(err) {
                        console.log('Error while sending data', err);
                      });
                }
            })
        );
    }
})

self.addEventListener('notificationclick', function(event) {
    var notification = event.notification;
    var action = event.action;

    console.log(notification);

    if(action === 'confirm') {
        console.log('Confirm was Chosen');
        notification.close();
    }else {
        console.log(action);
        notification.close();
    }
});

self.addEventListener('notificationclose',function(event) {
    console.log('notification was closed', event);
})


self.addEventListener('push', function(event) {
    console.log('Push Notification Recieved');
    var data = {title: 'New', content:'Something new happended'};
    if(event.data){
        data = JSON.parse(event.data.text());
    }

    var options = {
        body: data.content,
        icon: '/src/images/app-icon-96x96.png',
        badge: '/src/images/app-icon-96x96.png'
    };

    event.waitUntil(
        self.registration.showNotification(data.title,options)
    );
});
