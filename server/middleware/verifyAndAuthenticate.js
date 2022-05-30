const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();

const jwt = require('jsonwebtoken');

const verifyAndAuthenticate = function(req, res, next){
    let decoded = jwt.verify(req.token, 'mysupersecretkey');
    if(decoded !== null) {
      req.email = decoded;
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
      
  }

  module.exports = verifyAndAuthenticate;
  