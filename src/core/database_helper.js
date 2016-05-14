(function(){
	window.iDB = window.iDB || {};
    iDB = window.iDB;
    var db;

    iDB.private.getDBInstance = function(details){
        if(db){
            details.onSuccess(db);
        }else{
            iDB.private.getDB({
                onSuccess: function(database){
                    db = database;
                    details.onSuccess(db);
                }
            });
        }
    };
    iDB.private.getObjectStore = function(details){
        var objectStoreName = details.objectStoreName;
        var mode = details.mode || "readwrite";
        var callback = details.callback;

        //check for all required details
        if(objectStoreName && callback){

        }else{
            throw "Either objectStoreName or callback is not provided";
        }

        if(db){
            callback(db.transaction([objectStoreName], mode)
                                .objectStore(objectStoreName));
        }else{
            iDB.private.getDBInstance({
                onSuccess: function(db){
                    callback(db.transaction([objectStoreName], mode)
                                .objectStore(objectStoreName));
                }
            });
        }
    };

    iDB.private.readAllData = function(details){

        var objectStoreName = details.objectStoreName;
        var callback = details.callback;
        var all = [];
        
        iDB.private.getObjectStore({
            callback: function(objectStore) {
                objectStore.openCursor(null, "prev").onsuccess = function(event) {
                    var cursor = event.target.result;
                    if (cursor) {
                        all.push(cursor.value);
                        cursor.continue();
                    } else {
                        console.log("finish all");

                        //store the data to the cache
                        if(callback){
                            callback(all);
                        }
                        
                    }

                };
            },
            mode: 'readonly',
            objectStoreName: objectStoreName
        });
    };

})();