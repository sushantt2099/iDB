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
        name: 'age',
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
    indexes: [{
        name: 'age',
        unique: true
    }],
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

testHelper.currentAssert = undefined;
testHelper.errorOnDBHit = false;

testHelper.watchDatabaseHit = function(){
    if(testHelper.errorOnDBHit){
        testHelper.currentAssert.ok(false, "Code have hit the database.");
    }
}; 


testHelper.codeShouldNotHitDatabase = function(assert){
    testHelper.currentAssert = assert;
    testHelper.errorOnDBHit = true;
};


testHelper.codeCanHitTheDatabase = function(assert){
    testHelper.errorOnDBHit = false;
};

iDB.private.callbackOnDatabaseHit(testHelper.watchDatabaseHit);