
'use strict'; 

const singletoneLogger = require("../modules/logger-singleton");
const logger = singletoneLogger.getInstance();

const logRoute = function (req, res, next) {
    //processing x-forwarded-for only when setted: might be not setted (ex Ip behind proxy?)
    let clientIP = req.headers['x-forwarded-for']?.split(',').shift() || req.socket?.remoteAddress;
    //If I have an IPv4 address placed into IPv6 netork, I'll get: ::ffff:127.0.0.1
    let caption = clientIP ? `Client IP: [${clientIP}]` : undefined; 
    logger.LOG_INFO(`Requested route: [${req.method}] '${req.url}' ${caption ? caption : ''} `);
    logger.LOG_INFO(`Header: ${JSON.stringify(req.rawHeaders, '\t')}`);
    next();
  };

module.exports = logRoute;