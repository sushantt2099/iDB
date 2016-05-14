QUnit.test("Indexeddb init", function(assert) {
    var databaseName = "demo";
    indexedDB.deleteDatabase(databaseName);

    iDB.init({
        databaseName: databaseName,
        version: 1
    });

});