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
        {x: 0, y: 0},
        {x: 1, y: 0}, 
        {x: 1, y: 1}
    ]

 *3: Geojson (RFC7946)
    example:
     {
        "type": "Point",
        "coordinates": [43.234099, 13.628211]
     }

  OPERATION:
  Conversion:
  1) Lat/Long -> Array of Coordinates
  2) Lat/Long -> geoJSON

  3) Array of Coordinates -> Lat/Long
  4) Array of Coordinates -> geoJSON

  5) geoJSON -> Lat/Long
  5) geoJSON -> Array of Coordinates

*/

const proj4jsLIB = require("proj4");

/* var sourceLatLong = new proj4jsLIB.Proj('EPSG:4326');  
//var dest = new proj4jsLIB.Proj('EPSG:4269');  
var dest = new proj4jsLIB.Proj('EPSG:3857');  

// performing transformation
var southWestOld = new proj4jsLIB.Point( xMin, yMin );   
var northEastOld = new proj4jsLIB.Point( xMax, yMax ); 

var southWestNew = proj4jsLIB.transform(sourceLatLong, dest, southWestOld);      
var northEastNew = proj4jsLIB.transform(sourceLatLong, dest, northEastOld); 

console.log("before: southWestOld,northEastOld", southWestOld, northEastOld);
console.log("after: southWestNew,northEastNew", southWestNew, northEastNew); */

//NOTE: [x,y] => [lon,lat]
proj4jsLIB.defs("EPSG:27700", "+proj=tmerc +lat_0=49 +lon_0=-2 +k=0.9996012717 +x_0=400000 +y_0=-100000 +ellps=airy +datum=OSGB36 +units=m +no_defs");

const test1 = proj4jsLIB('EPSG:27700','EPSG:4326').forward( [480069, 186342] ).reverse(); 
// [51.57027349352602, -0.8461130514492281]
            
const test2 = proj4jsLIB('EPSG:27700','EPSG:4326').inverse( [ -0.846, 51.57 ] ); // lon, lat !!! 
// [480077.3157135821, 186311.70711789717]

const LatLonCoordinates = require("../models/CoordinatesLatLon-Proxy");

/* LatLonCoordinates.Latitude = 30;
LatLonCoordinates.Longitude= 30;
console.log(LatLonCoordinates); // 30,30
LatLonCoordinates.Latitude = 300; //exc
LatLonCoordinates.Longitude= 300; //exc */