'use strict'; 

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
      if(decoded.Email) {
        req.email = decoded.Email;
      } else {
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

//very bad, only for backup
//AROSSI: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTM5MTgzOTMsImV4cCI6MTY4NTQ1NDM5MywiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiQVJPU1NJIiwiRW1haWwiOiJhbmRyZWEucm9zc2lAdW5pdnBtLml0IiwiUm9sZSI6IlVzZXIifQ.qtVuC28jh3zNuegIlOBEhkwYqJf2mMmK3PARaocp4rg
//AMANCINI: eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJPbmxpbmUgSldUIEJ1aWxkZXIiLCJpYXQiOjE2NTM5MjU1MjksImV4cCI6MTY4NTQ2MTUyOSwiYXVkIjoid3d3LmV4YW1wbGUuY29tIiwic3ViIjoiQU1BTkNJTkkiLCJFbWFpbCI6ImFkcmlhbm8ubWFuY2luaUB1bml2cG0uaXQiLCJSb2xlIjoiQWRtaW5pc3RyYXRvciJ9.LThXR4phcBpd6tRA6QX3jd_wDZ4lXuLineOps_bsGcU