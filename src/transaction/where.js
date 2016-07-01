(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    var WHERE_CONDITION_OPERATIONS = {
        'greaterThan': function(modelData, property, value) {
            return (modelData[property] > value);
        },
        'equalTo': function(modelData, property, value) {
            return (modelData[property] == value);
        },
        'lessThan': function(modelData, property, value) {
            return (modelData[property] < value );
        },
        'lessThanEqualTo': function(modelData, property, value) {
            return (modelData[property] <= value );
        },
        'greaterThanEqualTo': function(modelData, property, value) {
            return (modelData[property] >= value  );
        },
        'notEqualTo': function(modelData, property, value) {
            return (modelData[property] != value  );
        }
    };

    var validateCondition = function(data, condition) {
        var conditionExecuter = WHERE_CONDITION_OPERATIONS[condition.operator];
        return conditionExecuter(data, condition.property, condition.value);
    };

    iDB.where = function(queryDetails) {

        var conditions = queryDetails.conditions;
        var callback = queryDetails.callback;

        //validate condition
        _.each(conditions, function(condition) {
            if (!condition.hasOwnProperty("property")) throw "Property not found for query " + JSON.stringify(condition);
            if (!condition.hasOwnProperty("value")) throw "Value not found for query " + JSON.stringify(condition);
        });

        console.log("BaseModel:where valid condition");
        queryDetails.callback = function(all) {
            var searchList = [];
            _.each(all, function(dataInQuestion){
                var match = true;
                _.each(conditions, function(condition, conditionIndex){
                    //for multiple conditions i.e or conditions
                    if (conditionIndex === 0) {
                        match = validateCondition(dataInQuestion, condition);
                    } else {
                        match = match || validateCondition(dataInQuestion, condition);
                    }

                    if (match) {
                        while (condition.and) {
                            if(conditionIndex === 0){
                                match = validateCondition(dataInQuestion, condition.and);
                            }else{
                                //no need to check the condition since anyother condition is already true
                            }
                            
                            if (!match) {
                                break;
                            }
                            condition = condition.and;
                        }
                    }
                });
                
                if (match) {
                    searchList.push(dataInQuestion);
                }
            });
           

            console.log("BaseModel:where callback");
            callback(searchList);
        };

        iDB.all(queryDetails);
    };

})();
