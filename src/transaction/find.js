(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.find = function(queryDetails) {
        var id = queryDetails.id;
        var objectStoreName = queryDetails.objectStoreName;
        var callback = queryDetails.callback;

        iDB.private.getObjectStore({
            callback: function(objectStore) {
                var request;
                try {
                    request = objectStore.get(id);
                } catch (e) {
                    console.error("error");
                    callback(false);
                }
                request.onsuccess = function(e) {
                    callback(e.target.result);
                };
                request.onerror = function(e) {
                    console.log(e);
                    callback(false);
                };
            },
            mode: 'readonly',
            objectStoreName: objectStoreName
        });


    };

})();
