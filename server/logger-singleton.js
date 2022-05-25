let instance = null

const fs = require('fs');
const timeHelper = require("./currentTime");
const errorFactory = require("./error-factory");
const loggerLevel = require("./models/logLevel");

const baseLogFileName = 'NodeJS';
const baseDirLogName = '../Logs/';
const lofFileExt = '.log';



class CLogSingleton {
    loggerFleName;

    //declaring function above, otherwise 'formatMsg is not defined'
    getLoggerFileName() {
      return `${baseDirLogName}${baseLogFileName}_${timeHelper._getCurrentTimeLinuxEpoch.call()}${lofFileExt}`;
    }

    formatMsg(logLevel, msg) {
      return `[${[loggerLevel[logLevel]]}] [${timeHelper._getCurrentTime.call()}] >> ${msg}`;
    }

    writeStream(msg) {
      if(!msg) {
        console.error("Empty log msg");
        return;
      }

      if(!this.loggerFleName) {
        console.error("logger file name has not been set");
        return;
      }

      fs.appendFileSync(this.loggerFleName, msg + '\r\n', function (err) {
        if (err) throw err;
      });
    }

    writeMsg(logLevel, msg) {
      this.writeStream(this.formatMsg(logLevel,msg));
    }

    LOG_INFO(msg) {
      this.writeMsg(loggerLevel.Information, msg);
    }

    LOG_WARNING(msg) {
      this.writeMsg(loggerLevel.Warning, msg);
    }

    LOG_ERROR(msg) {
      this.writeMsg(loggerLevel.Error, msg);
    }

    LOG_FATAL(msg) {
      this.writeMsg(loggerLevel.Fatal, msg);
    }

    LOG_TRACE(msg) {
      this.writeMsg(loggerLevel.Trace, msg);
    }

    LOG_DEBUG(msg) {
      this.writeMsg(loggerLevel.Debug, msg);
    }

    constructor() {
        //create directory for Logs if does not exists
        if (!fs.existsSync(baseDirLogName)) {
          fs.mkdir(baseDirLogName, { recursive: true }, (err) => {
            if (err) {
              factory.getError(enumHTTPStatusCodes.InternalServerError).getMsg();
            }
          });
        }

        this.loggerFleName = this.getLoggerFileName(); 
        this.writeMsg(this.formatMsg(loggerLevel.Information,"Logger Init"));
        console.log('Log init successfully.');
        
    }
    
    static getInstance() {
     if(!instance) {
         instance = new CLogSingleton();
     }
     return instance;
    }
}

module.exports = CLogSingleton;