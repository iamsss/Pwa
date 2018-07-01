self.addEventListener('install', function(event){
    console.log('Installing Service Worker ...',event);
});

self.addEventListener('activate', function(event){
    console.log('Activating Service Worker', event);
});

self.addEventListener('fetch', function(event){

    console.log('Fetching Event ...',event);
    event.respondWith(fetch(event.request));
});