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
const authWall = false;
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

const proj4j = require("./modules/conversionHandler");

//Express Framework
const express = require('express');
//enabling CORS for every domain wich is not recomended for security reasons
const cors = require('cors'); 
const jwt = require('jsonwebtoken');
const req = require("express/lib/request");
var app = express();
app.use(express.json()); // for parsing request body as JSON

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
    logger.LOG_ERROR(err.message);
    res.status(500).send({"error": err.message});
}
  
//middleware called on each route
app.use(cors());
app.use(logRoute);  //logging route call
if(authWall === true) { //for debugging purpose
  app.use(checkHeader); //checking if auth header exists
  app.use(checkToken); //checking jwt
  app.use(verifyAndAuthenticate); //verify of jwt
}

app.use(errorHandler); //handling errors on previous middleware steps

app.get('/', function (req, res) {
  res.send('Hello ' + req.user.GivenName + ' ' + req.user.Surname);
});

app.get('/about', function (req, res) {
  res.send('Hello ' + req.user.GivenName + ' ' + req.user.Surname);
});

app.get('/getUsers', function (req, res) {
  res.send(users);
});

app.post('/addCredit', function (req, res, next) {
  //check admin role
  /* if(req.user.Role !== 'Administrator') {
    return res.status(401).send({"error": 'User must be Administrator'});
  } */
  const params =  req.body;
  if(!params || Object.keys(params).length === 0) {
    //why next does not work?
    errorHandler(
      new Error(errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg() + ": Invalid request Body"),
      null, //req
      res,
      null
    );
  } else {
    logger.LOG_INFO('add credit body: '+ params);
    if((users.find(x => x['Email'] === params.Email) === undefined)) {
      errorHandler(
        new Error(errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg() + `Email: ${params.Email} not found`),
        null, //req
        res,
        null
      );
      return;
    } else if ( !Number.isInteger(params.CreditToAdd) || params.CreditToAdd < 0){
      errorHandler(
        new Error(errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg() + `: Invalid credit.`),
        null, //req
        res,
        null
      );
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
      } catch(err) {
        errorHandler(
          new Error(errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg() + `: ${err}`),
          null, //req
          res,
          null
        );
      }
    }
  }
});

//forcing node server to listen using IPv4
app.listen(nodePort, nodeIP, () => {
  logger.LOG_INFO(`Node Running on http://${nodeIP}:${nodePort}`);
});


//for /l %x in (1, 1, 1000) do curl -v localhost:3000/about