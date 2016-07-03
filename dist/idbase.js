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
            details.callback(db);
        }else{
            iDB.private.getDB({
                callback: function(database){
                    db = database;
                    details.callback(db);
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
            callback: function(db){
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

})();;(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.private = iDB.private || {};
    iDB.helper = iDB.helper || {};

    iDB.helper.callFunctionsWithArgument = function(functions, args) {
        _.each(functions, function(functionToCall) {
            functionToCall.apply(window, args);
        });
    };

    iDB.helper.objectPropAsArray = function(objectToConvert) {
        var array = [];
        for (var prop in objectToConvert) {
            if (objectToConvert.hasOwnProperty(prop)) {
                array.push(prop);
            }
        }
        return array;
    };

    iDB.helper.eachObjectProperty = function(objectToIterate, callback) {
        if (!callback) {
            return;
        }
        for (var property in objectToIterate) {
            if (objectToIterate.hasOwnProperty(property)) {
                callback(property);
            }
        }
    };

    iDB.helper.filterObjectProperties = function(objectToFilter, propertiesToFilter) {
        var filteredObject = {};
        iDB.helper.eachObjectProperty(propertiesToFilter, function(prop) {
            if (objectToFilter[prop]) {
                filteredObject[prop] = objectToFilter[prop];
            }
        });
        return filteredObject;
    };

    iDB.helper.updateQueryStringParameter = function(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    };

    iDB.helper.isArray = function(obj) {
        if (Object.prototype.toString.call(obj) === '[object Array]') {
            return true;
        }
        return false;
    };

})();
;(function() {
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
;(function(){
	window.iDB = window.iDB || {};
	var OBJECT_STORES = [];
    iDB = window.iDB;
    
    iDB.private.getObjectStoresInfo = function(){
    	return OBJECT_STORES;
    };

    /*
		format: {
			name: ,
			indexes: [
				{
					name: ,
					unique: true/false
				}
			]
			keyPath: {
				name: ,
				autoIncrement: true/false
			}
		}
    */
	iDB.registerObjectStore = function(objectStoresInfo){
		_.each(objectStoresInfo, function(objectStoreInfo){
			objectStoreInfo.keyPath = objectStoreInfo.keyPath || {};
			objectStoreInfo.keyPath.name = (objectStoreInfo.keyPath && objectStoreInfo.keyPath.name) || 'id';
			objectStoreInfo.keyPath.autoIncrement = (objectStoreInfo.keyPath && objectStoreInfo.keyPath.autoIncrement) || true;
			OBJECT_STORES = OBJECT_STORES || [];
			if(OBJECT_STORES.indexOf(objectStoreInfo) < 0){
				OBJECT_STORES.push(objectStoreInfo);		
			}
		});
		
	};
	iDB.getObjectStoreDetails = function(objectStoreName){
		var objectStoreDetails;
		_.each(OBJECT_STORES, function(objectStore){
			if(objectStore.name === objectStoreName){
				objectStoreDetails =  objectStore;
			}
		});
		return objectStoreDetails;
	};

	iDB.getKeyPathName = function(objectStoreName, objectStoreDetails){
		if(objectStoreDetails){
			return objectStoreDetails.keyPath.name;
		}
		return iDB.getObjectStoreDetails(objectStoreName).keyPath.name;
	};

	iDB.getObjectStoreIndexes = function(objectStoreName, objectStoreDetails){
		if(objectStoreDetails){
			return objectStoreDetails.indexes;
		}
		return iDB.getObjectStoreDetails(objectStoreName).indexes;	
	};

})();;(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.add = function(queryDetails) {

        var callback = queryDetails.callback;
        var objectsToAdd = queryDetails.data;
        var totalObjectStoreAdded = 0;
        var keyPath = iDB.getKeyPathName(queryDetails.objectStoreName);
        queryDetails.mode = iDB.private.MODE_READ_WRITE;

        queryDetails.callback = function(objectStore) {
            _.each(objectsToAdd, function(objectToAdd) {
                var request = objectStore.add(objectToAdd);
                
                //error is handeled on db level

                request.onsuccess = function(e) {
                    //cache data
                    iDB.private.cache.addData(queryDetails.objectStoreName, objectToAdd);

                    ++totalObjectStoreAdded;
                    console.log("saved to db");
                    

                    objectToAdd[keyPath] = e.target.result;
                    if(totalObjectStoreAdded === objectsToAdd.length){
                        callback(objectsToAdd);
                    }
                };
            });
        };
        iDB.private.getObjectStore(queryDetails);
    };

})();;(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.all = function(queryDetails) {
        var objectStoreName = queryDetails.objectStoreName;

        // check the cache and return all
        if (iDB.private.cache.isAllDataRetrived(objectStoreName)) {
            queryDetails.callback(iDB.private.cache.getAllDataCopy(objectStoreName));
            return;
        }

        iDB.private.readAllData({
        	objectStoreName: objectStoreName,
        	callback: function(allData){
        		
        		//store the data to the cache
        		iDB.private.cache.setAllData({
        			objectStoreName: objectStoreName,
        			all: allData
        		});
                queryDetails.callback(allData);
        		
        	}
        });
    };

})();
;(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.private = iDB.private || {};
    iDB.private.cache = {};

    //cache data is stored in this var
    iDB.private.cache.data = {};


    iDB.private.cache.getCache = function(objectStoreName) {
        return (iDB.private.cache[objectStoreName] = iDB.private.cache[objectStoreName] || {});
    };

    iDB.private.cache.isAllDataRetrived = function(objectStoreName) {
        return iDB.private.cache.getCache(objectStoreName).aDataRetrived;
    };

    iDB.private.cache.setAllDataRetrived = function(objectStoreName) {
        iDB.private.cache.getCache(objectStoreName).aDataRetrived = true;
    };


    iDB.private.cache.setAllData = function(details) {
        iDB.private.cache.setAllDataRetrived(details.objectStoreName);

        var cache = iDB.private.cache.getCache(details.objectStoreName);
        //store all data in the cache
        cache.all = details.all;

        //index the data in the cache
        var indexes = iDB.getObjectStoreIndexes(details.objectStoreName);
        _.each(details.all, function(object) {
            iDB.private.cache.indexData(cache, object, indexes);
        });
        //end of the indexing of data
    };

    /*  
        data is indexed in the cache as cache.index.indexName.indexValue
    */

    iDB.private.cache.indexData = function(cache, object, indexes) {
        _.each(indexes, function(index) {
            cache.index = cache.index || [];
            var indexName = index.name;
            var indexValue = object[indexName];


            //initialize
            cache.index[indexName] = cache.index[indexName] || [];
            cache.index[indexName][indexValue] = cache.index[indexName][indexValue] || [];
            // end initialization 

            //store data to index
            if (index.unique) {
                cache.index[indexName][indexValue] = object;

            } else {
                cache.index[indexName][indexValue].push(object);
            }
            // end store data to index
        });
    };

    iDB.private.cache.removeDataFromIndex = function(cache, object, indexes) {

        _.each(indexes, function(index) {
            cache.index = cache.index || [];
            var indexName = index.name;
            var indexValue = object[indexName];

            if (index.unique) {
                delete cache.index[indexName][indexValue];

            } else {
                var objectIndex = cache.index[indexName][indexValue].indexOf(object);
                cache.index[indexName][indexValue].splice(objectIndex, 1);
            }
            // end store data to index
        });

    };

    iDB.private.cache.getIndexedData = function(objectStoreName, indexName, indexValue) {
        return iDB.private.cache.getCache(objectStoreName).index[indexName][indexValue];
    };

    iDB.private.cache.getAllData = function(objectStoreName) {
        return iDB.private.cache.getCache(objectStoreName).all;
    };

    iDB.private.cache.getAllDataCopy = function(objectStoreName) {
        var clone = [];
        var data = iDB.private.cache.getCache(objectStoreName).all;
        _.each(data, function(object){
            clone.push(_.clone(object));
        });
        return clone;
    };

    iDB.private.cache.addData = function(objectStoreName, objectToAdd) {
        if(!(iDB.private.cache.isAllDataRetrived(objectStoreName))){
            return;
        }

        var all = iDB.private.cache.getAllData(objectStoreName);
        if (all) {
            all.push(objectToAdd);
            //index data
            var cache = iDB.private.cache.getCache(objectStoreName);
            iDB.private.cache.indexData(cache, objectToAdd, iDB.getObjectStoreIndexes(objectStoreName));
        }




    };

    iDB.private.cache.updateData = function(dataDetails) {
        
        var objectStoreName = dataDetails.objectStoreName;
        if(!(iDB.private.cache.isAllDataRetrived(objectStoreName))){
            return;
        }
        var objectStoreDetails = iDB.getObjectStoreDetails(objectStoreName);
        var keyPathName = iDB.getKeyPathName(objectStoreName);

        var all = iDB.private.cache.getAllData(objectStoreName);
        var dataExist = false;

        //search
        for (var i = 0; i < all.length; i++) {
            var data = all[i];
            if (data[keyPathName] === dataDetails.data[keyPathName]) {
                //update the data if key exists
                all[i] = dataDetails.data;
                break;
            }
        }
    };

    iDB.private.cache.deleteData = function(objectStoreName, objectToDelete) {

        if(!(iDB.private.cache.isAllDataRetrived(objectStoreName))){
            return;
        }
        var objectStoreDetails = iDB.getObjectStoreDetails(objectStoreName);
        var keyPathName = iDB.getKeyPathName(undefined, objectStoreDetails);
        var indexes = iDB.getObjectStoreIndexes(undefined, objectStoreDetails);

        var all = iDB.private.cache.getAllData(objectStoreName);
        var cache = iDB.private.cache.getCache(objectStoreName);


        for (var i = 0; i < all.length; i++) {
            var data = all[i];
            if (data[keyPathName] === objectToDelete[keyPathName]) {
                iDB.private.cache.removeDataFromIndex(cache, objectToDelete, indexes);
                all.splice(i, 1);
                break;
            }
        }

    };

})();
;(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.delete = function(queryDetails) {

        var callback = queryDetails.callback;
        var totalDeleteObjects = 0;
        queryDetails.callback = function(db) {
        var keyPath = iDB.getKeyPathName(queryDetails.objectStoreName);
        
            _.each(queryDetails.objectsToDelete, function(objectToDelete) {
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
                            callback(queryDetails.objectsToDelete);
                        }
                    }

                };
            });

        };
        iDB.private.getObjectStore(queryDetails);




    };

})();
;(function() {
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
;(function() {
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
;(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    var WHERE_CONDITION_OPERATIONS = {
        'greaterThan': function(modelData, property, value) {
            return (modelData[property] > value);
        },
        'equalTo': function(modelData, property, value) {
            return (modelData[property] == value);
        },
        'lessThan': function(modelData, property, value) {
            return (modelData[property] < value );
        },
        'lessThanEqualTo': function(modelData, property, value) {
            return (modelData[property] <= value );
        },
        'greaterThanEqualTo': function(modelData, property, value) {
            return (modelData[property] >= value  );
        },
        'notEqualTo': function(modelData, property, value) {
            return (modelData[property] != value  );
        }
    };

    var validateCondition = function(data, condition) {
        var conditionExecuter = WHERE_CONDITION_OPERATIONS[condition.operator];
        return conditionExecuter(data, condition.property, condition.value);
    };

    iDB.where = function(queryDetails) {

        var conditions = queryDetails.conditions;
        var callback = queryDetails.callback;

        //validate condition
        _.each(conditions, function(condition) {
            if (!condition.hasOwnProperty("property")) throw "Property not found for query " + JSON.stringify(condition);
            if (!condition.hasOwnProperty("value")) throw "Value not found for query " + JSON.stringify(condition);
        });

        console.log("BaseModel:where valid condition");
        queryDetails.callback = function(all) {
            var searchList = [];
            _.each(all, function(dataInQuestion){
                var match = true;
                _.each(conditions, function(condition, conditionIndex){
                    //for multiple conditions i.e or conditions
                    if (conditionIndex === 0) {
                        match = validateCondition(dataInQuestion, condition);
                    } else {
                        match = match || validateCondition(dataInQuestion, condition);
                    }

                    if (match) {
                        while (condition.and) {
                            if(conditionIndex === 0){
                                match = validateCondition(dataInQuestion, condition.and);
                            }else{
                                //no need to check the condition since anyother condition is already true
                            }
                            
                            if (!match) {
                                break;
                            }
                            condition = condition.and;
                        }
                    }
                });
                
                if (match) {
                    searchList.push(dataInQuestion);
                }
            });
           

            console.log("BaseModel:where callback");
            callback(searchList);
        };

        iDB.all(queryDetails);
    };

})();
