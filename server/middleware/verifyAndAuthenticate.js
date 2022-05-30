const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();
const enumHTTPStatusCodes = require("../models/httpsStatusCode");

const jwt = require('jsonwebtoken');
require('dotenv').config();

const verifyAndAuthenticate = function(req, res, next) {
    try {
      //existing value of  process.env.SECRET_KEY is checked in index.js
      let decoded = jwt.verify(req.token, process.env.SECRET_KEY);
      if(decoded) {
        if(decoded.Email)
          req.email = decoded.Email;
        else {
          let err = new Error(
            errorFactory.getError(
              enumHTTPStatusCodes.Unauthorized).getMsg() + 
              `: Missing Email`);
          err.StatusCode = enumHTTPStatusCodes.Unauthorized;
          next(err);
        }
        //accessing global variable through req.app.locals
        if((req.app.locals.users.find(x => x['Email'] === req.email) === undefined)) {
          let err = new Error(
            errorFactory.getError(
              enumHTTPStatusCodes.Unauthorized).getMsg() + 
              `: Invalid mail ${req.email}`);
          err.StatusCode = enumHTTPStatusCodes.Unauthorized;
          next(err);
        } else {
          next();
        }
      } else {
        let err = new Error(
          errorFactory.getError(
            enumHTTPStatusCodes.Unauthorized).getMsg() + 
            ": JWT verification failed");
        //passing also a dynamic status code to error handler
        err.StatusCode = enumHTTPStatusCodes.Unauthorized;
        next(err);
      }
    } catch(ex) {
      let err = new Error(
        errorFactory.getError(
          enumHTTPStatusCodes.Unauthorized).getMsg() + 
          `: JWT Verification failed: ${ex}`);
      err.StatusCode = enumHTTPStatusCodes.Unauthorized;
      next(err);
    }
  }

  module.exports = verifyAndAuthenticate;
  