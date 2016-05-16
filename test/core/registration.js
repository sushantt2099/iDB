QUnit.test("Indexeddb objectStore Registration", function(assert) {
    
    testHelper.registerObjectStore();
    _.each(testHelper.objectStoresToRegister, function(objectStoreToRegister){
        var index = iDB.private.getObjectStoresInfo().indexOf(objectStoreToRegister);
        assert.ok( index > -1, "Object Store Details Registered" );    
    });
    

});