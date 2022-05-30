const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();
const enumHTTPStatusCodes = require("../models/httpsStatusCode");

const checkToken = function (req, res, next) {
    const bearerHeader = req.headers.authorization;
    if(typeof bearerHeader !== 'undefined'){
        const bearerToken = bearerHeader.split(' ')[1];
        req.token = bearerToken;
        next();
    }else{
      let err = new Error(
        errorFactory.getError(
          enumHTTPStatusCodes.Forbidden).getMsg() + 
          ": Bearer Token undefined");
      err.StatusCode = enumHTTPStatusCodes.Forbidden;
      next(err);
    }
  }

  module.exports = checkToken;