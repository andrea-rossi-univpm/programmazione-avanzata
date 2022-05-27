//logger singletone
const singletoneLogger = require("./logger-singleton");
const logger = singletoneLogger.getInstance();
//REDIS handler
const redis = require('redis');
const redisSocket = {
    host: process.env.REDIS_IP || '0.0.0.0',
    port: process.env.REDIS_PORT || 3001,
};
logger.LOG_INFO("Redis connection setting: " + JSON.stringify(redisSocket,'\t'));

const redisClient = redis.createClient(redisSocket);

// Disable client's AUTH command.
redisClient['auth'] = null;

redisClient.on('connect', () => {
    console.log('::> Redis Client Connected');
});

//catching redis error: in that case stop execution of node server
redisClient.on('error', err => {
  logger.LOG_FATAL('Redis client error: ' + err);
});

module.exports = {
    _AddCredits: function(credit) {
        console.log(this)
    },
    _PerformCall: function(email) {
        console.log(this)
    },
    _SetUsers: function(users) {
        console.log("sono nel modulo!!!!!!!!", users)
    }
}