self.addEventListener('install', function(event){
    console.log('Installing Service Worker ...',event);
    event.waitUntil(
        caches.open('static')
            .then(function(cache){
                console.log(' Precaching App Shell');
                cache.add('/src/js/app.js');
            })
    )
});

self.addEventListener('activate', function(event){
    console.log('Activating Service Worker', event);
});

self.addEventListener('fetch', function(event){

    event.respondWith(fetch(event.request));
});