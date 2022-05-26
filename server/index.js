var nodePort = 3000;

const Coordinates = require("./models/CoordinatesLatLon");

const enumHTTPStatusCodes = require("./models/httpsStatusCode");

const loggerLevel = require("./models/logLevel");
const singletoneLogger = require("./logger-singleton");

const logger = singletoneLogger.getInstance();
//singleton logger tests:
//logger2.LOG_ERROR("test");
//console.log("Equals:: ", logger === logger2);


const CErrorFactory = require("./error-factory");
const errorFactory = new CErrorFactory();

const proj4 = require("proj4");

var firstProjection = 'PROJCS["NAD83 / Massachusetts Mainland",GEOGCS["NAD83",DATUM["North_American_Datum_1983",SPHEROID["GRS 1980",6378137,298.257222101,AUTHORITY["EPSG","7019"]],AUTHORITY["EPSG","6269"]],PRIMEM["Greenwich",0,AUTHORITY["EPSG","8901"]],UNIT["degree",0.01745329251994328,AUTHORITY["EPSG","9122"]],AUTHORITY["EPSG","4269"]],UNIT["metre",1,AUTHORITY["EPSG","9001"]],PROJECTION["Lambert_Conformal_Conic_2SP"],PARAMETER["standard_parallel_1",42.68333333333333],PARAMETER["standard_parallel_2",41.71666666666667],PARAMETER["latitude_of_origin",41],PARAMETER["central_meridian",-71.5],PARAMETER["false_easting",200000],PARAMETER["false_northing",750000],AUTHORITY["EPSG","26986"],AXIS["X",EAST],AXIS["Y",NORTH]]';
var secondProjection = "+proj=gnom +lat_0=90 +lon_0=0 +x_0=6300000 +y_0=6300000 +ellps=WGS84 +datum=WGS84 +units=m +no_defs";
//I'm not going to redefine those two in latter examples.
const test = proj4(firstProjection,secondProjection,[2,5]);
console.log(test);
// [-2690666.2977344505, 3662659.885459918]


var os = require('os');
var express = require('express');
const jwt = require('jsonwebtoken');
const req = require("express/lib/request");
var app = express();

var logRoute = function (req, res, next) {
  //processing x-forwarded-for only when setted: might be not setted (ex Ip behind proxy?)
  let clientIP = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
  //If I have an IPv4 address placed into IPv6 netork, I'll get: ::ffff:127.0.0.1
  let caption = clientIP ? `Client IP: [${clientIP}]` : undefined; 
  logger.LOG_INFO(`Requested route: [${req.method}] '${req.url}' ${caption ? caption : ''} `);
  logger.LOG_INFO(`Header: ${JSON.stringify(req.rawHeaders, '\t')}`);
  next();
};


var checkHeader = function(req, res, next){
  const authHeader = req.headers.authorization;
  if (authHeader) {
      next();
  }else{
      next(new Error(errorFactory.getError(enumHTTPStatusCodes.Forbidden).getMsg() + ": Auth Header undefined"));      
  }
};

function checkToken(req,res,next){
  const bearerHeader = req.headers.authorization;
  if(typeof bearerHeader !== 'undefined'){
      const bearerToken = bearerHeader.split(' ')[1];
      req.token = bearerToken;
      next();
  }else{
    next(new Error(errorFactory.getError(enumHTTPStatusCodes.Forbidden).getMsg() + ": Bearer Token undefined"));
  }
}

function verifyAndAuthenticate(req,res,next){
  let decoded = jwt.verify(req.token, 'mysupersecretkey');
  if(decoded !== null) {
    req.user = decoded;
    next();
  } else {
    next(new Error(errorFactory.getError(enumHTTPStatusCodes.Unauthorazied).getMsg() + ": JWT verification failed"));
  }
    
}

function errorHandler(err, req, res, next) {   
    res.status(500).send({"error": err.message});
}
  
//middleware called on each route
app.use(logRoute);  //logging route call
app.use(checkHeader); //checking if auth header exists
app.use(checkToken); //checking jwt
app.use(verifyAndAuthenticate); //verify of jwt
app.use(errorHandler); //handling errors on previous middleware steps

app.get('/', function (req, res) {
  res.send('Hello ' + req.user.GivenName + ' ' + req.user.Surname);
});

app.get('/about', function (req, res) {
  res.send('Hello ' + req.user.GivenName + ' ' + req.user.Surname);
});

//forcing node server to listen using IPv4
app.listen(nodePort, '0.0.0.0');
logger.LOG_DEBUG("Node listening at port: " + nodePort);