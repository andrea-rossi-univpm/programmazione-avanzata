'use strict'; 
/*

 order 1:  lat-lng (or northing-easting) -> used by Leaflet
 order 2:  lng-lat (or easting-northing) -> used by GeoJSON 

 Module for convertion

 3 types of rappresentation

 *1: Coordinates couple: (Latitude and Longitude). => EPSG:4326  ([x,y] => [lon,lat])
    example: my current location 
    Latitude: 43.234099 / N 43° 14' 2.757''  [range: -90~90]
    Longitude: 13.628211 / E 13° 37' 41.56'' [range -180~180]

 *2: Array of Coordinates: 
    var ArrayOfCoordinates = [
        {lat: 0, lng: 0},
        {x: 1, y: 0}, 
        {x: 1, y: 1}
    ]

 *3: Geojson (RFC7946)
    example:
     {
        "type": "Point",
        "coordinates": [43.234099, 13.628211]
     }
*/

const proj4jsLIB = require("proj4");


//NOTE: [x,y] => [lon,lat]
/* proj4jsLIB.defs([
   [
      "EPSG:32633", 
      "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs"
   ],
   [
      'EPSG:4326',
      '+title=WGS 84 (long/lat) +proj=longlat +ellps=WGS84 +datum=WGS84 +units=degrees'],
   ]
); */

//correct business logic for lat long
/* const test1 = proj4jsLIB('EPSG:4326','EPSG:32633').forward( [12, 43] ); 
console.warn(test1) */
// [51.57027349352602, -0.8461130514492281]

/* //correct business logic for lat long
const array = [
   [12, 43],
   [13, 44],
]

array.forEach(x => {
   console.log( proj4jsLIB('EPSG:4326','EPSG:32633').forward(x))
});



//geoJSON: when generated i have to specify
//"coordinates": [43.234099, 13.628211]
/* {
   source : 27700,
   json : geoJSON,
   dest: 4326
}  -> EXAMPLE of post request*/


module.exports = {
   _setEPSGRegistry: function(registry) {
      proj4jsLIB.defs(registry);
   },
   _convertLatLong: function(source, destination, Latitude, Longitude) {
      //proj4jsLIB('EPSG:4326','EPSG:32633').forward( [12, 43] ); 
      return proj4jsLIB(source, destination).forward( 
         [
            Latitude,
            Longitude 
         ] 
      ); 
   },
   _convertArrayOfCoordinates: function(source,destination, arrayOfCoordinates) {
      //checking array
     /*  if(!(arrayOfCoordinates && arrayOfCoordinates instanceof Array && arrayOfCoordinates.length > 0)) {
         logger.LOG_FATAL('Failed loading Users module');
         //process.exit(1); 
         //force the process to exit killing also async pending tasks (including I/O)
     } */
     // this is a bad request, its better to do this check in the caller
     let convertedArrayOfCoordinates = [];
     arrayOfCoordinates.forEach(x => {
      //to handle try catch in different levels
      convertedArrayOfCoordinates.push(_convertLatLong(x));
     });
     return convertedArrayOfCoordinates;
   },
   _convertGeoJSON: function(source, destination, geoJSON) {

   }
};