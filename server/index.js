console.log(`INDEX Startup at ${Date.now()}`);
var nodePort = 3000;

const loggerLevel = require("./models/logLevel");

const singletoneLogger = require("./logger-singleton");

const logger = singletoneLogger.getInstance();
//const logger2 = singletoneLogger.getInstance();

logger.LOG_INFO("Index.js Startup");

//singleton logger tests:
//logger2.LOG_ERROR("test");
//console.log("Equals:: ", logger === logger2);

var os = require('os');
var express = require('express');
const jwt = require('jsonwebtoken');
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
        next("no auth header");
    }
};

var checkHeader = function(req, res, next){
    const authHeader = req.headers.authorization;
    if (authHeader) {
        next();
    }else{
        let err = new Error("ahi ahi no auth header");
        next(err);
    }
};

function checkToken(req,res,next){
  const bearerHeader = req.headers.authorization;
  if(typeof bearerHeader!=='undefined'){
      const bearerToken = bearerHeader.split(' ')[1];
      req.token=bearerToken;
      next();
  }else{
      res.sendStatus(403);
  }
}

function verifyAndAuthenticate(req,res,next){
  let decoded = jwt.verify(req.token, 'mysupersecretkey');
  if(decoded !== null)
    req.user = decoded;
    next();
}

function logErrors(err, req, res, next) {
    console.error(err.stack);
    next(err);
  }

function errorHandler(err, req, res, next) {   
    res.status(500).send({"error": err.message});
}
  

app.use(logRoute);
/* app.use(requestTime);
app.use(checkToken);
app.use(verifyAndAuthenticate);
app.use(logErrors);
app.use(errorHandler); */

app.get('/', function (req, res) {
  res.send('Hello ' + req.user.GivenName + ' ' + req.user.Surname);
});

app.get('/about', function (req, res) {
  res.send('Hello ' + req.user.GivenName + ' ' + req.user.Surname);
});

//forcing node server to listen using IPv4
app.listen(nodePort, '0.0.0.0');
logger.LOG_DEBUG("Node listening at port: " + nodePort);