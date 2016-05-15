QUnit.test("Indexeddb init", function(assert) {

    var databaseName = "demo";
    indexedDB.deleteDatabase(databaseName);
    var that = this;

    assert.expect( this.objectStoresToRegister.length );
    var done = assert.async( this.objectStoresToRegister.length );

    this.registerObjectStore();
    var initialize = function() {
        iDB.init({
            databaseName: databaseName,
            version: 1
        });

        iDB.private.getDBInstance({
        	onSuccess: function(db){
        		_.each(db.objectStoreNames, function(objectStoreName){
        			var objectStoreFound = false;
        			_.each(that.objectStoresToRegister, function(objectStoreToRegister){
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
