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


*/

const proj4 = require("proj4");

var firstProjection = 'PROJCS["NAD83 / Massachusetts Mainland",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6269"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],UNIT["metre",1,AUTHORITY["EPSG","9001"]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",42.68333333333333],PARAMETER["standard_parallel_2",41.71666666666667],PARAMETER["latitude_of_origin",41],PARAMETER["central_meridian",-71.5],PARAMETER["false_easting",200000],PARAMETER["false_northing",750000],AUTHORITY["EPSG","26986"],AXIS["X",EAST],AXIS["Y",NORTH]]';
var secondProjection = "+proj=gnom +lat_0=90 +lon_0=0 +x_0=6300000 +y_0=6300000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
//I'm not going to redefine those two in latter examples.
const test = proj4(firstProjection,secondProjection,[2,5]);
console.log(test);
// [-2690666.2977344505, 3662659.885459918]

const LatLonCoordinates = require("../models/CoordinatesLatLon-Proxy");

let test2 = new LatLonCoordinates();
test2.Latitude = 30;
test2.Longitude= 30;
/* LatLonCoordinates.Latitude = 30;
LatLonCoordinates.Longitude= 30;
console.log(LatLonCoordinates); // 30,30
LatLonCoordinates.Latitude = 300; //exc
LatLonCoordinates.Longitude= 300; //exc */