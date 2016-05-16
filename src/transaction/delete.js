(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.delete = function(queryDetails) {

        var callback = queryDetails.callback;
        var totalDeleteObjects = 0;
        queryDetails.callback = function(db) {
            _.each(queryDetails.objectsToDelete, function(objectToDelete) {
                var id = objectToDelete.id;
                var request = db.delete(id);

                request.onerror = function(e) {
                    throw "could not delete  " + objectToDelete + e;
                };

                request.onsuccess = function(e) {
                    ++totalDeleteObjects;
                    if (totalDeleteObjects === queryDetails.objectsToDelete.length) {
                        iDB.private.cache.deleteData(queryDetails);
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
