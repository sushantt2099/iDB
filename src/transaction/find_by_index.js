(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.findByIndex = function(queryDetails) {
        var objectStoreName = queryDetails.objectStoreName;
        var callback = queryDetails.callback;
        var indexName = queryDetails.indexName;
        var indexValue = queryDetails.indexValue;

        //try in the cache
        if (iDB.private.cache.isAllDataRetrived(objectStoreName)) {
            callback(iDB.private.cache.getIndexedData(objectStoreName, indexName, indexValue));
            return;
        }

        //indexed db check
        iDB.private.getObjectStore({
            callback: function(objectStore) {
                var index = objectStore.index(indexName);

                //name is some value
                var request = index.openCursor(value);
                var all = [];

                request.onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        all.push(cursor.value);
                        cursor.continue();
                    } else {
                        if(callback){
                            callback(all);
                        }
                    }
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
