# Project of Advance Programming
## Purpose of the project
The project is focused on building from scratch a web application, using the newest, powerful and open source developing technologies such as NodeJS, Angular, Docker, Redis, proj4js, Visual Studio code as IDE and a modern browser like Google Chrome with its developer tool.

|Technology|Version|
|----------|-------|
|NodeJS|16.15.0|
|Angular|13.3.0|
|proj4|2.8.0|
|redis|4.1.0|
|express|4.18.1|


The functioning of the web application provides the possibility to convert a latitude / longitude pair, an array of pairs or a geoJSON specifying the source system and the destination system.
<br><br>
Different systems of conversion are loaded by an official `epsg` file where each system has its own representation recipe. <br><br>
The conversion its handled in the end by `proj4js` lib, so the web application could be defined as a wrapper towards the library.
<br><br>
Accessing the application for using a conversion its restricted to users defined in an assets file with an authentication based on bearer json web token, formely know as `JWT`. For completing a conversion request the user must have a credit. At the startup of the application each user has a default credit, on each request (also an incorrect request) the credit are decrement. An user that has finished the credit can't make request anymore, in that case the user is `unauthorized`. For adding a new credit to user is provided one method accessible only for Administrator user, the role is also defined in the assets file.

## Structure of the Web Application
In the back-end side the application is writtern in pure Javascript, known also as `Vanilla Javascript`. Its used also open source express framework for making in fact an a WebAPI.
<br><br>
For a better programming and a scalable code index file use a lot of modules exported from other js files. Included modules will in turn include other modules as needed. In particoular, project dir has different folders, analyzed in the below section.

## Assets
Contains assets file like:
1. List of users as JSON file: User is defined as follow:
    * username
    * email (primary key)
    * role
2. EPSG registry for handling different systems of rappresentation.

## Models
1. CoordinatesLatLon-Proxy
Implementation of `Proxy Pattern` for validation Latitude and Longitude inputs. The validation checks if the value provided is not null, undefined, empty string and its a number. If the validation fail, will be thrown an exception, (caught in the caller) about the detailed validation fail message. 
2. httpsStatusCode
Javascript style enumeration for the most common 30x, 4xx,5xx Http status code.
3. logLevel
Enumeration like previous, rappresenting different levels of log.

## Modules
### Current time
An helper module that provide functions about getting current time: <br>
1. `GetCurrentTime`: that return a date formatted as follow: DD/MM/YYYY HH:mm:SS:mss
2. `GetCurrentTimeLinuxEpoch`: that return date in linux epoch, so the number of seconds since January 1, 1970 at 00:00 Greenwich Mean Time.
### Error Factory
This module expose a class based on `Factory design pattern` that allows to handle different http status code to be created in a flexible and reusable way, using a generic interface. (Since in javascript interfaces does not exists, this is implemented using a class with extends keywords)

### Logger Singleton

As the name suggest, this module implement a logger class using a `Singleton pattern`. <br>
This pattern ensures that there is only one instance of the logger class. To achieve this, the class has a static function called `getInstance` that create a new instance if there its the first time that its called, otherwise will return the previous created instance.
<br>When its created the first and only instance, obviously will be called the constructor of the class and the logger will be initialized as below:<br>
 1. Name of the log are setted concatenating a prefix string (Node_) and current time in linux epoch.
 2. Requiring `fs` will be created if not exist in the parent folder of working dir a folder called 'Logs' (that is setted as parameter).
 3. The logger is ready 
<br> <br>
The logger class expose these methods:
* LOG_TRADE(...) -> wrap a console.log
* LOG_DEBUG(...) -> wrap a console.log
* LOG_INFO(...) -> wrap a console.log
* LOG_WARNING(...) -> wrap a console.warning
* LOG_ERROR(...) -> wrap a console.error
* LOG_FATAL(...) -> throw an exception stopping the program if not catched in the caller. <br><br>
That incapsulating the log process (act as wrapper), where the message is written using `appendFileSync` function.
<br>
The message appended at the end of file its format with:
    * Level of log
    * Current time stamp with milliseconds
    * Message

In the project the logger is injected almost in all modules and the message are formatted using the factory design pattern described before.

### Users Loader
This module takes care about loading the users from assets file. Use simply the following instrunction:
```` javascript
JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'));
````
Where after loading with `readFileSync` with UTF-8 encoding will try to parse the JSON. If everything does not throw up any exception after that will be check if records has a duplicate Email value. This is important becouse redis will use this data and can't permit duplicate primary key.
The duplicate check is being made by double sort (using quick sort) where the second sort in the comparing function compare previous with current element.
After that users loaded are exported using `module.exports`.

### EPSG Registry Loader
This module handle EPSG, the assets file about system definition. Use the external package `n-readlines` where each line is readed and elaborated, discarding comments line that starts with `#`.
To elaborate a line (converted in ascii), its used a clever approach, a double split, a map and a trim. This will give a result of key/value as system/definition.

The process of loading all file is timed using `performance.now()`. Loading a file with about 5500 record with I7 7700HQ and m2SSD took about 85~100 milliseconds.
### Redis Handler
This module allows to manage the connection between the application and redis and to manage set/get request. All communication is made using `io-redis` package. <br>
On connection error will be displayed the `ECONNREFUSED` error and after 20 attempt of reconnection (Reconnection is handled internally by io-redis) through a LOG_FATAL the process will stop (since redis is required). <br>
On connection succesfully, will be setted on redis the users loaded with the users loade module described before. After that will be set a flag that avoid to reload (so reset credits) users if connection drop and will be restored.
Are exported outside these functions:
1. `AddCredits`: Handle the increment of credit for an user. As input has the email to increment the credit and the credit to actually increment. Uses `incrby()` function.
2. `PerformCall`: async/await function that blocks the execution of program as soon it finish the statements. Its important to check the email credit before to skip to any other function (since everything is asynchronous in Node). If user has no credit, will be returned an Unauthorized (401) response. Otherwise current credit will be decrement by one, using this time the function `decr()` and the execution of the program will continue.
3. `PassUsersList`: Set in the current file a variable of users loaded by Users Loader in the index file. This var will be used by other functions in this module.
4. `SetUsers`: Set the users loaded previously to redis. The initial credit are defined in the .env file as DEFAULT_USER_CREDIT variable and if not are defined 5 as default. The value/key are registred to redis using a double check function of set/get. <br> This function is called on 'connect' event of redis but only one time, using a flag.

### Object Helper
Utils module for operating with objects. Might be enriched with more auxiliary functions in the future. For now the only function exported is for extracting multiple `coordinates` key on geoJSON of type `FeatureCollection`. This is done using functional programming with redux, recursion, concatenation of arrays and ObjectEntries function to iterate over key/value pair of an object passed in input.

### Conversion Handler
This module use directly proj4js library including it using `require("proj4")`. <br> Export outside:
1. `setEPSGRegistry` : Using `proj4jsLIB.defs` function set definition of previously loaded EPSG registry iterating with `forEach` each entries and adding 'EPSG:' to the system name.
2. `convertLatLong` : Perform a conversion of latitude / longitude couple, other this as parameter are passed also source and destination system. Conversion is performed using `forward()` function.

## Middleware
The application made extensive use of middleware. Several executed at each rest call and few custom middleware for single or couple of methods.
### Log Route Middleware
First middleware that log the request endpoint, client IP and header.

### Error Handler Middleware
Middleware used when an error occurred. The error is logged and with a `res.status` function its also send to the caller of request. Error is formatted using the Factory Design Pattern previously described with also the Http status code:
```` javascript
const errorHandler = function(err, req, res, next) {   
    logger.LOG_ERROR(err.message);
    res.status(err.StatusCode).json({"error": err.message});
}
````
This middleware its also called inside an actual request, using the following syntax:
```` javascript
catch(ex) {
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.UnprocessableEntity).getMsg() + `: ${ex}`
      );
      err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
      require("./middleware/errorHandler")(err, req, res, null);
      return;
  }
````
### Authentication Middleware
#### Check Header Middleware
Verify if `req.headers.authorization` has value, if not the execution of call does not continue and ends up on error handler middleware mentioned before using `next(err)` function.
#### Check Token Middleware
Retriving and checking the JWT token, `splitting` the req.headers.authorization and taking the last part, if there are no exception with `next()` will be executed the next auth middleware.
#### Verify and Authenticate Middleware
Using `jsonwebtoken` package is possibly to decode the JWT using the `SECRET_KEY` stored on the .env file. <br>
If the token is validated but the email on it is not on users loaded at startup the middleware ends up in the error handler.

### Custom Middleware
#### Check Admin Role
Verify back-end side if the email given as input is present on the system and it's role is `Administrator`. <br> This middleware like the other custom uses the same approach: If the validation is successfully with `next()` the execution continue (so the get/post/put method will be executed), If the validation fail will be used the error handler with the following syntax as usual: 
```` javascript
 let err = new Error(
      errorFactory.getError(
        enumHTTPStatusCodes.Unauthorized).getMsg() + 
        `: User '${req.email}' role is not Administrator.`);
    err.StatusCode = enumHTTPStatusCodes.Unauthorized;
    require("./errorHandler")(err, req, res, null);
`````

#### Check Credit Request
This middleware validate the `AddCredit` (
which will be introduced later) request. <br>
In particoular:
1. Will be checked the body if is not null/undefined.
2. Will be checked the email if exists on users loaded.
3. Will be check the credit value if is an integer (can not be a float value), using `Number.isInteger` function and if it is a number major than zero.

#### Check Conversion Request
Custom middleware used on the three type of conversion request (couple, array, geoJSON). <br>
Here are validated:
1. The body request
2. The email presence on the body request
3. Using the function introduced before `PerformCall` with await to block execution of program (want to wait redis to response about the email provided as input), check If the email can perform the request and if yes decrementing its credits.
4. Checking if Source is not `null - undefined - 0 - '' - false` simply with:
    ```` javascript
    if(!params.Source) 
    ```` 
5. Checking if provided Source is present on the EPSG file loaded at startup using `indexOf` function.
6. Same checks for Destination (point 4 and 5)

If one validation will not pass the erro handler is called, otherwise the execution continue with `next()`

## Index.js
Index.js is the current entry point of the application.
Through the use of `require()` all modules/middleware introduced before can be used. <br>
At the beginning are loaded the environment variable configuration inside `.env` file, after that following modules are used:
1. Logger: using its `getInstance()`
2. Users to load with its module. The users are stored in a global variable using node with the following syntax to grant an easier access to external modules without passing it as parameter (works only if req is defined):
    ```` javascript
    app.locals.users = users; 
    ```` 
3. Redis handler that start the connection and passing user list with `PassUsersList()` function
4. ErrorFactory class for message easy construction
5. EPSG registry to load with the `EPSG-RegistryLoader` module and setting it to the proj4j lib with `_setEPSGRegistry` function
6. `Express`, web framework for building post/get/put request methods structure.
7. `Cors`, `express/lib/request` and `express.json()`: to allow angular client to talk with back-end.
8. through `app.use()` express can define middleware to use on each request. (There is a flag to exclude/include authorization middleware, default is true):
    * logRoute
    * checkHeader
    * checkToken
    * verifyAndAuthenticate
    * errorHandler
    
### Rest API
#### getUsers [GET]
Retrieve all users loaded from assets file, using `res.send()` function.
#### convertLatLong [POST]
This endpoint besides the global middleware implement also `checkConversionRequest` middlware.
Using `CoordinatesLatLon-Proxy` can validate inputs and then using `proj4j._convertLatLong(...)` can perform the conversion that is also wrapped into a try/catch statement to prevent library failures.<br>
The response is send to the front-end as JSON as follow:
```` javascript
    try {
      const conversionResult = proj4j._convertLatLong(
        params.Source,
        params.Destination,
        coordinatesLatLonProxy.Latitude,
        coordinatesLatLonProxy.Longitude
      );
      res.status(200).json(conversionResult);
    } catch(ex) {
      //proj4j lib could not convert so it's an unprocessable entity error code
      let err = new Error(
        errorFactory.getError(enumHTTPStatusCodes.UnprocessableEntity).getMsg() + ` ${ex}`
      );
      err.StatusCode = enumHTTPStatusCodes.UnprocessableEntity;
      require("./middleware/errorHandler")(err, req, res, null);
      return;
    }
```` 

#### convertArrayLatLong [POST]
Similar to the previous, also this implement the custom middleware validator. Use the same approach inside a foreach loop (also wrapped in a try/catch) as follow
```` javascript
    let response = new Array();
    params.ArrayLatLon.forEach(x => {
      response.push(proj4_convertLatLong(
        params.Source,
        params.Destination,
        x[0],
        x[1]
      ));
    });
    res.status(200).json(response);
````
#### convertGeoJSON [POST]
This method use same principle of previous, by the way since it to handle a geoJSON format its used `geojson-validation` package for validate the input beyond null/undefined/'' value or missing `coordinates` key on it. <br>
This method assume that the type of the geoJSON is `FeatureCollection`.
Using `_findObjValuesByKey` can retrieve nested coordinates value and then convert them using the wrap of proj4js inside of a forEach loop.

#### addCredit [POST]
This method allows to increment credit of an email set up on redis. It's implemented the custom middleware `checkAdminRole` described before and it's important to point up that this should be done only using a POST metod becouse GET method is supposed to not modify any value.

#### getEPSG [GET]
Method for retrving EPSG (only key) as EPSG:xxxx for building type-ahead in front-end side.

At the end of definition of methods node server startup using the following syntax:
```` javascript
    app.listen(nodePort, nodeIP, () => {
        const os = require('os');
        logger.LOG_INFO(
            `Node ${process.version} Running on http://${nodeIP}:${nodePort} on ${os.type()}: ${os.version()}`);
    });
````

### Setting up Docker
For redis:
```` javascript
docker pull redis
docker run -d -p 6379:6379 --name redis-windows redis
```` 
For server, inside node-server dir run : 	
```` javascript
docker build --pull --rm -f "Dockerfile" -t server:latest "."
```` 
For client inside angular-client dir run:	
```` javascript
docker build --pull --rm -f "Dockerfile" -t client:latest "."
```` 

### Handling redis with cli
For debugging its helpful using redis command cli, in particoular:
1. `flushall`  clear all stored key/values
2. `get "key"` returns its value
3. `set "key"` sets its value

### Making request without Angular Client
It's possible to deal with node back-end side without using Angular client. To achieve that its possible to use this common method:
1. `curl` with the following syntax:
```` javascript
 curl -X GET -H "Authorization: Bearer xxxx"  localhost:3000/getUsers
 ```` 
2. Using Postman
3. Using Newman (command-line of Postman)