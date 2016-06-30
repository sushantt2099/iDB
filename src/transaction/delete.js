(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.delete = function(queryDetails) {

        var callback = queryDetails.callback;
        var totalDeleteObjects = 0;
        queryDetails.callback = function(db) {
        var keyPath = iDB.getKeyPathName(queryDetails.objectStoreName);
        
            _.each(queryDetails.objectsToDelete, function(objectToDelete) {


                /**

                    TODO: id can not be used to delete the data all the time
                **/
                var keyPathValue = objectToDelete[keyPath];
                var request = db.delete(keyPathValue);

                request.onerror = function(e) {
                    throw "could not delete  " + objectToDelete + e;
                };

                request.onsuccess = function(e) {
                    ++totalDeleteObjects;
                    iDB.private.cache.deleteData(queryDetails.objectStoreName, objectToDelete);

                    if (totalDeleteObjects === queryDetails.objectsToDelete.length) {
                        if (callback) {
                            callback(true);
                        }
                    }

                };
            });

        };
        iDB.private.getObjectStore(queryDetails);




    };

})();
