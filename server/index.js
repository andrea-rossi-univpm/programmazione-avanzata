'use strict'; // For cleaner code, avoid using undeclared variables.

require('dotenv').config();

//logger singletone
const singletoneLogger = require("./modules/logger-singleton");
const logger = singletoneLogger.getInstance();
//singleton logger tests:
//logger2.LOG_ERROR("test");
//console.log("Equals:: ", logger === logger2);

//configs
//reading from .env file (only strings) If not defined port/ip default set available with ||
const nodePort = process.env.NODE_PORT || 3000; 
const nodeIP = process.env.NODE_IP || '0.0.0.0'; //all interfaces of machine

const authWall = true;
const privateKey = process.env.SECRET_KEY;
//If authWall is false I don't care about missing key or logging it
if(authWall === true) {
  if(!privateKey) { //null, undefined, 0 or ''
    logger.LOG_FATAL('Unable to retrieve Private Key from .env file');
  } else {
    logger.LOG_INFO(`Authentication enabled. Private key: ${privateKey}`);
  }
} else {
  logger.LOG_WARNING('Authentication disabled');
}

//Loading user from JSON with usersLoader module
//users are loaded only once in index.js and will passed as parameter if needed
const users = require('./modules/usersLoader');

//After user are loaded successfully, we need to start redis, setting up [mail, credit]

//REDIS
const redisHandler = require('./modules/redisHandler');
redisHandler._PassUsersList(users);

const enumHTTPStatusCodes = require("./models/httpsStatusCode");

const CErrorFactory = require("./modules/error-factory");
const errorFactory = new CErrorFactory();

//loading registry once and then pass to proj4j helper
const epsgRegistry = require("./modules/EPSG-RegistryLoader");

const proj4j = require("./modules/conversionHandler");
try {
  proj4j._setEPSGRegistry(epsgRegistry);
} catch (err) {
  logger.LOG_ERROR("Unable to apply EPSG registry to proj4j using defs function");
  logger.LOG_FATAL(err);
}

//Express Framework
const express = require('express');
//enabling CORS for every domain wich is not recomended for security reasons
const cors = require('cors'); 
const req = require("express/lib/request");
const app = express();

//setting global variable: can be retrievied using req.app.locals
app.locals.users = users; 
app.locals.epsgRegistry = epsgRegistry; 

app.use(express.json()); // for parsing request body as JSON

  
//middleware called on each route
app.use(cors());
app.use(require("./middleware/logRoute"));  //logging route call
if(authWall === true) { //for debugging purpose
  app.use(require("./middleware/checkHeader")); //checking if auth header exists
  app.use(require("./middleware/checkToken")); //checking jwt
  app.use(require("./middleware/verifyAndAuthenticate")); //verify of jwt and user mail
}

app.use(require("./middleware/errorHandler")); //handling errors on previous middleware steps

//////////////////////////////////// REST API ///////////////////////////////////////////////////

app.get('/getUsers', function (req, res) {
  res.send(users);
});

app.post('/convertLatLong', require("./middleware/checkConversionRequest"), function (req, res) {
  const params =  req.body;
    let coordinatesLatLonProxy = require("./models/CoordinatesLatLon-Proxy");
    //protecting against bad requests
    try {
      coordinatesLatLonProxy.Latitude = params.Latitude;
      coordinatesLatLonProxy.Longitude = params.Longitude;
    } catch(ex) {
      //Proxy validator exception (err is already defined so I'll rewrite it)
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + `: ${ex}`
      );
      err.StatusCode = enumHTTPStatusCodes.BadRequest;
      require("./middleware/errorHandler")(err, req, res, null);
      return;
    }

    try {
      const conversionResult = proj4j._convertLatLong(
        params.Source,
        params.Destination,
        coordinatesLatLonProxy.Latitude,
        coordinatesLatLonProxy.Longitude
      );
      res.status(200).json(conversionResult);
    } catch(ex) {
      //proj4j lib could not convert so it's an unprocessable entity error code
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.UnprocessableEntity).getMsg() + ` ${ex}`
      );
      err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
      require("./middleware/errorHandler")(err, req, res, null);
      return;
    }
});

app.post('/convertArrayLatLong', require("./middleware/checkConversionRequest"), function (req, res) {
  const params =  req.body;
  let coordinatesLatLonProxy = require("./models/CoordinatesLatLon-Proxy");
  //protecting against bad requests
  try {
    if(!params.ArrayLatLon || params.ArrayLatLon.length === 0) {
      throw 'Empty array lat/lon';
    }
    //sub array of lat/lon validation, one by one
    params.ArrayLatLon.forEach(x => {
      coordinatesLatLonProxy.Latitude = x[0];
      coordinatesLatLonProxy.Longitude = x[1];
    })
    
  } catch(ex) {
    //Proxy validator exception (err is already defined so I'll rewrite it)
    let err = new Error(
      errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + `: ${ex}`
    );
    err.StatusCode = enumHTTPStatusCodes.BadRequest;
    require("./middleware/errorHandler")(err, req, res, null);
    return;
  }

  try {
      let response = new Array();
      params.ArrayLatLon.forEach(x => {
        response.push(proj4j._convertLatLong(
          params.Source,
          params.Destination,
          x[0],
          x[1]
        ));
      });
      res.status(200).json(response);
  } catch(ex) {
      //proj4j lib could not convert so it's an unprocessable entity error code
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.UnprocessableEntity).getMsg() + `: ${ex}`
      );
      err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
      require("./middleware/errorHandler")(err, req, res, null);
      return;
  }
});

//geoJSON: coordinates is in the format [lng, lat]
app.post('/convertGeoJSON', require("./middleware/checkConversionRequest"), function (req, res) {
  const params =  req.body;
  const geoJSON = params.GeoJSON;
  const geoJSONValidator = require("geojson-validation");
  let nestedCoordinatesGeoJSON;
  //protecting against bad requests
  try {
    if(!geoJSON)
      throw 'Empty GeoJSON';
    if(geoJSON.indexOf("coordinates") === -1)
      throw "No property 'coordinates' found on GeoJSON";
    const parsedGeoJSON = JSON.parse(geoJSON);
    if(!geoJSONValidator.valid(parsedGeoJSON))
      throw 'Invalid GeoJSON';
    if(parsedGeoJSON.type !== 'FeatureCollection')
      throw 'Only FeatureCollection are managed. To convert simple point use lat/long convereter.';

    const objectHelper = require("./modules/objectHelper");
    nestedCoordinatesGeoJSON =  objectHelper._findObjValuesByKey(parsedGeoJSON);

    let coordinatesLatLonProxy = require("./models/CoordinatesLatLon-Proxy");
    //sub array of lat/lon validation, one by one'
    nestedCoordinatesGeoJSON.forEach(x => {
      x.forEach(y => {
        coordinatesLatLonProxy.Latitude = y[0];
        coordinatesLatLonProxy.Longitude = y[1];
      })
      
    })
    
  } catch(ex) {
    //Proxy validator exception (err is already defined so I'll rewrite it)
    let err = new Error(
      errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + `: ${ex}`
    );
    err.StatusCode = enumHTTPStatusCodes.BadRequest;
    require("./middleware/errorHandler")(err, req, res, null);
    return;
  }

  try {
      let response = new Array();
      nestedCoordinatesGeoJSON.forEach(x => {
        x.forEach(y => {
          response.push(proj4j._convertLatLong(
            params.Source,
            params.Destination,
            y[0],
            y[1]
          ));
        })
      });
      res.status(200).json(response);
  } catch(ex) {
      //proj4j lib could not convert so it's an unprocessable entity error code
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.UnprocessableEntity).getMsg() + `: ${ex}`
      );
      err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
      require("./middleware/errorHandler")(err, req, res, null);
      return;
  }
});

//using custom middleware only for this api to verify user role (role back-end side)
app.post('/addCredit', require("./middleware/checkAdminRole"), require("./middleware/checkCreditRequest"),  function (req, res) {
  const params =  req.body;
      const CreditToAdd = params.CreditToAdd;
      const Email = params.Email;

      //call to redis
      try {
        redisHandler._AddCredits(Email, CreditToAdd);
        res.status(200).json(`Added ${CreditToAdd} credit${CreditToAdd > 1 ? 's' : ''} to ${Email}`);
      } catch(ex) {
        let err = new Error(
          errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg() + `: ${ex}`
        );
        err.StatusCode = enumHTTPStatusCodes.BadRequest;
        require("./middleware/errorHandler")(err, req, res, null);
        return;
      }
});

app.get('/getEPSG', function (req, res) {
  res.send(epsgRegistry.map(x => 'EPSG:' + x[0]));
});

//////////////////////////////////////////////////////////////////////////////////////////////////

//forcing node server to listen using IPv4
app.listen(nodePort, nodeIP, () => {
  const os = require('os');
  logger.LOG_INFO(`Node ${process.version} Running on http://${nodeIP}:${nodePort} on ${os.type()}: ${os.version()}`);
});