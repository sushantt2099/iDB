QUnit.test("Indexeddb objectStore Registration", function(assert) {
    
    this.registerObjectStore();
    _.each(this.objectStoresToRegister, function(objectStoreToRegister){
        var index = iDB.private.getObjectStoresInfo().indexOf(objectStoreToRegister);
        assert.ok( index > -1, "Object Store Details Registered" );    
    });
    

});