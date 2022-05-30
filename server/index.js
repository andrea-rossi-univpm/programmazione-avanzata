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
//redisHandler._SetUsers(users); 

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
const registry = require('./modules/EPSG-RegistryLoader');
const app = express();
//declaring a global variable 
app.locals.users = users; //
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

app.post('/convertLatLong', function (req, res) {
  const params =  req.body;
  if(!params || Object.keys(params).length === 0) {
    //why next does not work?
    let err = new Error(
      errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg() + ": Invalid request Body"
    );
    err.StatusCode = enumHTTPStatusCodes.Unauthorazied;
    errorHandler(err, req, res, null);
  } else {
    const coupleCoordinates = params.coupleCoordinates;
    if(coupleCoordinates) {
        let err = new Error(
          errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + ": Couple of coordinates undefined"
        );
        err.StatusCode = enumHTTPStatusCodes.BadRequest;
        errorHandler(err, req, res, null);
    } else {
      let coordinatesLatLonProxy = require("./models/CoordinatesLatLon-Proxy");
      //protecting against bad requests
      try {
        coordinatesLatLonProxy.Latitude = coupleCoordinates.Latitude;
        coordinatesLatLonProxy.Longitude = coupleCoordinates.Longitude;
      } catch(ex) {
        //Proxy validator exception (err is already defined so I'll rewrite it)
        let err = new Error(
          errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + ` ${ex}`
        );
        err.StatusCode = enumHTTPStatusCodes.BadRequest;
        errorHandler(err, req, res, null);
      }

      try {
        const conversionResult = proj4j._convertLatLong(coordinatesLatLonProxy);
        res.status(200).send(conversionResult);
      } catch(ex) {
        //proj4j lib could not convert so it's an unprocessable entity error code
        let err = new Error(
          errorFactory.getError(enumHTTPStatusCodes.UnprocessableEntity).getMsg() + ` ${ex}`
        );
        err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
        errorHandler(err, req, res, null);
      }
    }
  }
});

app.post('/addCredit', function (req, res) {
  //check admin role
  /* if(req.user.Role !== 'Administrator') {
    return res.status(401).send({"error": 'User must be Administrator'});
  } */
  const params =  req.body;
  if(!params || Object.keys(params).length === 0) {
    
    let err = new Error(
      errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + ` Invalid request Body`
    );
    err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
    errorHandler(err, req, res, null);

  } else {
    logger.LOG_INFO('add credit body: '+ params);
    if((users.find(x => x['Email'] === params.Email) === undefined)) {

      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.UnprocessableEntity).getMsg() + ` Email: ${params.Email} not found`
      );
      err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
      errorHandler(err, req, res, null);

      return;
    } else if ( !Number.isInteger(params.CreditToAdd) || params.CreditToAdd <= 0){

      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + ` Invalid credit.`
      );
      err.StatusCode = enumHTTPStatusCodes.BadRequest;
      errorHandler(err, req, res, null);

    } else {
      const CreditToAdd = params.CreditToAdd;
      const Email = params.Email;

      //call to redis
      try {
        const result = redisHandler._AddCredits(Email, CreditToAdd);
        if(result) {
          logger.LOG_INFO(
            `Added ${CreditToAdd} credit${CreditToAdd > 1 ? 's' : ''} to ${Email}`);
          res.sendStatus(200);
        }
      } catch(ex) {
        let err = new Error(
          errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg() + `: ${ex}`
        );
        err.StatusCode = enumHTTPStatusCodes.BadRequest;
        errorHandler(err, req, res, null);

      }
    }
  }
});

app.get('/getEPSG', function (req, res) {
  res.send(registry);
});

//////////////////////////////////////////////////////////////////////////////////////////////////

//forcing node server to listen using IPv4
app.listen(nodePort, nodeIP, () => {
  logger.LOG_INFO(`Node Running on http://${nodeIP}:${nodePort}`);
});


//for /l %x in (1, 1, 1000) do curl -v localhost:3000/about