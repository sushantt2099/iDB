# iDB

iDB is a wrapper around indexedDB, its helps developer to effeciently and fastly use IndexedDB to write modern HTML5 apps.

# Install using bower

```sh
$ bower install idbase --save
```

# How to use it
### step 1: Registring the object store.
Register all the object store that you want to use in your app

```sh
var objectStoresToRegister = [{
    name: 'test'
}, {
    name: 'customers'
}];
iDB.registerObjectStore(objectStoresToRegister);
```

### Step 2: Initializing the database.
This will create the database and create the objectstore.
```sh
var databaseName = "test";
iDB.init({
    databaseName: databaseName,
    version: 1
});
```
### Step 3: Perform operations on the database.
After step 2 database operations can be performed(add, delete, find, findByIndex, where, all)

##### Add

```sh
iDB.add({
    objectStoreName: , //object store on which operation will be performed
    data: , //array of data to be added to the object store
    callback:  //callback function will be called once after all the data is added.
});
```
##### Delete

```sh
iDB.delete({
    objectStoreName: , //object store on which operation will be performed
    objectsToDelete: , //array of data to be added to the object store
    callback: //callback function will be called once after all the data is delete.
});
```
##### Find
```sh
 iDB.find({
    objectStoreName: ,//object store on which operation will be performed
    indexName: //indexed property to be searched on 
    indexValue: //value of the index property to be searched
    callback: //callback function will be called once after operation is performend.
});
```

##### Find By Index
```sh
 iDB.findByIndex({
    objectStoreName: ,//object store on which operation will be performed
    indexName: //indexed property to be searched on 
    indexValue: //value of the index property to be searched
    callback: //callback function will be called once after operation is performend.
});
```
##### where
> Where operation can be slow as it has to iterates over all the object of the given object >store.

```sh
 iDB.where({
    objectStoreName: ,//object store on which operation will be performed
    conditions: //array conditions to be applied
    callback: //callback function will be called once after operation is performend.
```
each condition is  object and each where condition object looks like this 
```sh
{
    property: ,//property of object to be checked
    operator: 'greaterThanEqualTo', 
    value: 25,
    and: //optional nested condition
}
```            
Conditions in the array is applied as || . Nested conditions using the 'and' property is applied as &&

operator string value that can be any of the following:
```sh
'greaterThan': >
'equalTo':  ==
'lessThan': < 
'lessThanEqualTo' <=
'greaterThanEqualTo': >=
'notEqualTo': !=
```
##### all
Used to query all data in the objectstore
```sh
iDB.all({
    objectStoreName: ,//name of the object store
    callback: //callback function that will be called with all the data once the operations completes
});
```
