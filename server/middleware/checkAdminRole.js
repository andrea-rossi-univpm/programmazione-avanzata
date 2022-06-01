'use strict'; 

const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();
const enumHTTPStatusCodes = require("../models/httpsStatusCode");


const checkAdminRole = function(req, res, next){
    if (req.app.locals.users.find(x => x['Email'] === req.email).Role !== 'Administrator') {
      let err = new Error(
        errorFactory.getError(
          enumHTTPStatusCodes.Unauthorized).getMsg() + 
          `: User '${req.email}' role is not Administrator.`);
      err.StatusCode = enumHTTPStatusCodes.Unauthorized;
      require("./errorHandler")(err, req, res, null);
    } else{
      next();
    }
  };

module.exports = checkAdminRole;