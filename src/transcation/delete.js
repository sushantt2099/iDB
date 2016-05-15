(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.delete = function(queryDetails) {

        var callback = queryDetails.callback;
        var id = queryDetails.id;

        queryDetails.onSuccess = function(db) {

            var request = db.delete(id);
            request.onerror = function(e) {
                if (callback) {
                    callback(false);
                }
            };

            request.onsuccess = function(e) {
                console.log("item deleted");
                if (callback) {
                    callback(true);
                }
            };

        };
        iDB.private.getObjectStore(queryDetails);
    };

})();
