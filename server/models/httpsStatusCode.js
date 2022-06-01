'use strict'; 

//most common 30x, 4xx,5xx errors
module.exports = enumHTTPStatusCodes = {
    None: 0,
    //Redirectional
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    //Client Errors
    BadRequest: 400,
    Unauthorized: 401,
    Forbidden: 403,
    NotFound: 404,
    Conflict: 409,
    PlayloadTooLarge: 410,
    UnprocessableEntity: 422,
    TooManyRequests: 429,
    //Server Errors
    InternalServerError: 500, //worst
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    NetworkAuthenticationRequired: 511
}