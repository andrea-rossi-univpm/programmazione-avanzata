'use strict'; 

const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();
const enumHTTPStatusCodes = require("../models/httpsStatusCode");

const checkHeader = function(req, res, next){
  const authHeader = req.headers.authorization;
  if (authHeader) {
      next();
  } else {
    let err = new Error(
      errorFactory.getError(
        enumHTTPStatusCodes.Forbidden).getMsg() + 
        ": Auth Header undefined");
    err.StatusCode = enumHTTPStatusCodes.Forbidden;
    next(err);
  }
};

module.exports = checkHeader;