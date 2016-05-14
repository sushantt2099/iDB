(function() {
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
