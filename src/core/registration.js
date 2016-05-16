(function(){
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

})();