QUnit.test("Indexeddb objectStore Registration", function(assert) {
    var objectStoreToRegister = 
    	{
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

    	};

    iDB.registerObjectStore(objectStoreToRegister);
    var index = iDB.private.OBJECT_STORES.indexOf(objectStoreToRegister);
    assert.ok( index > -1, "Object Store Details Registered" );

});