'use strict'; 
//logger singletone
const singletoneLogger = require("./logger-singleton");
const logger = singletoneLogger.getInstance();

require('dotenv').config();
//REDIS handler
const redis = require('ioredis');
const redisSocket = {
    host: process.env.REDIS_IP || '0.0.0.0',
    port: process.env.REDIS_PORT || 3001,
};

logger.LOG_INFO("Redis connection setting: " + JSON.stringify(redisSocket,'\t'));

//how to catch redis service offline?
//using IORedis package instead of 'redis'
//connection refused
const redisClient = /*await*/ new redis(redisSocket, 
    { 
        enableReadyCheck: true,
        showFriendlyErrorStack: true,
        maxRetriesPerRequest: 10,
        retryStrategy(times) {
            const delay = Math.min(times * 50, 2000);
            return delay;
        } 
    },
   
);

// Disable client's AUTH command.
redisClient['auth'] = null;

redisClient.on('connect', () => {
    logger.LOG_INFO('Redis Client Connected');
});

//catching redis error: in that case stop execution of node server
redisClient.on('error', err => {
  logger.LOG_ERROR('Redis client error: ' + err);
});

//REDIS Function used on data: 'set' update if exists - create if it doesn't. 

function getKeyValue(key) {
    redisClient.get(key, (err, reply) => {
        if(err) {
            logger.LOG_FATAL(`Redis getting '${key}' error: ${err}`);
        } 
        //if key (email) exists
        return reply;
    });
}

function setValue(key, value) {
    redisClient.set(key, value, (err, reply) => {
        if(err) {
            //to catch in parent bubble
            logger.LOG_FATAL(`Redis setting '${user}' error: ${err}`);
        } 
        logger.LOG_INFO(`Set success: ${reply}`);
    });
}

/* The incr() function increments a key value by 1. 
If you need to increment by a different amount, 
you can use incrby() function. 
Similarly, to decrement a key you can use the functions like decr() and decrby(). */

module.exports = {
    _AddCredits: function(email, creditToAdd) {
        const keyValue = getKeyValue(email);
        if(keyValue) {
            setValue(keyValue['key'], keyValue['value'] + creditToAdd);
            return true;
        } 
        return false;
    },
    _PerformCall: function(email) {
        const keyValue = getKeyValue(email);
        if(keyValue) {
            if(keyValue['value'] <= 0) {
                //to catch in parent bubble
                logger.LOG_FATAL(`Insufficient balance for user ${email}`);
                return false;
            }
            
            setValue(keyValue['key'], keyValue['value'] - 1);
            return true;
        } 
    },
    _SetUsers: function(users) {
        const initialUserCredits = parseInt(process.env.DEFAULT_USER_CREDIT) || 5;
        //set("<key>", "<value>")
        users.forEach( user => {
            redisClient.set(user.Email, initialUserCredits, (err, reply) => {
                if(err) {
                    //to catch in parent bubble
                    logger.LOG_FATAL(`Redis SET '${user.Email}' error: ${err}`);
                } 
                logger.LOG_DEBUG(`Redis stored '${user.Email}' with Credits: ${initialUserCredits}`);
            
                redisClient.get(user.Email, (err, reply) => {
                    if(err) {
                        logger.LOG_FATAL(`Redis getting '${user.Email}' error: ${err}`);
                    } 
                    logger.LOG_DEBUG(`Redis GET '${user.Email}' with Credits: ${initialUserCredits}`);

                });
            });
        });
        
        logger.LOG_INFO(`Finish redis setup with ${users.length} user${users.length > 1 ? 's' : ''}`);
    },
    _getCreditByEmail: function(email) {
        const keyValue = getKeyValue(email);
        if(keyValue) 
            return keyValue['value']; 
    }
}