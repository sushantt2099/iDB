QUnit.test("Indexeddb transaction add", function(assert) {



    testHelper.initDatabaseEnv();

    
    var totalDataAddVerificationCount = testHelper.objectStoresToRegister.length;
    var totalDataDeleteVerificationCount = testHelper.objectStoresToRegister.length;
    var totalTest = totalDataAddVerificationCount + totalDataDeleteVerificationCount;
    assert.expect(totalTest);
    var done = assert.async(totalTest);
    
    var verifyAllDataInTheDatabase = function(objectStore, callback){
        iDB.all({
            objectStoreName: objectStore.name,
            callback: function(allData) {
                var dataValid = true;
                _.each(allData, function(data) {
                    _.each(testHelper.dataToAdd, function(addedData) {
                        iDB.helper.eachObjectProperty(addedData, function(prop) {
                            if (data[prop] !== undefined) {

                            } else {
                                dataValid = false;
                            }
                        });
                    });

                });
                console.log(1);
                assert.ok(dataValid, "Data added To object Store");
                done();
                callback();
                
                
            }
        });
    };

    var verifyDatabaseIsEmpty = function(objectStore, callback){
        iDB.all({
            callback: function(allData){
                console.log('delete');
                assert.ok(allData.length === 0, "Data delete successfully");
                done();
            },
            objectStoreName: objectStore.name
        });
    };

    var deleteAllData = function(objectStore, callback){
        
        iDB.all({
            callback: function(allData){
                iDB.delete({
                    objectStoreName: objectStore.name,
                    objectsToDelete: allData,
                    callback: callback
                });
            },
            objectStoreName: objectStore.name
        });
        //delete
        
    };

    

    var addDataToDatabase = function(objectStore, callback){
        iDB.add({
                objectStoreName: objectStore.name,
                data: testHelper.dataToAdd,
                callback: callback
            });
    };

    var addData = function() {
        _.each(testHelper.objectStoresToRegister, function(objectStore) {
            addDataToDatabase(objectStore,
                function() {
                    verifyAllDataInTheDatabase(objectStore, function(){
                        deleteAllData(objectStore, function(){
                            verifyDatabaseIsEmpty(objectStore, function(){
                            });
                        });
                    });
                }
            );

        });

    };

    addData();


});
