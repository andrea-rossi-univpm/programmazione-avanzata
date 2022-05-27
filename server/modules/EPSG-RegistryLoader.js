//Loading epsg file
//Behavior for loading file:
//Discard line that starts with #
//Checking for angular brackets, betweem them I have => key
//After angular bracket, discard one space and take string between 
// +proj and <> (removing 2 white space before final angular brackets)

//To achieve this, will use N-readline that is a NPM module
//that will read file line by line without buffering the whole file in memory. 

const singletoneLogger = require("./logger-singleton");
const logger = singletoneLogger.getInstance();


const fs = require('fs');
const epsgFilePath = "../assets/epsg";
logger.LOG_DEBUG(`Parsing EPSG registry from ${epsgFilePath}`);

let registry = [];

// Check that the file exists locally
if(!fs.existsSync(epsgFilePath)) {
    logger.LOG_FATAL("File not found");
} else {
    const nReadlines = require('n-readlines');
    const broadbandLines = new nReadlines('broadband.sql');

    let line;
    let lineNumber = 1;

    while (line = broadbandLines.next()) {
        console.log(`Line ${lineNumber} has: ${line.toString('ascii')}`);
        lineNumber++;
    }
   
}

if(!(users && users instanceof Array && users.length > 0)) {
    logger.LOG_FATAL('Failed loading Users module');
    //process.exit(1); 
    //force the process to exit killing also async pending tasks (including I/O)
  }

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
