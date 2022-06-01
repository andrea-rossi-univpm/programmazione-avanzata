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
        maxRetriesPerRequest: 20
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


/* The incr() function increments a key value by 1. 
If you need to increment by a different amount, 
you can use incrby() function. 
Similarly, to decrement a key you can use the functions like decr() and decrby(). */

module.exports = {
    _AddCredits: async function(email, creditToAdd) {
        redisClient.incrby(email, creditToAdd);
    },
    _PerformCall: function(email) {
        redisClient.get(email, (err, reply) => {
            if(err) {
                logger.LOG_ERROR(`Redis getting '${user.Email}' error: ${err}`);
            } 

            redisClient.decr(email);
        });
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
                logger.LOG_INFO(`Redis stored '${user.Email}' with Credits: ${initialUserCredits}`);
            
                redisClient.get(user.Email, (err, reply) => {
                    if(err) {
                        logger.LOG_FATAL(`Redis getting '${user.Email}' error: ${err}`);
                    } 
                    logger.LOG_INFO(`Redis GET '${user.Email}' with Credits: ${initialUserCredits}`);

                });
            });
        });
        
        logger.LOG_INFO(`Finish redis setup with ${users.length} user${users.length > 1 ? 's' : ''}`);
    },
    _getCreditByEmail: function(email) {
        redisClient.get(user.Email, (err, reply) => {
            if(err) {
                logger.LOG_FATAL(`Redis getting '${user.Email}' error: ${err}`);
            } 
            return reply;
        });
    }
}