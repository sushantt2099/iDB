(function() {
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
