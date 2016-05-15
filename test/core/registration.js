QUnit.test("Indexeddb objectStore Registration", function(assert) {
    var objectStoresToRegister = 
    	[{
    		name: 'test',
    		customValidator: function(){},
    		dataFormat: [],
    		indexes: [{
    			name: 'test',
    			unique: true
    		}],
    		keyPath: {
    			name: 'id',
    			autoIncrement: true
    		}

    	}];

    iDB.registerObjectStore(objectStoresToRegister);
    var index = iDB.private.getObjectStoresInfo().indexOf(objectStoresToRegister[0]);
    assert.ok( index > -1, "Object Store Details Registered" );

});