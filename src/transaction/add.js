(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.add = function(queryDetails) {

        var callback = queryDetails.callback;
        var objectsToAdd = queryDetails.data;
        var totalObjectStoreAdded = 0;

        queryDetails.callback = function(objectStore) {
            _.each(objectsToAdd, function(objectToAdd) {
                var request = objectStore.add(objectToAdd);
                request.onerror = function(e) {
                    console.log("DataBaseUtility:save: error");
                    console.log(e);
                    throw "Could not store " + objectToAdd;
                };

                request.onsuccess = function(e) {
                    ++totalObjectStoreAdded;
                    console.log("saved to db");
                    objectToAdd.id = e.target.result;
                    if(totalObjectStoreAdded === objectsToAdd.length){
                        callback();
                    }
                };
            });
        };
        iDB.private.getObjectStore(queryDetails);
    };

})();
