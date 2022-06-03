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
The conversion its handled in the end by `proj4js` lib, so the web application could be defined asa wrapper towards the library.
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

### Logger Singletone

As the name suggest, this module implement a logger class using a `Singletone pattern`. <br>
This pattern ensures that there is only one instance of the logger class. To achieve this, the class has a static function called `getInstance` that create a new instance if there its the first time that its called, otherwise will return the previous created instance.
<br>When its created the first and only instance, obviously will be called the constructor of the class and the logger will be initialized as below:<br>
 1. Name of the log are setted concatenating a prefix string (Node_) and current time in linux epoch.
 2. Requiring `fs` will be created if not exist in the parent folder of working dir a folder called 'Logs' (that is setted as parameter).
 3. The logger is ready 
<br> <br>
The logger class expose these methods:
* LOG_TRADE(...)
* LOG_DEBUG(...)
* LOG_INFO(...) -> wrap a console.log
* LOG_WARNING(...) -> wrap a console.warning
* LOG_ERROR(...) -> wrap a console.error
* LOG_FATAL(...) -> throw an exception stopping the program
That incapsulating the log process (act as wrapper), where the message is written using `appendFileSync` function.
<br>
The message appended at the end of file its format with:
    * Level of log
    * Current time stamp with milliseconds
    * Message

In the project the logger is injected almost in all modules and the message are formatted using the factory design pattern described below.

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
This module use directly proj4js library including it using `require("proj4")`. <br> Export outside different functions such as:
1. `setEPSGRegistry` : Using `proj4jsLIB.defs` function set definition of previously loaded EPSG registry iterating with `forEach` each entries and adding 'EPSG:' to the system name.
2. `convertLatLong` : Perform a conversion of latitude / longitude couple, other this as parameter are passed also source and destination system. Conversion is performed using `forward()` function.