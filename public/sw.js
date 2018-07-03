self.addEventListener('install', function(event){
    console.log('Installing Service Worker ...',event);
    event.waitUntil(
        caches.open('static')
            .then(function(cache){
                console.log(' Precaching App Shell');
                // cache.add('/src/js/app.js');
                // cache.add('/index.html');
                
                cache.addAll([
                    '/',
                    '/index.html',
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
});

self.addEventListener('fetch', function(event){
    event.respondWith(
        caches.match(event.request) //To match current request with cached request it
		.then(function(response) {
			//If response found return it, else fetch again.
			return response || fetch(event.request);
		})
		.catch(function(error) {
			console.log("Error: ", error);
		})
    )
});