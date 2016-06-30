QUnit.test("Indexeddb init", function(assert) {

    

    assert.expect( testHelper.objectStoresToRegister.length );
    var done = assert.async( testHelper.objectStoresToRegister.length );

    testHelper.initDatabaseEnv();
    
    var initialize = function() {
        iDB.private.getDBInstance({
        	callback: function(db){
        		_.each(db.objectStoreNames, function(objectStoreName){
        			var objectStoreFound = false;
        			_.each(testHelper.objectStoresToRegister, function(objectStoreToRegister){
        				if(objectStoreName === objectStoreToRegister.name){
        					objectStoreFound = true;
        				}
        			});
        			assert.ok( objectStoreFound, "Object Store created" );
                    done();
        		});
                
        	}	
        });
    };

    initialize();


});
