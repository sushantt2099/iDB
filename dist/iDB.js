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

})();;(function() {
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
            version = details.databaseName;
        }
        var onUpgradeNeeded = details.onUpgradeNeeded;
        var onSuccess = details.onSuccess;
        var onError = details.onError;

        var openRequest = indexedDB.open(databaseName, version);

        openRequest.onupgradeneeded = onUpgradeNeeded;

        openRequest.onsuccess = function(e) {
            console.log("running onsuccess");
            var db = e.target.result;
            if(onSuccess){
            	onSuccess(db);
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

            _.each(iDB.private.OBJECT_STORES, function(objectStoreDetails){
            	var objectStoreName = objectStoreDetails.name;
            	var createIndex = function(objectStore, indexes) {
                    var existingIndexes = objectStore.indexNames;
                    _.each(indexes, function(index){
                    	var indexExists = false;
                    	_.each(existingIndexes, function(existingIndexe){
                    		 if (existingIndexe === index.name) {
                                indexExists = true;
                            }
                    	});
                        if (!indexExists) {
                            objectStore.createIndex(index.name, index.name, { unique: index.unique });
                        }
                    });
                    
                };
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
;(function(){
	window.iDB = window.iDB || {};
    iDB = window.iDB;
    
	iDB.registerObjectStore = function(details){
		
		details.keyPath.name = (details.keyPath && details.keyPath.name) || 'id';
		details.keyPath.autoIncrement = (details.keyPath && details.keyPath.autoIncrement) || true;
		iDB.private.OBJECT_STORES = iDB.OBJECT_STORES || [];
		iDB.private.OBJECT_STORES.push(details);
	};

})();;(function(){
	window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.private = iDB.private || {};
    iDB.private.cache = {};

    //cache data is stored in this var
    iDB.private.cache.data = {};


    iDB.private.cache.getCache = function(objectStoreName){
        return (iDB.private.cache[objectStoreName] = iDB.private.cache[objectStoreName] || {});
    };

    iDB.private.cache.isAllDataRetrived = function(objectStoreName){
        return iDB.private.cache.getCache(objectStoreName).aDataRetrived;
    };

    iDB.private.cache.setAllDataRetrived = function(objectStoreName){
        iDB.private.cache.getCache(objectStoreName).aDataRetrived = true;
    };

    iDB.private.cache.setData = function(details){
        iDB.private.cache.getCache(details.objectStoreName).all = details.all;
    };

    iDB.private.cache.getAllData = function(objectStoreName){
        return iDB.private.cache.getCache(details.objectStoreName).all;
    };


    iDB.private.cache.addData = function(dataDetails){
    	var objectStoreDetails = dataDetails.objectStoreDetails;
    	var key = objectStoreDetails.keyPath.name;



    	var all = iDB.private.cache.getAllData(objectStoreDetails.name);
    	var dataExist = false;

    	//search
    	for(var i = 0; i < all.length; i++){
    		var data = all[i];
    		if(data[key] === dataDetails.data[key]){
    			//update the data if key exists
    			data[key] = dataDetails.data;
    			dataExist = true;
    			break;
    		}
    	}

    	//add data if it does not exists
    	if(!dataExist){
    		all.push(dataDetails.data);
    	}
    };

    iDB.private.cache.deleteData = function(dataDetails){
    	var objectStoreDetails = dataDetails.objectStoreDetails;
    	var key = objectStoreDetails.keyPath.name;


    	var all = iDB.private.cache.getAllData(objectStoreDetails.name);
    	

    	//search
    	for(var i = 0; i < all.length; i++){
    		var data = all[i];
    		if(data[key] === dataDetails.data[key]){
    			all.splice(i, 1);
    			break;
    		}
    	}

    };




})();;(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.all = function(queryDetails) {
        var objectStoreName = queryDetails.objectStore;
        var start = queryDetails.start;
        var end = queryDetails.end;

        // check the cache and return all
        if (iDB.private.cache.isAllDataRetrived(objectStoreName)) {
            objectStoreName.callback(cache.all);
            return;
        }

        iDB.private.readAllData({
        	objectStoreName: objectStoreName,
        	callback: function(allData){
        		//store the data to the cache
        		iDB.private.cache.setAllDataRetrived(objectStoreName);
        		iDB.private.cache.setData({
        			objectStoreName: objectStoreName,
        			all: allData
        		});
        		
        	}
        });




    };

})();
