
var timeHelper = require("./currentTime");
var enumHTTPStatusCodes = require("./models/httpsStatusCode");


class CMsg {
    getMsg() {
        return "Default message";
    }

    /* protected */ getCurrentTime() {
        return timeHelper._getCurrentTime.call();
    }
}



class TemporaryRedirect extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Temporary Redirect`;
    }
}
class PermanentRedirect extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Permanent Redirect`
    }
}
class BadRequest extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Bad Request`;
    }
}
class Unauthorazied extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Unauthorazied`;
    }
}
class Forbidden extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Forbidden`;
    }
}
class NotFound extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Not Found`;
    }
}
class Conflict extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Conflict`;
    }
}
class PlayloadTooLarge extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Playload Too Large`;
    }
}
class UnprocessableEntity extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Unprocessable Entity`;
    }
}
class TooManyRequests extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Too Many equests`;
    }
}
class InternalServerError extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Internal ServerError`;
    }
}
class NotImplemented extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Not Implemented`;
    }
}
class BadGateway extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Bad Gateway`;
    }
}
class ServiceUnavailable extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Service Unavailable`;
    }
}
class GatewayTimeout extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Gateway Timeout`;
    }
}
class NetworkAuthenticationRequired extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Network Authentication Required`;
    }
}

class GenericError extends CMsg  {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Internal Server Error`;
    }
}

class UnhandledError extends CMsg {
    getMsg() {
        return `[${this.getCurrentTime()}] >> Unhandled Error`;
    }
}

class CErrorFactory {
    constructor(){
        console.log("Factory Class Init");
    }

    getError (type/*: enumHTTPStatusCodes*/)/* : CMsg */{
        let retval/* : CMsg */ = null;
        switch (type){
            case enumHTTPStatusCodes.TemporaryRedirect:
                retval = new TemporaryRedirect();
                break;
            case enumHTTPStatusCodes.PermanentRedirect:
                retval = new PermanentRedirect();
                break;
            case enumHTTPStatusCodes.BadRequest:
                retval = new BadRequest();
                break;
            case enumHTTPStatusCodes.Unauthorazied:
                retval = new Unauthorazied();
                break;
            case enumHTTPStatusCodes.Forbidden:
                retval = new Forbidden();
                break;
            case enumHTTPStatusCodes.NotFound:
                retval = new NotFound();
                break;
            case enumHTTPStatusCodes.Conflict:
                retval = new Conflict();
                break;
            case enumHTTPStatusCodes.PlayloadTooLarge:
                retval = new PlayloadTooLarge();
                break;
            case enumHTTPStatusCodes.UnprocessableEntity:
                retval = new UnprocessableEntity();
                break;
            case enumHTTPStatusCodes.TooManyRequests:
                retval = new TooManyRequests();
                break;
            case enumHTTPStatusCodes.InternalServerError:
                retval = new InternalServerError();
                break;
            case enumHTTPStatusCodes.NotImplemented:
                retval = new NotImplemented();
                break;
            case enumHTTPStatusCodes.BadGateway:
                retval = new BadGateway();
                break;
            case enumHTTPStatusCodes.ServiceUnavailable:
                retval = new ServiceUnavailable();
                break;
            case enumHTTPStatusCodes.GatewayTimeout:
                retval = new GatewayTimeout();
                break;
            case enumHTTPStatusCodes.NetworkAuthenticationRequired:
                retval = new NetworkAuthenticationRequired();
                break;
            default:
                retval = new UnhandledError();
        }
        return retval;
    }

}

/*let factory  = new ErrorFactory();
console.log(factory.getError(enumHTTPStatusCodes.BadGateway).getMsg())
console.log(factory.getError(enumHTTPStatusCodes.Conflict).getMsg())
console.log(factory.getError(enumHTTPStatusCodes.InternalServerError).getMsg())
console.log(factory.getError(3212).getMsg()) 
*/
 

module.exports = CErrorFactory;