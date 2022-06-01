'use strict'; 

const CErrorFactory = require("../modules/error-factory");
const errorFactory = new CErrorFactory();
const enumHTTPStatusCodes = require("../models/httpsStatusCode");

//checking body, email and credit if its a number and positive
const checkCreditRequest = function(req, res, next){
  const params = req.body;

  //checking body
  if(!params || Object.keys(params).length === 0) {
    
    let err = new Error(
      errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + ` Invalid request Body`
    );
    err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
    require("./errorHandler")(err, req, res, null);

  } else if((req.app.locals.users.find(x => x['Email'] === params.Email) === undefined)) {
    //checking mail to increment credits if exists, if not 422
    let err = new Error(
      errorFactory.getError(enumHTTPStatusCodes.UnprocessableEntity).getMsg() + ` Email: ${params.Email} not found`
    );
    err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
    require("./errorHandler")(err, req, res, null);

  } else if ( !Number.isInteger(params.CreditToAdd) || params.CreditToAdd <= 0) {
    //checking if value provided as CreditToAdd is a number and is positive
    let err = new Error(
      errorFactory.getError(enumHTTPStatusCodes.BadRequest).getMsg() + ` Invalid credit.`
    );
    err.StatusCode = enumHTTPStatusCodes.BadRequest;
    require("./errorHandler")(err, req, res, null);

  } else {
    //all validation successfully passed
    next();
  }

  

  };

module.exports = checkCreditRequest;