const singletoneLogger = require("../logger-singleton");
const logger = singletoneLogger.getInstance();

const latMax = 90.0000000;
const latMin = -90.0000000;

const longMax = 180.0000000;
const longMin = -180.0000000;


let validator = {
  set(obj, prop, value) {
    switch(prop) {
      case 'Latitude':
        if (!Number.isInteger(value)) {
          logger.LOG_ERROR('Latitue is not an integer');
          return false;
        }
        if (value > latMax || value < latMin) {
          logger.LOG_ERROR(`Latitude out of range ${latMin}~${latMax}`);
          return false;
        }
        //storing the value
        obj[prop] = value;
        break;
      case 'Longitude':
        if (!Number.isInteger(value)) {
          logger.LOG_ERROR('Longitude is not an integer');
          return false;
        }
        if (value > longMax || value < longMin) {
          logger.LOG_ERROR(`Longitude out of range ${latMin}~${latMax}`);
          return false;
        }
        //storing the value
        obj[prop] = value;
        break;
      default:
        logger.LOG_WARNING(`Unknown property ${prop}`)

    }
    // Indicate success
    return true;
  }
};

module.exports = LatLongCoordinates  = new Proxy({}, validator);

/* chord.Latitude = 30;
chord.Longitude= 30;
console.log(chord); // 30,30
chord.Latitude = 300; //exc
chord.Longitude= 300; //exc */