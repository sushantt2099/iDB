(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.private = iDB.private || {};


    
    var databaseName;
    var version;

    iDB.private.getDB = function(details) {
        if(details.databaseName){
            databaseName = details.databaseName;
        }
        if(details.version){
            version = details.version;
        }
        var onUpgradeNeeded = details.onUpgradeNeeded;

        var openRequest = indexedDB.open(databaseName, version);

        openRequest.onupgradeneeded = onUpgradeNeeded;

        openRequest.onsuccess = function(e) {
            console.log("running onsuccess");
            var db = e.target.result;
            if(details.callback){
                details.callback(db);
            }
        };

        openRequest.onerror = function(e) {
            //Do something for the error
            console.log(e);
            if(onError){
            	onError(e);
            }
        };
    };
    iDB.init = function(initDetails) {

        var registerObjectStore = function(e){
            console.log("running onupgradeneeded");
            var thisDB = e.target.result;
            var objectStoresInfo = iDB.private.getObjectStoresInfo();
            _.each(objectStoresInfo, function(objectStoreDetails){
            	var objectStoreName = objectStoreDetails.name;

                //create index
            	var createIndex = function(objectStore, indexes) {
                    var existingIndexes = objectStore.indexNames;
                    _.each(indexes, function(index){
                    	var indexExists = false;
                    	_.each(existingIndexes, function(existingIndex){
                    		 if (existingIndex === index.name) {
                                indexExists = true;
                            }
                    	});
                        if (!indexExists) {
                            objectStore.createIndex(index.name, index.name, { unique: index.unique });
                        }
                    });
                };
                //end of creating index
                
                var objectStore;
                if (!thisDB.objectStoreNames.contains(objectStoreName)) {
                    objectStore =
                        thisDB.createObjectStore(objectStoreName, { keyPath: objectStoreDetails.keyPath.name, autoIncrement: objectStoreDetails.keyPath.autoIncrement });
                    createIndex(objectStore, objectStoreDetails.indexes);
                } else {
                    objectStore = e.currentTarget.transaction.objectStore(objectStoreName);
                    createIndex(objectStore, objectStoreDetails.indexes);
                }
            });
        };
        initDetails.onUpgradeNeeded = registerObjectStore;
        iDB.private.getDB(initDetails);
    };
})();
