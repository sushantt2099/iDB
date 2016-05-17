(function() {
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
