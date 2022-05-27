'use strict';
let instance = null;

const fs = require('fs');
const timeHelper = require("./currentTime");
const loggerLevel = require("../models/logLevel");
const CErrorFactory = require("./error-factory");
const baseLogFileName = 'NodeJS';
const baseDirLogName = '../Logs/';
const lofFileExt = '.log';

const errorFactory = new CErrorFactory();
//console.log(errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg());

class CLogSingleton {
    loggerFleName;

    //declaring function above, otherwise 'formatMsg is not defined'
    getLoggerFileName() {
      return `${baseDirLogName}${baseLogFileName}_${timeHelper._getCurrentTimeLinuxEpoch.call()}${lofFileExt}`;
    }

    formatMsg(logLevel, msg) {
      return `[${Object.keys(loggerLevel)[logLevel]}] [${timeHelper._getCurrentTime.call()}] >> ${msg}`;
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
        if (err) {
          errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg();
          throw err;
        }
        //since there is not try/catch block throw will raises an exception in the current code block
        //instead console.err just print a red color message on debug console
      });
    }

    writeMsg(logLevel, msg) {
      this.writeStream(this.formatMsg(logLevel,msg));
    }

    LOG_INFO(msg) {
      this.writeMsg(loggerLevel.INF, msg);
      console.log(msg);
    }

    LOG_WARNING(msg) {
      this.writeMsg(loggerLevel.WRN, msg);
      console.warn(msg);
    }

    LOG_ERROR(msg) {
      this.writeMsg(loggerLevel.ERR, msg);
      console.error(msg);
    }

    LOG_FATAL(msg) {
      this.writeMsg(loggerLevel.FTL, msg);
      //stop execution of program
      throw msg;
    }

    LOG_TRACE(msg) {
      this.writeMsg(loggerLevel.TRC, msg);
    }

    LOG_DEBUG(msg) {
      this.writeMsg(loggerLevel.DBG, msg);
    }

    constructor() {
      this.loggerFleName = this.getLoggerFileName(); 

        //create directory for Logs if does not exists
        if (!fs.existsSync(baseDirLogName)) {
          fs.mkdir(baseDirLogName, { recursive: true }, (err) => {
            if (err) {
              errorFactory.getError(enumHTTPStatusCodes.InternalServerError).getMsg();
              return;
            }
          });
          this.LOG_TRACE("Directory created: " + baseDirLogName);
        } else {
          this.LOG_TRACE("Directory already existing: " + baseDirLogName);
        }
        
        this.LOG_TRACE("Logger Init");
        this.LOG_DEBUG("Current directory: " + __dirname);
    }
    
    static getInstance() {
     if(!instance) {
         instance = new CLogSingleton();
     }
     return instance;
    }
}

module.exports = CLogSingleton;