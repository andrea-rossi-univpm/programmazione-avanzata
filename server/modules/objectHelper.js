'use strict'; 

//custom function for retriving multiple 'coordinates' key on geoJSON of type 'FeatureCollection'
//using functional programming (reduce), Objecet entries for iterating object 
//and recursion to visit all nested object
//result: array of matched key

//the reduce work with previous and current object node
//Object.entries its used for retriving key/value pair of an object
//concat() is used to merge arrays: this method return a new array.
module.exports = {
    _findObjValuesByKey: function (obj, keyToFind = 'coordinates') {
        return Object.entries(obj)
          .reduce((acc, [key, value]) => 
            (key === keyToFind)
                ? acc.concat(value)
                    : (typeof value === 'object' && value)
                        ? acc.concat(this._findObjValuesByKey(value, keyToFind))
                            : acc
          , [] /*starting from empty array*/);
      }
};