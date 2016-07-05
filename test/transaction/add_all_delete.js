QUnit.test("Indexeddb transaction add", function(assert) {



    //testHelper.initDatabaseEnv();

    
    var totalDataAddVerificationCount = testHelper.objectStoresToRegister.length;
    var totalDataDeleteVerificationCount = testHelper.objectStoresToRegister.length;
    var totalWhereVerificationCount = testHelper.objectStoresToRegister.length;
    var totalFindByIndexVerificationCount = testHelper.objectStoresToRegister.length * testHelper.dataToAdd.length;
    var totalTest = totalDataAddVerificationCount + totalDataDeleteVerificationCount + 
                    totalWhereVerificationCount + totalFindByIndexVerificationCount;
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
        iDB.save({
                objectStoreName: objectStore.name,
                data: testHelper.dataToAdd,
                callback: callback
            });
    };

    var applyWhereTest = function(objectStore, callback){
        iDB.where({
            objectStoreName: objectStore.name,
            conditions: [{
                property: 'age',
                operator: 'greaterThanEqualTo',
                value: 25
            }],
            callback: function(result){
                var expectedResult = [];
                _.each(testHelper.dataToAdd, function(data){
                    if(data.age >= 25){
                        expectedResult.push(data);
                    }
                });

                //compare for the data

                assert.ok(expectedResult.length === result.length, "Total number of object returned is same");
                done();
                callback();
            }
        });
    };

    var applyFindByIndexTest = function(objectStore, callback){
        var totalFindByIndexTest = 0;
        _.each(testHelper.dataToAdd, function(data){
            _.each(objectStore.indexes, function(index){
                iDB.findByIndex({
                    objectStoreName: objectStore.name,
                    indexName: index.name,
                    indexValue: data[index.name],
                    callback: function(result){
                        ++totalFindByIndexTest;
                        //verify the data property
                        var dataValid = true;
                        _.each(data, function(property){
                            if(data[index.name] === result[index.name]){

                            }else{
                                dataValid = false;
                            }
                        });
                        assert.ok(dataValid, "findByIndex returned the correct object");
                        done();
                        if(totalFindByIndexTest === totalFindByIndexVerificationCount/testHelper.objectStoresToRegister.length){
                            callback();
                        }
                    }

                });     
            });
              
        });
        
    };
    var addData = function() {
        _.each(testHelper.objectStoresToRegister, function(objectStore) {
            addDataToDatabase(objectStore,
                function() {
                    verifyAllDataInTheDatabase(objectStore, function(){
                        applyWhereTest(objectStore, function(){
                            applyFindByIndexTest(objectStore, function(){
                                deleteAllData(objectStore, function(){
                                    verifyDatabaseIsEmpty(objectStore, function(){

                                    });
                                });     
                            });
                               
                        });
                        
                    });
                }
            );

        });

    };

    addData();


});
