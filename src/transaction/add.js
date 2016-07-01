(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.add = function(queryDetails) {

        var callback = queryDetails.callback;
        var objectsToAdd = queryDetails.data;
        var totalObjectStoreAdded = 0;
        var keyPath = iDB.getKeyPathName(queryDetails.objectStoreName);
        queryDetails.mode = iDB.private.MODE_READ_WRITE;

        queryDetails.callback = function(objectStore) {
            _.each(objectsToAdd, function(objectToAdd) {
                var request = objectStore.add(objectToAdd);
                
                //error is handeled on db level

                request.onsuccess = function(e) {
                    //cache data
                    iDB.private.cache.addData(queryDetails.objectStoreName, objectToAdd);

                    ++totalObjectStoreAdded;
                    console.log("saved to db");
                    

                    objectToAdd[keyPath] = e.target.result;
                    if(totalObjectStoreAdded === objectsToAdd.length){
                        callback(objectsToAdd);
                    }
                };
            });
        };
        iDB.private.getObjectStore(queryDetails);
    };

})();