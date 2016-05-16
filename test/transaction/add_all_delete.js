QUnit.test("Indexeddb transaction add", function(assert) {



    testHelper.initDatabaseEnv();


    assert.expect(testHelper.objectStoresToRegister.length * testHelper.dataToAdd.length * testHelper.objectStoresToRegister.length);
    var done = assert.async(testHelper.objectStoresToRegister.length * testHelper.dataToAdd.length * testHelper.objectStoresToRegister.length);

    var addData = function() {
        _.each(testHelper.objectStoresToRegister, function(objectStore) {
            iDB.add({
                objectStoreName: objectStore.name,
                data: testHelper.dataToAdd,
                callback: function() {
                    iDB.all({
                        callback: function(allData) {
                            _.each(allData, function(data) {
                                var dataValid = true;
                                _.each(testHelper.dataToAdd, function(addedData) {
                                    iDB.helper.eachObjectProperty(addedData, function(prop) {
                                        if (data[prop] !== undefined) {

                                        } else {
                                            dataValid = false;
                                        }
                                    });
                                });
                                assert.ok(dataValid, "Data added To object Store");
                                done();

                            });
                            //delete
                            iDB.delete({
                                objectStoreName: objectStore.name,
                                objectsToDelete: allData,
                                callback: function(){
                                    //fetch all the data and it should be empty array
                                    iDB.all({
                                        callback: function(allData){
                                            assert.ok(allData.length === 0, "Data delete successfully");
                                        },
                                        objectStoreName: objectStore.name
                                    });
                                }
                            });
                        },
                        objectStoreName: objectStore.name
                    });
                }
            });

        });

    };

    addData();


});
