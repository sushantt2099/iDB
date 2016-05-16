(function() {
    window.iDB = window.iDB || {};
    iDB = window.iDB;
    iDB.private = iDB.private || {};
    iDB.helper = iDB.helper || {};

    iDB.helper.callFunctionsWithArgument = function(functions, args) {
        _.each(functions, function(functionToCall) {
            functionToCall.apply(window, args);
        });
    };

    iDB.helper.objectPropAsArray = function(objectToConvert) {
        var array = [];
        for (var prop in objectToConvert) {
            if (objectToConvert.hasOwnProperty(prop)) {
                array.push(prop);
            }
        }
        return array;
    };

    iDB.helper.eachObjectProperty = function(objectToIterate, callback) {
        if (!callback) {
            return;
        }
        for (var property in objectToIterate) {
            if (objectToIterate.hasOwnProperty(property)) {
                callback(property);
            }
        }
    };

    iDB.helper.filterObjectProperties = function(objectToFilter, propertiesToFilter) {
        var filteredObject = {};
        iDB.helper.eachObjectProperty(propertiesToFilter, function(prop) {
            if (objectToFilter[prop]) {
                filteredObject[prop] = objectToFilter[prop];
            }
        });
        return filteredObject;
    };

    iDB.helper.updateQueryStringParameter = function(uri, key, value) {
        var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
        var separator = uri.indexOf('?') !== -1 ? "&" : "?";
        if (uri.match(re)) {
            return uri.replace(re, '$1' + key + "=" + value + '$2');
        } else {
            return uri + separator + key + "=" + value;
        }
    };

    iDB.helper.isArray = function(obj) {
        if (Object.prototype.toString.call(obj) === '[object Array]') {
            return true;
        }
        return false;
    };

})();
