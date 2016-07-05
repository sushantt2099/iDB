(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.save = function(queryDetails) {

        var callback = queryDetails.callback;
        var objectsToAdd = queryDetails.data;
        var totalObjectStoreAdded = 0;
        var keyPath = iDB.getKeyPathName(queryDetails.objectStoreName);
        queryDetails.mode = iDB.private.MODE_READ_WRITE;

        queryDetails.callback = function(objectStore) {
            _.each(objectsToAdd, function(objectToAdd) {
                var update = false;
                var request;
                if(objectToAdd.hasOwnProperty(keyPath)){
                    //update
                    request = objectStore.put(objectToAdd);
                    update = true;
                }else{
                    //save
                    request = objectStore.add(objectToAdd);
                }
                
                
                //error is handeled on db level

                request.onsuccess = function(e) {
                    //cache data
                    if(update){
                        iDB.private.cache.updateData({
                            objectStoreName: queryDetails.objectStoreName,
                            data: objectToAdd
                        });
                    }else{
                        iDB.private.cache.addData(queryDetails.objectStoreName, objectToAdd);    
                        objectToAdd[keyPath] = e.target.result;
                    }
                    

                    ++totalObjectStoreAdded;
                    console.log("saved to db");
                    
                    if(totalObjectStoreAdded === objectsToAdd.length){
                        callback(objectsToAdd);
                    }
                };
            });
        };
        iDB.private.getObjectStore(queryDetails);
    };

})();