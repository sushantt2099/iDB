(function(){
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




})();