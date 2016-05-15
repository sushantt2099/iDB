QUnit.module("unrelated test", {
    setup: function() {
        this.objectStoresToRegister = objectStoresToRegister = 
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

    	}, {
    		name: 'customers',
    		customValidator: function(){},
    		dataFormat: [],
    		keyPath: {
    			name: 'id',
    			autoIncrement: true
    		}

    	}];
    	this.registerObjectStore = function(){
    		iDB.registerObjectStore(this.objectStoresToRegister);    
    	};
    }
});