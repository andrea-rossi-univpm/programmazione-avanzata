'use strict'; 

const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();
const enumHTTPStatusCodes = require("../models/httpsStatusCode");
const redisHandler = require("../modules/redisHandler");

const checkConversionRequest = function(req, res, next){

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
      const result = redisHandler._PerformCall(req.body.Email);
      if(result) {
        logger.LOG_INFO(
          `User ${Email} spent 1 credit`
        );
      }
    } catch(ex) {
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.Unauthorized).getMsg() + `: ${ex}`
      );
      err.StatusCode = enumHTTPStatusCodes.Unauthorized;
      require("./middleware/errorHandler")(err, req, res, null);
      return;
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