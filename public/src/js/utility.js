var dbPromise = idb.open('posts-store', 1 , function
(db){
    if(!db.objectStoreNames.contains('posts')) { 
    db.createObjectStore('posts', {keyPath: 'id'});
    }

    if(!db.objectStoreNames.contains('sync-posts')) { 
        db.createObjectStore('sync-posts', {keyPath: 'id'});
        }
});

function writeData(st,data){
   return dbPromise.then(function(db){
                               
        var tx = db.transaction(st,'readwrite');
        var store = tx.objectStore(st);
        for( var key in data){
                store.put(data[key]);         
        }
        return tx.complete;
    })
}

function readAllData(st) {
    return dbPromise
        .then(function(db){
            var tx = db.transaction(st,'readonly');
            var store = tx.objectStore(st);
            return store.getAll();
        })
}

function clearAllData(st) {
    return dbPromise
        .then(function(db) {
            var tx = db.transaction(st, 'readwrite');
            var store = tx.objectStore(st);
            store.clear();
        })
}

function deleteItemsFromData(st,Id) {
    return dbPromise
    .then(function(db) {
        var tx = db.transaction(st, 'readwrite');
        var store = tx.objectStore(st);
        store.delete(Id);
        return tx.complete;
    }).then(function(){
        console.log('Item Deleted');
    })
}