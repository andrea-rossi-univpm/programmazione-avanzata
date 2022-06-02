'use strict'; 

//logger singletone
const singletoneLogger = require("../modules/logger-singleton");
const logger = singletoneLogger.getInstance();

const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();
const enumHTTPStatusCodes = require("../models/httpsStatusCode");
const redisHandler = require("../modules/redisHandler");

const checkConversionRequest = async function(req, res, next){

  const params =  req.body;
  if(!params || Object.keys(params).length === 0) {
    //why next does not work?
    let err = new Error(
      errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + ": Invalid request Body"
    );
    err.StatusCode = enumHTTPStatusCodes.BadRequest;
    require("./errorHandler")(err, req, res, null);
  } else {

    //////////////////////////////////////////////////////////////////////
    //before checking request source/dest, I would check If user can 
    // perform the request: even if is a bad request, I'll decrement credit
    // this to prevent Dos attacks consuming power on fake validation
  
    try {
      const Email = req.email;
      //checking account balance
      await redisHandler._PerformCall(Email);
    } catch(ex) {
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.Unauthorized).getMsg() + `: ${ex}`
      );
      err.StatusCode = enumHTTPStatusCodes.Unauthorized;
      next(err);
    }

    //////////////////////////////////////////////////////////////////////


    if(!params.Source) {
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + ": Undefined system Source"
      );
      err.StatusCode = enumHTTPStatusCodes.BadRequest;
      require("./errorHandler")(err, req, res, null);
      return;
    }

    if(!params.Destination) {
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + ": Undefined system Destination"      );
      err.StatusCode = enumHTTPStatusCodes.Unauthorized;
      require("./errorHandler")(err, req, res, null);
      return;
    }   
  }

  //not wrapped by else since here are used return after error handling
  next();

};

module.exports = checkConversionRequest;