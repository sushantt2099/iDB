(function(){
	window.iDB = window.iDB || {};
    iDB = window.iDB;
    var db;
    iDB.private = iDB.private || {};

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
            var objectStoresInfo = iDB.private.getObjectStoresInfo();
            _.each(objectStoresInfo, function(objectStoreDetails){
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
	var OBJECT_STORES = [];
    iDB = window.iDB;
    
    iDB.private.getObjectStoresInfo = function(){
    	return OBJECT_STORES;
    };

	iDB.registerObjectStore = function(objectStoresInfo){
		_.each(objectStoresInfo, function(objectStoreInfo){
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

})();;(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.add = function(queryDetails) {

        var callback = queryDetails.callback;
        var objectsToAdd = queryDetails.data;
        var totalObjectStoreAdded = 0;

        queryDetails.callback = function(objectStore) {
            _.each(objectsToAdd, function(objectToAdd) {
                var request = objectStore.add(objectToAdd);
                request.onerror = function(e) {
                    console.log("DataBaseUtility:save: error");
                    console.log(e);
                    throw "Could not store " + objectToAdd;
                };

                request.onsuccess = function(e) {
                    ++totalObjectStoreAdded;
                    console.log("saved to db");
                    objectToAdd.id = e.target.result;
                    if(totalObjectStoreAdded === objectsToAdd.length){
                        callback();
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
    iDB.all = function(queryDetails) {
        var objectStoreName = queryDetails.objectStoreName;
        var start = queryDetails.start;
        var end = queryDetails.end;

        // check the cache and return all
        if (iDB.private.cache.isAllDataRetrived(objectStoreName)) {
            queryDetails.callback(iDB.private.cache.getAllData(objectStoreName));
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
        iDB.private.cache.getCache(details.objectStoreName).all = details.all;
    };

    iDB.private.cache.getAllData = function(objectStoreName) {
        return iDB.private.cache.getCache(objectStoreName).all;
    };


    iDB.private.cache.addData = function(dataDetails) {
        var objectStoreDetails = dataDetails.objectStoreDetails;
        var key = objectStoreDetails.keyPath.name;



        var all = iDB.private.cache.getAllData(objectStoreDetails.name);
        var dataExist = false;

        //search
        for (var i = 0; i < all.length; i++) {
            var data = all[i];
            if (data[key] === dataDetails.data[key]) {
                //update the data if key exists
                data[key] = dataDetails.data;
                dataExist = true;
                break;
            }
        }

        //add data if it does not exists
        if (!dataExist) {
            all.push(dataDetails.data);
        }
    };

    iDB.private.cache.deleteData = function(dataDetails) {
        var objectStoreName = dataDetails.objectStoreName;
        var objectStoreDetails = iDB.getObjectStoreDetails(objectStoreName);
        var key = objectStoreDetails.keyPath.name;
        var objectsToDelete = dataDetails.objectsToDelete;

        var all = iDB.private.cache.getAllData(objectStoreName);


        var indexToSplice = [];
        _.each(objectsToDelete, function(objectToDelete) {
            console.log(objectsToDelete);
            for (var i = 0; i < all.length; i++) {
                var data = all[i];
                if (data[key] === objectToDelete[key]) {
                    indexToSplice.push(i);
                    break;
                }
            }
        });
        indexToSplice.reverse();
        _.each(indexToSplice, function(index){
            all.splice(index, 1);
        });

    };




})();
;(function() {
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
;(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.find = function(queryDetails) {
        var id = queryDetails.id;
        var objectStoreName = queryDetails.objectStore;
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
        var id = queryDetails.id;
        var objectStoreName = queryDetails.objectStore;
        var callback = queryDetails.callback;
        var indexName = queryDetails.indexName;
        var indexValue = queryDetails.indexValue;

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
        '>': function(modelData, property, value) {
            return (value > modelData[property]);
        },
        '==': function(modelData, property, value) {
            return (value == modelData[property]);
        },
        '<': function(modelData, property, value) {
            return (value < modelData[property]);
        },
        '<=': function(modelData, property, value) {
            return (value <= modelData[property]);
        },
        '>=': function(modelData, property, value) {
            return (value >= modelData[property]);
        },
        '!=': function(modelData, property, value) {
            return (value != modelData[property]);
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
                _.each(conditions, function(condition){
                    var propertyName = condition.property;

                    var conditionIndex = conditions.indexOf(condition);
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
