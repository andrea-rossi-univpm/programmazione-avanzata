'use strict'; 

const singletoneLogger = require("../modules/logger-singleton");
const logger = singletoneLogger.getInstance();

const errorHandler = function(err, req, res, next) {   
    logger.LOG_ERROR(err.message);
    res.status(err.StatusCode).json({"error": err.message});
}

module.exports = errorHandler;