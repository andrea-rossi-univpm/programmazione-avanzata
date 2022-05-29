//simple lat/long coordinates: Latitude: 43.6391249, Longitude: 13.3614249

const singletoneLogger = require("../modules/logger-singleton");
const logger = singletoneLogger.getInstance();


let validator = {
  set(obj, prop, value) {
    switch(prop) {
      case 'Latitude':
        if (value === null || value === undefined) {
          logger.LOG_FATAL('Latitue is undefined');
          //return false;
        } else if(!Number.isInteger(value)) {
          logger.LOG_FATAL('Latitue is not an integer');
          //return false;
        }
       
        //storing the value
        obj[prop] = value;
        break;
      case 'Longitude':
        if (value === null || value === undefined) {
          logger.LOG_FATAL('Longitude is undefined');
          //return false;
        }
        if (!Number.isInteger(value)) {
          logger.LOG_FATAL('Longitude is not an integer');
          //return false;
        }
       
        //storing the value
        obj[prop] = value;
        break;
      default:
        logger.LOG_WARNING(`Unknown property ${prop}`)

    }
    // Indicate success
    //return true;
  }
};

//If there is an error using LOG_FATAL will raise an exception that will be caught in the caller function

module.exports = LatLongCoordinates  = new Proxy({}, validator);
