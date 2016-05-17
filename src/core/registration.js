(function(){
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

	iDB.getKeyPathName = function(objectStoreNmae, objectStoreDetails){
		if(objectStoreDetails){
			return objectStoreDetails.keyPath.name;
		}
		return iDB.getObjectStoreDetails(objectStoreNmae).keyPath.name;
	};

	iDB.getObjectStoreIndexes = function(objectStoreName, objectStoreDetails){
		if(objectStoreDetails){
			return objectStoreDetails.indexes;
		}
		return iDB.getObjectStoreDetails(objectStoreName).indexes;	
	};

})();