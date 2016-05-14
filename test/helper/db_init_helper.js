var testHelper = testHelper || {};
testHelper.databaseName = "demo";

testHelper.deleteDatabase = function(database){
	indexedDB.deleteDatabase(database || testHelper.databaseName);
};

testHelper.initDatabase = function(){
	iDB.init({
    	databaseName: databaseName,
    	version: 1
	});

};
