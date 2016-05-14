(function(){
	window.iDB = window.iDB || {};
    iDB = window.iDB;
    
	iDB.registerObjectStore = function(details){
		
		details.keyPath.name = (details.keyPath && details.keyPath.name) || 'id';
		details.keyPath.autoIncrement = (details.keyPath && details.keyPath.autoIncrement) || true;
		iDB.private.OBJECT_STORES = iDB.OBJECT_STORES || [];
		iDB.private.OBJECT_STORES.push(details);
	};

})();