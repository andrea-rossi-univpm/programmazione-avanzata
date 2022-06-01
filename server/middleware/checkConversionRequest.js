'use strict'; 

const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();
const enumHTTPStatusCodes = require("../models/httpsStatusCode");


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

  next();

  };

module.exports = checkConversionRequest;