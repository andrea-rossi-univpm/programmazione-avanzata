//JSON file could be loaded also using require function.
//In this case I use readFile to avoid cached result. (BTW Require is synchronous)
const enumHTTPStatusCodes = require("../models/httpsStatusCode");

const singletoneLogger = require("./logger-singleton");
const logger = singletoneLogger.getInstance();

/* const CErrorFactory = require("./error-factory");
const errorFactory = new CErrorFactory(); */

const fs = require('fs');
const usersFilePath = "./assets/users.json";
logger.LOG_DEBUG(`Loading users from ${usersFilePath}`);

let users = [];

// Check that the file exists locally
if(!fs.existsSync(usersFilePath)) {
    logger.LOG_FATAL("File not found");
} else {
    try {
        users = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
    } catch (err) {
        logger.LOG_FATAL("Error while parsing JSON");
        logger.LOG_ERROR((err instanceof SyntaxErrorerr) ? err.name : err.message);
    }
}


if(users && users.length > 0) {
    //redis will have key-value for [key: email], [value: credits]
    //I have to check for duplicates entries (assuming email as primary key)
    
    let hasDuplicateValue = false;
    let duplicateValue = undefined;
    //sort elements of an array in place, then using a compare function can see if (already sorted array) current and next are equal
    users.map(x => x['Email']).sort().sort((a,b) => {
        if(a === b) {
            hasDuplicateValue = true;
            duplicateValue = b;
        }
    });
    if(hasDuplicateValue === true) {
        //exit
        logger.LOG_FATAL(`Duplicate EMAIL value: ${duplicateValue}`);
    }

    module.exports = users;
    //using MAP and JOIN to beautify output
    const usersCaption = users.map( e => e['Username'] ).join(", ");
    logger.LOG_INFO(`User${users.length > 1 ? 's' :''} loaded from File (${users.length}):\t${usersCaption}`);
}