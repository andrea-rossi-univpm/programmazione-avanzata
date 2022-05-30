const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();

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
              enumHTTPStatusCodes.Unauthorazied).getMsg() + 
              `: Missing Email`);
          err.StatusCode = enumHTTPStatusCodes.Unauthorazied;
          next(err);
        }

        if((users.find(x => x['Email'] === req.email) === undefined)) {
          let err = new Error(
            errorFactory.getError(
              enumHTTPStatusCodes.Unauthorazied).getMsg() + 
              `: Invalid mail ${req.email}`);
          err.StatusCode = enumHTTPStatusCodes.Unauthorazied;
          next(err);
        } else {
          next();
        }
      } else {
        let err = new Error(
          errorFactory.getError(
            enumHTTPStatusCodes.Unauthorazied).getMsg() + 
            ": JWT verification failed");
        //passing also a dynamic status code to error handler
        err.StatusCode = enumHTTPStatusCodes.Unauthorazied;
        next(err);
      }
    } catch(ex) {
      let err = new Error(
        errorFactory.getError(
          enumHTTPStatusCodes.Unauthorazied).getMsg() + 
          `: JWT Verification failed: ${ex}`);
      err.StatusCode = enumHTTPStatusCodes.Unauthorazied;
      next(err);
    }
  }

  module.exports = verifyAndAuthenticate;
  