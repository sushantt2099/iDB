var testHelper = testHelper || {};
testHelper.databaseName = "demo";

testHelper.deleteDatabase = function(database) {
    indexedDB.deleteDatabase(database || testHelper.databaseName);
};

testHelper.initDatabase = function() {
    iDB.init({
        databaseName: testHelper.databaseName,
        version: 1
    });
};

testHelper.objectStoresToRegister = [{
    name: 'test',
    customValidator: function() {},
    dataFormat: [],
    indexes: [{
        name: 'test',
        unique: true
    }],
    keyPath: {
        name: 'id',
        autoIncrement: true
    }

}, {
    name: 'customers',
    customValidator: function() {},
    dataFormat: [],
    keyPath: {
        name: 'id',
        autoIncrement: true
    }

}];

testHelper.dataToAdd = [{
    name: "sushant",
    age: 25
}, {
    name: "ishan",
    age: 27
}];
testHelper.registerObjectStore = function() {
    iDB.registerObjectStore(testHelper.objectStoresToRegister);
};

testHelper.initDatabaseEnv = function() {
    testHelper.deleteDatabase();
    testHelper.registerObjectStore();
    testHelper.initDatabase();
};
