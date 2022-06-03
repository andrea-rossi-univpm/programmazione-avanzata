'use strict'; 

const proj4jsLIB = require("proj4");


// TEST NOTE: [x,y] => [lon,lat]
//proj4jsLIB.defs([
//   [
//      "EPSG:32633", 
//      "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs"
//   ],
//   [
//      'EPSG:4326',
//      '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
//   ]
//); 
//
//console.warn(proj4jsLIB('EPSG:4326','EPSG:32633').forward( [12, 43] )) 
//// [255466.98055255122, 4765182.9328010045]

module.exports = {
   _setEPSGRegistry: function(registry) {
      //first entry is 3819
      registry.forEach(x => {
         proj4jsLIB.defs("EPSG:" + x[0], x[1]);
      });  
   },
   _convertLatLong: function(source, destination, Latitude, Longitude) {
      return proj4jsLIB(source, destination).forward( 
         [
            Longitude, 
            Latitude
         ] 
      ); 
   }
};