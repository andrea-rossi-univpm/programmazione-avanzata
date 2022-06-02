'use strict';

//logger singletone
const singletoneLogger = require("./logger-singleton");
const logger = singletoneLogger.getInstance();

//max retry for redis request and for manual connection error retry counter check
const maxRetry = 20;
let retry = 0;
//variable for first loading users to redis 
//(if service goes down for a few seconds and then return active I should not reset all credits!!)
//passed when included
let usersAlreadyLoadedToRedis = false;
let users;
//

require('dotenv').config();
//REDIS handler
const redis = require('ioredis');
const redisSocket = {
	host: process.env.REDIS_IP || '0.0.0.0',
	port: process.env.REDIS_PORT || 3001,
};

logger.LOG_INFO("Redis connection setting: " + JSON.stringify(redisSocket, '\t'));

const redisClient = new redis(redisSocket, {
	enableReadyCheck: true,
	showFriendlyErrorStack: true,
	maxRetriesPerRequest: maxRetry
});

// Disable client's AUTH command.
redisClient['auth'] = null;

redisClient.on('connect', () => {
	logger.LOG_INFO(`Redis Client Connected ${retry > 0 ? `
		After $ {
			retry
		}
		attempt$ {
			retry > 1 ? 's' : ''
		}
		` : '' }`);
	//resetting counter
	retry = 0;
	//Loading list to redis only If redis is connected, otherwise app will crash on Setting value
	if (!usersAlreadyLoadedToRedis)
		module.exports._SetUsers();
});



//catching redis error: in that case stop execution of node server
redisClient.on('error', err => {
	if (err.code === 'ECONNREFUSED') {
		if (retry >= maxRetry) {
			logger.LOG_FATAL('Unable to connect to redis');
		} else {
			logger.LOG_ERROR(`Connection error ${++retry}: ${err}`);
		}
	} else {
		logger.LOG_ERROR('Redis client error: ' + err);
	}
});


/* The incr() function increments a key value by 1. 
If you need to increment by a different amount, 
you can use incrby() function. 
Similarly, to decrement a key you can use the functions like decr() and decrby(). */

module.exports = {
	_AddCredits: function(email, creditToAdd) {
        redisClient.incrby(email, creditToAdd, (err, reply) => {
            if (err) {
                logger.LOG_FATAL(`Redis error on incrementing '${email}' error: ${err}`);
            }
            logger.LOG_INFO(`Redis incremented credit of user '${email}'. Actual credit: ${reply}`);
        });
	},
	_PerformCall: function(email) {
		redisClient.get(email, (err, reply) => {
			//LOG_FATAL will throw exception that are catched in the caller (checkConversionRequest)
			if (err) {
				logger.LOG_FATAL(`Redis getting '${email}' error: ${err}`);
			}

			if (parseInt(reply) <= 0) {
				logger.LOG_FATAL(`${email}' has insufficient balance`);
			}

			redisClient.decr(email, (err, reply) => {
                if (err) {
                    logger.LOG_FATAL(`Redis error on decrementing '${email}' error: ${err}`);
                }
                logger.LOG_INFO(`User '${email} spent 1 credit'. Actual credit: ${reply}`);
            });
		});
	},
	_SetUsers: function() {
		const initialUserCredits = parseInt(process.env.DEFAULT_USER_CREDIT) || 5;
		//set("<key>", "<value>")
		users.forEach(user => {
			redisClient.set(user.Email, initialUserCredits, (err, reply) => {
				if (err) {
					logger.LOG_FATAL(`Redis SET '${user.Email}' error: ${err}`);
				}
				logger.LOG_INFO(`Redis response: ${reply}. Stored '${user.Email}' with Credits: ${initialUserCredits}`);

				redisClient.get(user.Email, (err, reply) => {
					if (err) {
						logger.LOG_FATAL(`Redis getting '${user.Email}' error: ${err}`);
					}
					logger.LOG_INFO(`Redis GET '${user.Email}' with Credits: ${reply}`);

				});
			});
		});
		usersAlreadyLoadedToRedis = true;
	},
	_PassUsersList: function(_users) {
		users = _users;
	}
};