(function(){
	window.iDB = window.iDB || {};
    iDB = window.iDB;
    var db;
    iDB.private = iDB.private || {};

    var databaseHitListner = [];
    iDB.private.MODE_READ_WRITE = "readwrite";
    iDB.private.MODE_READ = "read";
    iDB.private.callbackOnDatabaseHit = function(callback){
        if(databaseHitListner.indexOf(callback) > -1){
            return;
        }
        databaseHitListner.push(callback);
    };
    
    iDB.private.getDBInstance = function(details){
        //notify database hit
        iDB.helper.callFunctionsWithArgument(databaseHitListner, [details]);
        
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

        iDB.helper.callFunctionsWithArgument(databaseHitListner, []);
        var objectStoreName = details.objectStoreName;
        var mode = details.mode || "readwrite";
        var callback = details.callback;

        //check for all required details
        if(objectStoreName && callback){

        }else{
            throw "Either objectStoreName or callback is not provided";
        }

        iDB.private.getDBInstance({
            onSuccess: function(db){
                callback(db.transaction([objectStoreName], mode)
                            .objectStore(objectStoreName));
            }
        });
        
    };

    iDB.private.readAllData = function(details){

        var objectStoreName = details.objectStoreName;
        var callback = details.callback;
        var all = [];
        
        var queryDetails = {
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
        };
        iDB.private.getObjectStore(queryDetails);
    };

})();