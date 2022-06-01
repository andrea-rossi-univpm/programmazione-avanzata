'use strict'; 
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
//relative path using './' and not '../' since this is included in index.js
const epsgFilePath = "./assets/epsg";
logger.LOG_DEBUG(`Parsing EPSG registry from ${epsgFilePath}`);

let registry = [];

// Check that the file exists locally
if(!fs.existsSync(epsgFilePath)) {
    logger.LOG_FATAL("File not found");
} else {
    const nReadlines = require('n-readlines');
    const performance = require('perf_hooks').performance;
    const broadbandLines = new nReadlines(epsgFilePath);

    let line;
    let lineNumber = 1;

    const startTime = performance.now()

    //last line  (.next()) will return false since is in while condition will exit
    while (line = broadbandLines.next()) {
        if(!line) {
            logger.LOG_WARNING(`Discarded line number ${lineNumber++}`);
            continue;
        } 
        const lineToParse = line.toString('ascii');
        //If line is a comment
        if(lineToParse.startsWith("#"))  {
            lineNumber++;
            continue;
        }
            
        
        /* 
            Element to add to registry is like:
            [
                "EPSG:32633", 
                "+proj=utm +zone=33 +datum=WGS84 +units=m +no_defs"
            ] 
        */
        // first line to parse: <3819> +proj=longlat +ellps=bessel +towgs84=595.48,121.69,515.35,4.115,-2.9383,0.853,-3.408 +no_defs  <>
        try {
            const result = lineToParse.split('<')[1].split('>').map( x => x.trim());
            registry.push(result);
        } catch (err) {
            logger.LOG_ERROR(`Error while decoding [${lineNumber}]: '${lineToParse}', error: ${err}`);
        } finally {
            lineNumber++;
        }
    }

    if(!(registry && registry instanceof Array && registry.length > 0))
        logger.LOG_FATAL('Empty registry');

    const endTime = performance.now();
    logger.LOG_INFO(`EPSG registry file loaded successfully with ${registry.length} entries in ${Math.trunc(endTime - startTime)} milliseconds`);
    module.exports = registry;
}


